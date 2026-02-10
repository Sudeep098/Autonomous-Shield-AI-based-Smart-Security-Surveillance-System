# 🚀 Quick Start Guide - Autonomous Shield

Get your AI surveillance system running in 5 minutes.

---

## Prerequisites

- ✅ **Node.js** 18+ installed
- ✅ **Python** 3.8+ installed
- ✅ **npm** or **yarn**
- ✅ **pip** (Python package manager)

---

## Step 1: Install Dependencies

### Frontend

```bash
npm install
```

### AI Service

```bash
cd ai-service
pip install -r requirements.txt
cd ..
```

---

## Step 2: Start the System

### Option A: Full System (Recommended)

```bash
npm run start:full
```

This starts both services concurrently:
- Frontend: http://localhost:5000
- AI Service: http://localhost:8000

### Option B: Manual Start (Two Terminals)

**Terminal 1 - AI Service:**
```bash
cd ai-service
python main.py
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## Step 3: Access the Dashboard

Open your browser and navigate to:

**http://localhost:5000**

You should see the **Autonomous Shield** dashboard with:
- ✅ Green "AI Active" indicator (top right)
- ✅ Live detection overlay (center)
- ✅ Threat console (right sidebar)
- ✅ Geospatial map (bottom)

---

## What You'll See

### Header
- 🛡️ Autonomous Shield logo
- 🟢 Connection status indicator
- 📊 YOLOv8-Nano badge

### Main Dashboard (3 Columns)

**Left: System Vitals**
- Total Detections counter
- Critical Alerts
- Suspicious Events
- Frame Rate (20 FPS)
- Latency (<100ms)
- AI Engine info

**Center: Live Video Analysis**
- Simulated camera feed
- Real-time bounding boxes
- Color-coded threats:
  - 🟢 Green = Normal
  - 🟡 Yellow = Suspicious
  - 🔴 Red = Critical

**Right: Threat Console**
- Critical alerts only
- "Management by Exception"
- Alert cards with:
  - Threat type
  - Confidence %
  - GPS location
  - Timestamp
  - Action buttons

**Bottom: Geospatial Map**
- Satellite imagery (Esri)
- Threat markers with GPS
- 200m threat zones
- Clickable popups

---

## Testing the System

### Test 1: Watch Live Detections

1. Observe the **AI Detection Overlay** (center panel)
2. Bounding boxes will appear every 50ms (20 FPS)
3. Watch the color coding:
   - Most detections = Green (normal)
   - Some = Yellow (suspicious)
   - Rare = Red (critical - weapon detected)

### Test 2: Check Threat Console

1. Look at the **Threat Console** (right panel)
2. Wait for a **weapon detection** (happens ~5% of frames)
3. You'll see a **red alert card** with:
   ```
   🔴 CRITICAL THREAT
   Weapon Detected - 92% Confidence
   Location: North Gate
   ```

### Test 3: Geospatial Intelligence

1. Scroll to the **bottom map**
2. Red markers = threat locations
3. Click a marker to see alert details
4. Notice the 200m threat radius circle

### Test 4: WebSocket Connection

1. Open **Browser DevTools** (F12)
2. Go to **Network → WS** tab
3. You should see:
   ```
   ws://localhost:8000/api/ai/stream
   Status: 101 Switching Protocols
   Messages: Streaming at 20 FPS
   ```

---

## Troubleshooting

### ❌ "AI Service Connecting..."

**Problem:** Frontend can't connect to AI service

**Solution:**
```bash
# Check if AI service is running
curl http://localhost:8000

# If not, start it
cd ai-service
python main.py
```

### ❌ Port 8000 Already in Use

**Problem:** Another service is using port 8000

**Solution:**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8000
kill -9 <PID>
```

### ❌ No Detections Appearing

**Problem:** WebSocket connected but no bounding boxes

**Solution:**
1. Check browser console for errors
2. Verify `detections` state is updating
3. Check `mock_detector.py` confidence threshold (default: 60%)

### ❌ Python Module Not Found

**Problem:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd ai-service
pip install -r requirements.txt --upgrade
```

---

## Next Steps

### 1. Customize Detection Parameters

Edit `ai-service/mock_detector.py`:

```python
# Change detection frequency
num_objects = random.randint(0, 10)  # More objects

# Adjust threat probabilities
self.class_distribution = {
    ObjectClass.HUMAN: 0.60,      # 60% humans
    ObjectClass.VEHICLE: 0.20,    # 20% vehicles
    ObjectClass.WEAPON: 0.10,     # 10% weapons (more threats!)
    ObjectClass.UNKNOWN: 0.10
}
```

### 2. Explore Other Pages

Navigate via sidebar:
- **Neural Analytics** - Data visualization
- **Tactical 3D** - Drone fleet management
- **Map View** - Geospatial overview
- **Classic Dashboard** - Original UI (for comparison)

### 3. Read Documentation

- **Full README:** `README.md`
- **AI Service Docs:** `ai-service/README.md`
- **Original Vision:** See artifacts

### 4. Deploy to Production

When ready for real cameras:
1. Replace `MockDetector` with real YOLOv8
2. Integrate WebRTC camera streams
3. Deploy to edge device (Jetson/Raspberry Pi)
4. Configure physical response automation

---

## Quick Reference

| Component | URL/Command |
|-----------|-------------|
| **Frontend** | http://localhost:5000 |
| **AI Service** | http://localhost:8000 |
| **AI WebSocket** | ws://localhost:8000/api/ai/stream |
| **API Health** | http://localhost:8000/api/ai/status |
| **Start All** | `npm run start:full` |
| **AI Only** | `cd ai-service && python main.py` |
| **Frontend Only** | `npm run dev` |

---

## Support

**Issues?**
- Check the `README.md`
- Review `ai-service/README.md`
- Open browser DevTools for frontend errors
- Check terminal logs for backend errors

**Questions?**
Contact Team HackOps Crew

---

**🛡️ Autonomous Shield**  
*Active Intelligence. Zero Compromise.*
