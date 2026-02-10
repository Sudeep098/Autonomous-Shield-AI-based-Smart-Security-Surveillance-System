from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
import cv2
from datetime import datetime
from typing import List, Dict
import time
import uvicorn
from fastapi.responses import StreamingResponse
import io

from mock_detector import MockDetector, ThreatLevel
from mock_fusion import MockFusionEngine
from prediction_engine import ThreatPredictor

# Try to import Vision Engine
try:
    from vision_engine import VisionEngine
    VISION_AVAILABLE = True
except ImportError:
    VisionEngine = None
    VISION_AVAILABLE = False
    print("⚠️  Vision Engine not available - using mock detector")
    print("💡 Install: pip install ultralytics opencv-python")

app = FastAPI(
    title="Autonomous Shield AI Service",
    description="Real-time AI threat detection system (v3.0 Defense Grade)",
    version="3.0.0"
)

# CORS configuration for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles

# ==============================================================================
# CONFIGURATION
# ==============================================================================
# Use 0 for webcam, or HTTP URL for IP Camera
# VIDEO_SOURCE = "http://172.16.4.124:8080/video"
VIDEO_SOURCE = 0

# Global instances
detector = MockDetector(frame_width=1280, frame_height=720)
fusion_engine = MockFusionEngine()
predictor = ThreatPredictor()
vision_engine = None
using_real_vision = False

print(f"🔧 CONFIG: VISION_AVAILABLE={VISION_AVAILABLE}", flush=True)
print(f"🔧 CONFIG: VIDEO_SOURCE={VIDEO_SOURCE}", flush=True)

if VISION_AVAILABLE:
    try:
        print("🚀 Initializing Vision Engine...", flush=True)
        vision_engine = VisionEngine(source=VIDEO_SOURCE)
        vision_engine.start()
        using_real_vision = True
        print("✅ Vision Engine Started", flush=True)
    except Exception as e:
         print(f"❌ Failed to start Vision Engine: {e}", flush=True)
         using_real_vision = False

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ Client connected. Total: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        print(f"❌ Client disconnected. Total: {len(self.active_connections)}")
    
    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error broadcasting: {e}")

manager = ConnectionManager()

async def persist_alert(detection: dict, alert_data: dict):
    """Save critical alert to backend API"""
    try:
        import requests
        # Use shared schema format
        payload = {
            "title": alert_data["title"],
            "message": alert_data["description"],
            "priority": "CRITICAL" if detection.get("threat_level") == "critical" else "HIGH",
            "type": detection.get("class", "UNKNOWN"),
            "stationId": "STATION_SRINAGAR" # Default station
        }
        
        # Post to Node.js backend
        response = requests.post("http://localhost:5000/api/alerts", json=payload)
        if response.status_code == 201:
            print(f"✅ Alert persisted: {payload['title']}")
        else:
            print(f"⚠️ Alert save failed: {response.text}")
            
    except Exception as e:
        print(f"❌ API Error (alert): {e}")

async def save_suspect_to_mongodb(alert_data: dict):
    """Save suspect data to MongoDB via backend API"""
    try:
        import requests
        import time
        
        # Create a copy to avoid modifying original alert
        payload = alert_data.copy()
        
        # Ensure unique detection ID for history by appending timestamp
        # The original detection ID tracks the object, but for history we want each event
        if "detection_id" in payload:
            payload["detection_id"] = f"{payload['detection_id']}_{int(time.time()*1000)}"
            
        # Post suspect data to MongoDB endpoint
        response = requests.post("http://localhost:5000/api/suspects", json=payload, timeout=2)
        if response.status_code in [200, 201]:
            print(f"✅ Suspect saved to MongoDB: {payload.get('detection_id', 'unknown')}")
        else:
            print(f"⚠️ MongoDB suspect save failed: {response.text}")
    except Exception as e:
        # Fail silently - don't block alert flow if MongoDB is down
        print(f"❌ MongoDB Error: {e}")
        pass

async def save_detection(detection: dict):
    """Save ALL detections to database"""
    try:
        from database import AsyncSessionLocal, Detection, generate_id
        import random
        async with AsyncSessionLocal() as db:
            det = Detection(
                detection_id=f"DET_{int(time.time()*1000)}_{random.randint(10000,99999)}",
                camera_id="CAM_MAIN",
                frame_id=detection.get("frame_id", 0),
                object_class=detection["class"],
                confidence=detection["confidence"],
                bbox_x=detection["bbox"]["x"],
                bbox_y=detection["bbox"]["y"],
                bbox_width=detection["bbox"]["width"],
                bbox_height=detection["bbox"]["height"],
                bbox_normalized=detection.get("bbox_normalized"),
                threat_level=detection.get("threat_level", "normal"),
                face_matched="SUSPECT" in detection["class"],
                suspect_name=detection["class"].replace("SUSPECT: ", "") if "SUSPECT" in detection["class"] else None
            )
            db.add(det)
            await db.commit()
    except Exception as e:
        pass  # Silently ignore to prevent log spam

