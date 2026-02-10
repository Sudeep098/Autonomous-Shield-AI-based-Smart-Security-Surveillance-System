"""
Real-time Video Processing with YOLOv8
Connects to phone camera via RTSP or uses webcam
Provides real object detection for Autonomous Shield
"""

import cv2
from ultralytics import YOLO
import time
from typing import List, Dict, Optional
from datetime import datetime


class VideoStream:
    """
    Video stream processor with YOLOv8 detection
    
    Supports:
    - Phone camera via RTSP (IP Webcam app)
    - Webcam (USB/built-in)
    - Video files
    """
    
    def __init__(self, source: str = 0):
        """
        Initialize video stream
        
        Args:
            source: Video source
                - 0, 1, 2... = Webcam/USB camera
                - "rtsp://..." = IP camera (phone)
                - "video.mp4" = Video file
                - "http://..." = HTTP stream
        """
        self.source = source
        self.model = None
        self.cap = None
        self.frame_count = 0
        self.is_connected = False
        
        # Video properties
        self.width = 0
        self.height = 0
        self.fps = 0
        
        # Performance tracking
        self.last_fps_time = time.time()
        self.fps_counter = 0
        self.actual_fps = 0
        
    def load_model(self):
        """Load YOLOv8 model"""
        print("🧠 Loading YOLOv8 Nano model...")
        try:
            self.model = YOLO('yolov8n.pt')
            print("✅ YOLOv8 model loaded successfully")
            return True
        except Exception as e:
            print(f"❌ Failed to load YOLOv8: {e}")
            print("💡 Run: pip install ultralytics")
            return False
        
    def connect(self) -> bool:
        """
        Connect to video source
        
        Returns:
            True if connected successfully
        """
        print(f"📹 Connecting to video source: {self.source}")
        
        try:
            self.cap = cv2.VideoCapture(self.source)
            
            # Wait for connection
            time.sleep(1)
            
            if not self.cap.isOpened():
                print(f"❌ Failed to open video source: {self.source}")
                return False
            
            # Get video properties
            self.width = int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.height = int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.fps = int(self.cap.get(cv2.CAP_PROP_FPS))
            
            # RTSP streams often report 0 FPS
            if self.fps == 0:
                self.fps = 20  # Default for IP cameras
            
            self.is_connected = True
            
            print(f"✅ Connected successfully")
            print(f"   Resolution: {self.width}x{self.height}")
            print(f"   FPS: {self.fps}")
            
            return True
            
        except Exception as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def get_frame(self) -> Optional[any]:
        """
        Read a single frame from video stream
        
        Returns:
            Frame as numpy array, or None if failed
        """
        if not self.cap or not self.is_connected:
            return None
        
        ret, frame = self.cap.read()
        
        if not ret:
            print("⚠️ Failed to read frame")
            return None
        
        # Update FPS counter
        self.fps_counter += 1
        current_time = time.time()
        if current_time - self.last_fps_time >= 1.0:
            self.actual_fps = self.fps_counter
            self.fps_counter = 0
            self.last_fps_time = current_time
        
        return frame
    
    def detect(self, frame) -> List[Dict]:
        """
        Run YOLOv8 detection on frame
        
        Args:
            frame: Video frame (numpy array)
            
        Returns:
            List of detections in Autonomous Shield format
        """
        if self.model is None:
            print("⚠️ Model not loaded, attempting to load...")
            if not self.load_model():
                return []
        
        try:
            # Run YOLOv8 inference
            results = self.model(
                frame,
                conf=0.6,       # 60% confidence threshold
                iou=0.45,       # Non-max suppression
                max_det=20,     # Max 20 detections per frame
                verbose=False   # Suppress output
            )[0]
            
            detections = []
            
            # Parse results
            for idx, box in enumerate(results.boxes):
                # Extract bounding box coordinates
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Extract confidence and class
                confidence = float(box.conf[0])
                class_id = int(box.cls[0])
                class_name = results.names[class_id]
                
                # Classify threat level
                threat_level = self._classify_threat(class_name, confidence)
                
                # Create detection object (matches mock_detector format)
                detection = {
                    "id": f"det_{self.frame_count}_{idx}",
                    "class": class_name.lower(),
                    "confidence": round(confidence, 2),
                    "bbox": {
                        "x": int(x1),
                        "y": int(y1),
                        "width": int(x2 - x1),
                        "height": int(y2 - y1)
                    },
                    "threat_level": threat_level,
                    "timestamp": datetime.utcnow().isoformat(),
                    "frame_id": self.frame_count
                }
                
                detections.append(detection)
            
            self.frame_count += 1
            return detections
            
        except Exception as e:
            print(f"❌ Detection error: {e}")
            return []
    
    def _classify_threat(self, class_name: str, confidence: float) -> str:
        """
        Classify threat level based on detected object
        
        Args:
            class_name: YOLOv8 class name
            confidence: Detection confidence
            
        Returns:
            "critical", "suspicious", or "normal"
        """
        # Critical threats (weapons)
        critical_objects = [
            'knife', 'gun', 'rifle', 'scissors', 'sword'
        ]
        
        # Suspicious (high-confidence person, vehicle at night, etc.)
        suspicious_objects = [
            'person', 'backpack', 'handbag', 'suitcase'
        ]
        
        class_lower = class_name.lower()
        
        # Critical threat
        if any(weapon in class_lower for weapon in critical_objects):
            return 'critical'
        
        # Suspicious (high confidence person)
        if class_lower in suspicious_objects and confidence > 0.85:
            return 'suspicious'
        
        # Normal
        return 'normal'
    
    def get_stats(self) -> Dict:
        """Get stream statistics"""
        return {
            "connected": self.is_connected,
            "resolution": f"{self.width}x{self.height}",
            "fps": self.actual_fps,
            "frames_processed": self.frame_count,
            "source": str(self.source)
        }
    
    def release(self):
        """Close video stream"""
        if self.cap:
            self.cap.release()
            self.is_connected = False
            print("📹 Video stream closed")

