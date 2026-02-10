"""
Vision Engine - Defense Grade (Performance Optimized)
Non-blocking threaded camera capture with minimal latency.
"""

import cv2
import threading
import time
from typing import Optional, List, Dict, Union
from datetime import datetime
import numpy as np
import os

try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

try:
    import insightface
    from insightface.app import FaceAnalysis
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False


class ThreadedCamera:
    """
    High-performance background thread for capturing frames.
    Uses double buffering for smooth playback.
    """
    def __init__(self, source: Union[int, str]):
        self.source = source
        self.lock = threading.Lock()
        self.running = False
        self.latest_frame = None
        self.status = "stopped"
        self.fps = 0
        self.frame_count = 0
        self.thread = None
        self.resolution = (640, 480)
        self.cap = None

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._capture_loop, daemon=True)
        self.thread.start()
        self.status = "starting"
        print(f"📷 Camera thread started for source: {self.source}")

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join(timeout=2.0)
        if self.cap:
            self.cap.release()
        self.status = "stopped"
        print("📷 Camera thread stopped")

    def _capture_loop(self):
        # Initialize camera with optimized settings
        source = self.source
        if isinstance(source, str) and source.isdigit():
            source = int(source)
        
        # Use DirectShow on Windows for better performance
        if isinstance(source, int):
            self.cap = cv2.VideoCapture(source, cv2.CAP_DSHOW)
        else:
            self.cap = cv2.VideoCapture(source)
        
        if not self.cap.isOpened():
            print(f"❌ Failed to open camera: {self.source}")
            self.status = "error"
            self.running = False
            return
        
        # Optimize camera settings for performance
        self.cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)  # Lower resolution = faster
        self.cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        self.cap.set(cv2.CAP_PROP_FPS, 30)
        self.cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)  # Minimal buffer for low latency
        self.cap.set(cv2.CAP_PROP_FOURCC, cv2.VideoWriter_fourcc(*'MJPG'))  # Use MJPG codec
        
        # Get actual resolution
        self.resolution = (
            int(self.cap.get(cv2.CAP_PROP_FRAME_WIDTH)),
            int(self.cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        )
        print(f"✅ Camera ready: {self.resolution[0]}x{self.resolution[1]}")
        
        self.status = "active"
        last_fps_time = time.time()
        frame_counter = 0

        while self.running:
            ret, frame = self.cap.read()
            if ret:
                # Mirror the frame and store
                frame = cv2.flip(frame, 1)
                with self.lock:
                    self.latest_frame = frame
                    self.frame_count += 1
                
                frame_counter += 1
                
                # Calculate FPS every second
                now = time.time()
                if now - last_fps_time >= 1.0:
                    self.fps = frame_counter
                    frame_counter = 0
                    last_fps_time = now
            else:
                # Brief pause on frame grab failure
                time.sleep(0.01)
        
        self.cap.release()

    def get_frame(self) -> Optional[np.ndarray]:
        with self.lock:
            return self.latest_frame  # Return direct reference, no copy needed for read


class InsightFaceRecognizer:
    def __init__(self, known_faces_dir="assets/known_faces"):
        self.app = None
        self.known_embeddings = []
        self.known_names = []
        self.is_active = False
        
        if INSIGHTFACE_AVAILABLE:
            try:
                print("👤 Loading InsightFace (Buffalo_L)...")
                self.app = FaceAnalysis(name='buffalo_l')
                self.app.prepare(ctx_id=0, det_size=(640, 640))
                print("✅ InsightFace Loaded")
                self.reload(known_faces_dir)
            except Exception as e:
                print(f"❌ Failed to load InsightFace: {e}")
        else:
            print("❌ InsightFace module not found")

    def reload(self, directory="assets/known_faces"):
        self.known_embeddings = []
        self.known_names = []
        self.is_active = False
        
        if not os.path.exists(directory):
            os.makedirs(directory, exist_ok=True)
            return

        print(f"👤 Processing Known Faces from {directory}...")
        for filename in os.listdir(directory):
            if filename.endswith((".jpg", ".png", ".jpeg")):
                path = os.path.join(directory, filename)
                try:
                    img = cv2.imread(path)
                    faces = self.app.get(img)
                    if len(faces) > 0:
                        face = max(faces, key=lambda x: (x.bbox[2]-x.bbox[0]) * (x.bbox[3]-x.bbox[1]))
                        self.known_embeddings.append(face.embedding)
                        name = os.path.splitext(filename)[0].replace("_", " ").title()
                        self.known_names.append(name)
                        print(f"  ✅ Loaded: {name}")
                except Exception as e:
                    print(f"  ❌ Failed to load {filename}: {e}")
        
        if self.known_embeddings:
            self.is_active = True
            print(f"✅ Facial Recognition Active: {len(self.known_names)} identities.")

    def identify_face(self, embedding, threshold=0.5):
        if not self.known_embeddings:
            return "Unknown", 0.0
        
        best_match = "Unknown"
        best_score = 0.0
        
        for i, known_emb in enumerate(self.known_embeddings):
            # Cosine similarity
            sim = np.dot(embedding, known_emb) / (np.linalg.norm(embedding) * np.linalg.norm(known_emb))
            if sim > threshold and sim > best_score:
                best_score = sim
                best_match = self.known_names[i]
        
        return best_match, best_score


class VisionEngine:
    def __init__(self, source: Union[int, str] = 0):
        self.camera = ThreadedCamera(source)
        self.model = None
        self.is_ready = False
        self.last_detections = []
        self.detection_interval = 5  # Run detection every 5th frame to reduce lag
        self.frame_counter = 0
        
        if YOLO_AVAILABLE:
            print("🧠 Loading YOLOv11...")
            try:
                self.model = YOLO("yolo11n.pt")
                self.is_ready = True
                print("✅ YOLOv11 Ready")
            except:
                try:
                    self.model = YOLO("yolov8n.pt")
                    self.is_ready = True
                    print("✅ YOLOv8 Ready (fallback)")
                except:
                    print("❌ All YOLO models failed")
        
        self.face_recognizer = InsightFaceRecognizer()

    def start(self):
        self.camera.start()

    def stop(self):
        self.camera.stop()

    def analyze(self) -> Dict:
        frame = self.camera.get_frame()
        self.frame_counter += 1
        
        # Return cached detections if not time to analyze
        if self.frame_counter % self.detection_interval != 0:
            return {
                "detections": self.last_detections,
                "stats": {
                    "fps": self.camera.fps,
                    "status": self.camera.status,
                    "res": f"{self.camera.resolution[0]}x{self.camera.resolution[1]}"
                }
            }
        
        detections = []
        
        if frame is not None and self.is_ready and self.model:
            try:
                h, w = frame.shape[:2]
                
                # Run YOLO detection
                results = self.model(frame, verbose=False, conf=0.5)[0]
                
                # Face recognition (if suspects registered)
                face_identities = {}
                if self.face_recognizer.is_active:
                    faces = self.face_recognizer.app.get(frame)
                    for face in faces:
                        name, score = self.face_recognizer.identify_face(face.embedding)
                        if name != "Unknown":
                            cx = int((face.bbox[0] + face.bbox[2]) / 2)
                            cy = int((face.bbox[1] + face.bbox[3]) / 2)
                            face_identities[(cx, cy)] = name

                for idx, box in enumerate(results.boxes):
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    label = self.model.names[cls_id]
                    
                    threat_level = "normal"
                    final_label = label
                    
                    # Check for suspect match
                    if label == 'person' and face_identities:
                        pcx = (x1 + x2) / 2
                        pcy = (y1 + y2) / 2
                        for (fcx, fcy), name in face_identities.items():
                            if x1 < fcx < x2 and y1 < fcy < y2:
                                final_label = f"SUSPECT: {name}"
                                threat_level = "critical"
                                break
                    
                    
                    # Weapon detection (Added 'cell phone' for demo purposes)
                    if label in ['knife', 'gun', 'weapon', 'scissors', 'cell phone']:
                        threat_level = "critical"
                    
                    # Mark all persons as suspicious for demo activity
                    if label == 'person' and threat_level == "normal":
                        threat_level = "suspicious"
                    
                    detections.append({
                        "id": f"det_{self.camera.frame_count}_{idx}",
                        "class": final_label,
                        "confidence": round(conf, 2),
                        "bbox": {
                            "x": int(x1),
                            "y": int(y1),
                            "width": int(x2 - x1),
                            "height": int(y2 - y1)
                        },
                        "bbox_normalized": [
                            float(x1 / w),
                            float(y1 / h),
                            float((x2 - x1) / w),
                            float((y2 - y1) / h)
                        ],
                        "threat_level": threat_level,
                        "frame_id": self.camera.frame_count,
                        "timestamp": datetime.now().isoformat()
                    })
                    
            except Exception as e:
                print(f"Inference Error: {e}")
        
        self.last_detections = detections
        
        return {
            "detections": detections,
            "stats": {
                "fps": self.camera.fps,
                "status": self.camera.status,
                "res": f"{self.camera.resolution[0]}x{self.camera.resolution[1]}"
            }
        }