async def create_log(level: str, category: str, action: str, message: str, **context):
    """Unified logging - saves to database"""
    try:
        from database import AsyncSessionLocal, Log, generate_id
        async with AsyncSessionLocal() as db:
            log = Log(
                log_id=generate_id("LOG"),
                level=level,
                category=category,
                action=action,
                message=message,
                module=context.get("module"),
                camera_id=context.get("camera_id"),
                incident_id=context.get("incident_id"),
                user_id=context.get("user_id"),
                meta=context.get("meta")
            )
            db.add(log)
            await db.commit()
    except Exception as e:
        print(f"❌ DB Error (log): {e}")

@app.get("/")
async def root():
    return {
        "service": "Autonomous Shield AI",
        "status": "operational",
        "version": "3.0.0",
        "engine": "YOLOv8-Threaded",
        "timestamp": datetime.utcnow().isoformat()
    }

from database import init_db, get_db, Detection, Alert, Log, Camera, Incident, Setting, DailyStat
from sqlalchemy import select, func

@app.on_event("startup")
async def startup():
    # Initialize Database
    await init_db()
    print("💾 Database Initialized")

    global vision_engine, using_real_vision
    
    if VIDEO_SOURCE is not None and VISION_AVAILABLE:
        print(f"\n👁️  Initializing Vision Engine: {VIDEO_SOURCE}")
        try:
            vision_engine = VisionEngine(source=VIDEO_SOURCE)
            vision_engine.start()
            using_real_vision = True
            print("✅ Vision Engine Started")
        except Exception as e:
            print(f"⚠️  Vision Engine Failed: {e}")
            vision_engine = None
    else:
        print("\n⚠️  Using MOCK DETECTOR (Vision Engine unavailable)")
    
    mode = "REAL YOLOv8" if using_real_vision else "MOCK DETECTOR"
    print(f"\n🛡️  AUTONOMOUS SHIELD - {mode} MODE")
    print("="*60)

@app.on_event("shutdown")
async def shutdown():
    if vision_engine:
        vision_engine.stop()
        print("🛑 Vision Engine Stopped")


@app.get("/api/ai/status")
async def get_model_status():
    """Get AI model status and statistics"""
    mode = "Real YOLOv8" if using_real_vision else "Mock Detector"
    stats = {}
    
    if vision_engine:
         stats = vision_engine.analyze()["stats"]

    return {
        "model": {
            "name": "YOLOv8-Nano",
            "mode": mode,
            "status": "loaded" if using_real_vision else "mock",
            "confidence_threshold": 0.50,
            "input_resolution": stats.get('res', 'Unknown'),
            "inference_time": "~15ms",
            "edge_optimized": True,
            "video_source": str(VIDEO_SOURCE) if VIDEO_SOURCE else "None",
            "using_real_video": using_real_vision
        },
        "statistics": {
            "uptime": "operational",
            "fps": stats.get('fps', 0),
            "status": stats.get('status', 'unknown')
        },
        "classes": ["human", "vehicle", "weapon"],
        "threat_levels": ["normal", "suspicious", "critical"]
    }


@app.post("/api/ai/detect")
async def detect_frame():
    """
    Perform object detection on a single frame
    In production, this would accept image data
    """
    detections = detector.detect_frame()
    
    # Count threats by level
    threat_summary = {
        "total": len(detections),
        "critical": sum(1 for d in detections if d["threat_level"] == "critical"),
        "suspicious": sum(1 for d in detections if d["threat_level"] == "suspicious"),
        "normal": sum(1 for d in detections if d["threat_level"] == "normal")
    }
    
    # Generate alerts for critical threats
    alerts = []
    for det in detections:
        if det["threat_level"] == "critical":
            alert = detector.generate_threat_alert(det)
            if alert:
                alerts.append(alert)
    
    return {
        "success": True,
        "detections": detections,
        "summary": threat_summary,
        "alerts": alerts,
        "timestamp": datetime.utcnow().isoformat()
    }

# MJPEG Streaming Generator - Maximum Performance
def generate_frames():
    consecutive_errors = 0
    while True:
        if vision_engine and vision_engine.camera:
            frame = vision_engine.camera.get_frame()
            if frame is not None:
                consecutive_errors = 0
                # Lowest quality for fastest streaming
                _, buffer = cv2.imencode('.jpg', frame, [int(cv2.IMWRITE_JPEG_QUALITY), 30])
                yield (b'--frame\r\n'
                       b'Content-Type: image/jpeg\r\n\r\n' + buffer.tobytes() + b'\r\n')
            else:
                consecutive_errors += 1
                if consecutive_errors % 100 == 0:
                     print(f"⚠️ Warning: Camera returning None (x{consecutive_errors})")
                time.sleep(0.01)
        else:
            time.sleep(0.01)

@app.get("/api/ai/video_feed")
def video_feed():
    """Stream real-time video via MJPEG"""
    if not VISION_AVAILABLE or not vision_engine:
         return JSONResponse(status_code=503, content={"error": "Vision engine not available"})
    
    return StreamingResponse(generate_frames(), media_type="multipart/x-mixed-replace; boundary=frame")

