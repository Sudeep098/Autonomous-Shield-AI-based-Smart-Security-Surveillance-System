# AI Service - Autonomous Shield Backend

## 🛡️ Overview

This is the Python-based AI service that powers the **Autonomous Shield** surveillance system. It provides real-time object detection using YOLOv8 (mock implementation for demonstration) and streams threat alerts via WebSocket.

## 🎯 Features

- **Real-time Object Detection**: Simulates YOLOv8-Nano inference at 20 FPS
- **Threat Classification**: Categorizes detections as Normal, Suspicious, or Critical
- **WebSocket Streaming**: Low-latency alert distribution (<100ms)
- **RESTful API**: HTTP endpoints for  integration and testing
- **Edge-Ready Architecture**: Designed for deployment on NVIDIA Jetson / Raspberry Pi

## 📦 Installation

### Prerequisites

- Python 3.8+
- pip

### Install Dependencies

```bash
cd ai-service
pip install -r requirements.txt
```

### 3. Facial Recognition
The system checks `ai-service/assets/known_faces` for images of authorized personnel.
1. Add `.jpg` photos of people to `ai-service/assets/known_faces`.
2. Name the files `first_last.jpg` (e.g., `john_doe.jpg`).
3. Restart the AI service. The system will load them on startup and label detections with the person's name.

### 4. Vehicle License Plate Recognition (ALPR)
The system automatically detects text on vehicles (Car, Truck, Bus, Motorcycle).
- **Trigger**: Detections with high confidence (>60%).
- **Alert**: If a plate contains "STOLEN" or "BAD", it triggers a Critical Alert.
- **Engine**: Uses `EasyOCR` (runs on CPU by default for compatibility).

## 🚀 Running the Service

### Development Mode

```bash
python main.py
```

The service will start on `http://localhost:8000`

### Production Mode (with Uvicorn)

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 📡 API Endpoints

### REST API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/api/ai/status` | GET | AI model status and statistics |
| `/api/ai/detect` | POST | Single-frame detection |
| `/api/ai/statistics` | GET | Real-time detection stats |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `ws://localhost:8000/api/ai/stream` | Continuous detection stream @ 20 FPS |

## 🧪 Testing

### Test Detection Engine

```bash
python mock_detector.py
```

This will simulate 10 frames of detections with random threats.

### Test WebSocket Stream

1. Start the AI service:
   ```bash
   python main.py
   ```

2. Connect from frontend (already configured in `AutonomousShield.tsx`):
   ```javascript
   const ws = new WebSocket('ws://localhost:8000/api/ai/stream');
   ```

## 📊 Detection Output Format

### Frame Analysis Message

```json
{
  "type": "frame_analysis",
  "frame_id": 123,
  "detections": [
    {
      "id": "det_1",
      "class": "human",
      "confidence": 0.92,
      "bbox": {
        "x": 120,
        "y": 200,
        "width": 150,
        "height": 300
      },
      "threat_level": "normal",
      "timestamp": "2026-02-06T11:30:00.000Z",
      "frame_id": 1707222600000
    }
  ],
  "timestamp": "2026-02-06T11:30:00.000Z"
}
```

### Critical Alert Message

```json
{
  "type": "critical_alert",
  "alert": {
    "alert_id": "alert_1707222600123",
    "type": "CRITICAL_THREAT",
    "object": "weapon",
    "confidence": "92%",
    "location": "North Gate",
    "coordinates": {
      "lat": 28.6139,
      "lng": 77.2090
    },
    "description": "Weapon detected with 92% confidence at North Gate",
    "timestamp": "2026-02-06T11:30:00.000Z",
    "requires_action": true
  }
}
```

## 🔧 Configuration

### Detection Parameters

Edit in `mock_detector.py`:

```python
# Confidence threshold (default: 60%)
if confidence < 0.60:
    continue

# Frame resolution
detector = MockDetector(frame_width=1280, frame_height=720)

# Detection probabilities
self.class_distribution = {
    ObjectClass.HUMAN: 0.70,      # 70%
    ObjectClass.VEHICLE: 0.15,    # 15%
    ObjectClass.WEAPON: 0.05,     # 5%
    ObjectClass.UNKNOWN: 0.10     # 10%
}
```

## 🎨 Integration with Frontend

The frontend (`AutonomousShield.tsx`) automatically connects to the WebSocket stream:

```typescript
const ws = new WebSocket('ws://localhost:8000/api/ai/stream');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  if (data.type === 'frame_analysis') {
    // Update detections visualization
  }
  
  if (data.type === 'critical_alert') {
    // Display threat alert
  }
};
```

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t autonomous-shield-ai .
docker run -p 8000:8000 autonomous-shield-ai
```

### Edge Deployment (Jetson/Raspberry Pi)

For production deployment with real YOLOv8:

1. Uncomment YOLOv8 dependencies in `requirements.txt`:
   ```
   ultralytics>=8.0.0
   torch>=2.0.0
   opencv-python>=4.8.0
   ```

2. Replace `MockDetector` with real YOLOv8 inference
3. Optimize model using INT8 quantization for edge devices

## 📈 Performance

| Metric | Value |
|--------|-------|
| **FPS** | 20 (configurable) |
| **Latency** | <100ms end-to-end |
| **Confidence Threshold** | 60% |
| **Detection Classes** | human, vehicle, weapon |
| **Threat Levels** | normal, suspicious, critical |

## 🔄 Comparison: Current vs Original Vision

### Current Implementation (Mock)

✅ FastAPI backend with WebSocket support
✅ Mock YOLOv8 detection engine  
✅ Real-time threat classification  
✅ GPS-tagged alerts  
✅ Management by exception alerts  

### Production (Real YOLOv8)

☐ Replace `MockDetector` with real YOLOv8 model  
☐ Add WebRTC video input pipeline  
☐ Implement frame filtering (background subtraction)  
☐ Add model quantization for edge  
☐ Integrate physical camera streams  

## 📚 Architecture

```
┌─────────────────────────────────────────┐
│         Frontend Dashboard              │
│    (AutonomousShield.tsx)               │
└──────────────┬──────────────────────────┘
               │ WebSocket
┌──────────────▼──────────────────────────┐
│         FastAPI Backend                 │
│         (main.py)                       │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│      YOLOv8 Detection Engine            │
│      (mock_detector.py)                 │
└─────────────────────────────────────────┘
```

## 🆘 Troubleshooting

### WebSocket Connection Failed

- Ensure AI service is running on port 8000
- Check firewall settings
- Verify CORS configuration in `main.py`

### No Detections Appearing

- Check console logs for WebSocket messages
- Verify detection threshold (default: 60%)
- Increase detection frequency in `mock_detector.py`

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is part of the Autonomous Shield surveillance system. For questions or contributions, please contact the HackOps Crew team.

---

**Built with ❤️ by Team HackOps Crew**  
*Transforming surveillance from passive recording to active intelligence*