import urllib.request
import numpy as np

class SnapshotStream:
    """
    Robust video stream that polls snapshots instead of continuous video
    Much more stable for WiFi phone cameras
    """
    def __init__(self, url):
        self.url = url
        if not self.url.endswith("/shot.jpg"):
            # Convert video URL to snapshot URL for IP Webcam
            # http://x.x.x.x:8080/video -> http://x.x.x.x:8080/shot.jpg
            base = self.url.rsplit('/', 1)[0]
            self.url = f"{base}/shot.jpg"
            
        self.frame_count = 0
        self.is_connected = False
        
    def load_model(self):
        """Pass-through to VideoStream logic or handle independently"""
        # This helper is used by main.py, so we mock it or use the parent's logic
        # For simplicity, we assume main.py handles model loading separately or we attach it
        try:
            from ultralytics import YOLO
            self.model = YOLO('yolov8n.pt')
            return True
        except:
            return False

    def connect(self):
        print(f"📷 Connecting to Snapshot Poller: {self.url}")
        try:
            # Test connection
            with urllib.request.urlopen(self.url, timeout=2) as stream:
                if stream.status == 200:
                    print("✅ Snapshot connection successful")
                    self.is_connected = True
                    return True
        except Exception as e:
            print(f"❌ Snapshot connection failed: {e}")
        return False
        
    def get_frame(self):
        try:
            with urllib.request.urlopen(self.url, timeout=2) as stream:
                bytes_data = stream.read()
                arr = np.frombuffer(bytes_data, np.uint8)
                frame = cv2.imdecode(arr, -1)
                return frame
        except Exception as e:
            # print(f"⚠️ Snapshot frame failed: {e}")
            return None
            
    def detect(self, frame):
        # Re-use the detect logic from VideoStream
        # We'll need to instantiate VideoStream to use its detect method
        # or duplicate the logic. Let's redirect to a helper or just duplicate for safety.
        # Ideally, main.py should handle detection, but it calls stream.detect()
        
        # Quick-fix: Duplicate minimal logic or instantiate
        if not hasattr(self, 'model'):
            return []
            
        results = self.model(frame, conf=0.6, verbose=False)[0]
        detections = []
        for idx, box in enumerate(results.boxes):
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = results.names[class_id]
            
            # Simple threat classification
            threat_level = 'normal'
            if class_name in ['knife', 'gun', 'rifle']: threat_level = 'critical'
            elif class_name == 'person' and confidence > 0.85: threat_level = 'suspicious'
            
            detections.append({
                "id": f"det_{self.frame_count}_{idx}",
                "class": class_name.lower(),
                "confidence": round(confidence, 2),
                "bbox": {"x": int(x1), "y": int(y1), "width": int(x2-x1), "height": int(y2-y1)},
                "threat_level": threat_level,
                "timestamp": datetime.utcnow().isoformat(),
                "frame_id": self.frame_count
            })
        self.frame_count += 1
        return detections
        
    def get_stats(self):
        return {
            "connected": self.is_connected,
            "resolution": "Variable (Snapshot)",
            "fps": "~10 (Polling)",
            "mode": "Snapshot Protocol"
        }
        
    def release(self):
        self.is_connected = False