# ==============================================================================
# SUSPECT MANAGEMENT API
# ==============================================================================
import os
import shutil
from fastapi import UploadFile, File

KNOWN_FACES_DIR = "assets/known_faces"
os.makedirs(KNOWN_FACES_DIR, exist_ok=True)

# Mount static files to serve images
app.mount("/api/suspects/image", StaticFiles(directory=KNOWN_FACES_DIR), name="suspects")

@app.get("/api/suspects")
def list_suspects():
    """List all registered suspects"""
    files = []
    if os.path.exists(KNOWN_FACES_DIR):
        for f in os.listdir(KNOWN_FACES_DIR):
            if f.endswith(('.jpg', '.jpeg', '.png')):
                files.append(f)
    return {"suspects": files}

@app.post("/api/suspects")
async def upload_suspect(file: UploadFile = File(...)):
    """Upload a new suspect image"""
    file_path = os.path.join(KNOWN_FACES_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Trigger reload if vision engine is active
    if vision_engine and vision_engine.face_recognizer:
        vision_engine.face_recognizer.reload()
        
    return {"status": "uploaded", "filename": file.filename}

@app.delete("/api/suspects/{filename}")
def delete_suspect(filename: str):
    """Delete a suspect"""
    file_path = os.path.join(KNOWN_FACES_DIR, filename)
    if os.path.exists(file_path):
        os.remove(file_path)
        
        # Trigger reload
        if vision_engine and vision_engine.face_recognizer:
            vision_engine.face_recognizer.reload()
            
        return {"status": "deleted", "filename": filename}
    return JSONResponse(status_code=404, content={"error": "File not found"})

# WebSocket for real-time AI metadata
@app.websocket("/api/ai/stream")
async def websocket_stream(websocket: WebSocket):
    """
    WebSocket endpoint for continuous detection stream
    Simulates real-time YOLOv8 inference at 20 FPS
    """
    await manager.connect(websocket)
    
    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connection",
            "status": "connected",
            "message": "Autonomous Shield AI Stream Active",
            "timestamp": datetime.utcnow().isoformat()
        })
        
        # Continuous detection loop
        frame_count = 0
        while True:
            # Throttle to ~30 FPS (0.033s)
            await asyncio.sleep(0.033)
            
            # Perform detection (real or mock)
            if using_real_vision and vision_engine:
                 analysis = vision_engine.analyze()
                 detections = analysis["detections"]
                 current_frame_id = frame_count
            else:
                # Mock fallback
                detections = detector.detect_frame()
                current_frame_id = frame_count

            # Send frame analysis
            frame_data = {
                "type": "frame_analysis",
                "frame_id": current_frame_id,
                "detections": detections,
                "mode": "real" if using_real_vision else "mock",
                "timestamp": datetime.now().isoformat(),
                "fusion": fusion_engine.update(),
                "predictions": predictor.predict_risks() if frame_count % 300 == 0 else None
            }
            
            try:
                await websocket.send_json(frame_data)
            except RuntimeError:
                # Connection likely closed
                break
            
            # Save detections every 30 frames
            if frame_count % 30 == 0:
                for det in detections:
                    asyncio.create_task(save_detection(det))
            
            # Create alerts for critical threats
            for det in detections:
                if det["threat_level"] in ["critical", "suspicious"]:
                    alert_data = detector.generate_threat_alert(det)
                    if alert_data:
                         await manager.broadcast({
                             "type": "critical_alert",
                             "alert": alert_data
                         })
                         asyncio.create_task(persist_alert(det, alert_data))
                         asyncio.create_task(save_suspect_to_mongodb(alert_data))
            
            frame_count += 1
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"🔌 WebSocket disconnected normally")
    except Exception as e:
        # Ignore "Cannot call send" error if it happens elsewhere
        if "Cannot call" in str(e):
             manager.disconnect(websocket)
             return
        print(f"❌ WebSocket error: {e}")
        import traceback
        traceback.print_exc()
        manager.disconnect(websocket)


@app.get("/api/ai/statistics")
async def get_statistics():
    """Get real-time detection statistics"""
    return {
        "detections": {
            "total": detector.detection_count,
            "rate": "20 FPS",
            "confidence_threshold": "60%"
        },
        "performance": {
            "inference_time": "~15ms",
            "latency": "<100ms",
            "edge_device": "Simulated Jetson Nano"
        },
        "alert_stats": {
            "critical_alerts": "Real-time",
            "response_time": "<2 seconds",
            "false_positive_rate": "<5%"
        }
    }


if __name__ == "__main__":
    print("\n" + "="*60)
    print("🛡️  AUTONOMOUS SHIELD AI SERVICE")
    print("="*60)
    print("🚀 Starting FastAPI server...")
    print("📡 WebSocket: ws://localhost:8000/api/ai/stream")
    print("🌐 REST API:  http://localhost:8000/api/ai/detect")
    print("📊 Status:    http://localhost:8000/api/ai/status")
    print("="*60 + "\n")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