# Test the video stream
if __name__ == "__main__":
    import sys
    
    print("\n" + "="*60)
    print("🛡️  AUTONOMOUS SHIELD - VIDEO STREAM TEST")
    print("="*60 + "\n")
    
    # Get source from command line or use default
    if len(sys.argv) > 1:
        source = sys.argv[1]
        # Try to convert to int if it's a number (webcam)
        try:
            source = int(source)
        except:
            pass
    else:
        # Default: webcam
        source = 0
        print("💡 Usage: python video_stream.py <source>")
        print("   Examples:")
        print("     python video_stream.py 0  (webcam)")
        print("     python video_stream.py rtsp://192.168.1.100:8080/h264_ulaw.sdp")
        print("")
        print("Using default: Webcam (0)\n")
    
    # Create stream
    stream = VideoStream(source=source)
    
    # Load model
    if not stream.load_model():
        print("\n❌ Cannot proceed without YOLOv8")
        print("📦 Install: pip install ultralytics opencv-python")
        sys.exit(1)
    
    # Connect to video
    if not stream.connect():
        print("\n❌ Failed to connect to video source")
        sys.exit(1)
    
    print("\n🎬 Starting real-time detection...")
    print("Press 'q' to quit\n")
    
    try:
        while True:
            # Get frame
            frame = stream.get_frame()
            if frame is None:
                print("⚠️ No frame received, retrying...")
                time.sleep(0.1)
                continue
            
            # Run detection
            detections = stream.detect(frame)
            
            # Draw bounding boxes
            for det in detections:
                bbox = det['bbox']
                x1, y1 = bbox['x'], bbox['y']
                x2, y2 = x1 + bbox['width'], y1 + bbox['height']
                
                # Color based on threat level
                if det['threat_level'] == 'critical':
                    color = (0, 0, 255)  # Red
                elif det['threat_level'] == 'suspicious':
                    color = (0, 165, 255)  # Orange
                else:
                    color = (0, 255, 0)  # Green
                
                # Draw box
                cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
                
                # Draw label
                label = f"{det['class']} {int(det['confidence']*100)}%"
                cv2.putText(frame, label, (x1, y1-10),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
            
            # Display stats
            stats = stream.get_stats()
            info_text = f"FPS: {stats['fps']} | Detections: {len(detections)} | Frame: {stream.frame_count}"
            cv2.putText(frame, info_text, (10, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show frame
            cv2.imshow('Autonomous Shield - Live Detection', frame)
            
            # Print detections
            if detections:
                print(f"Frame {stream.frame_count}: {len(detections)} objects detected")
                for det in detections:
                    emoji = "🔴" if det['threat_level'] == 'critical' else "🟡" if det['threat_level'] == 'suspicious' else "🟢"
                    print(f"  {emoji} {det['class']:<15} {det['confidence']:.0%} [{det['threat_level']}]")
            
            # Check for quit
            if cv2.waitKey(1) & 0xFF == ord('q'):
                print("\n👋 Stopping...")
                break
    
    except KeyboardInterrupt:
        print("\n\n⚠️ Interrupted by user")
    
    finally:
        stream.release()
        cv2.destroyAllWindows()
        
        # Print final stats
        stats = stream.get_stats()
        print("\n" + "="*60)
        print("📊 SESSION STATS")
        print("="*60)
        print(f"Frames Processed: {stats['frames_processed']}")
        print(f"Average FPS: {stats['fps']}")
        print(f"Resolution: {stats['resolution']}")
        print("="*60 + "\n")
