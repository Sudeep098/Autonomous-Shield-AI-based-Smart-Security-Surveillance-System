# 📱 Phone Camera Setup Guide

Quick guide to connect your phone as the surveillance camera.

---

## Step 1: Install App on Phone

### Android - IP Webcam (Recommended)

1. **Download App**
   - Open Play Store
   - Search: "IP Webcam" by Pavel Khlebovich
   - Install (Free)

2. **Configure Settings**
   - Open IP Webcam app
   - Scroll to "Video preferences"
   - Set:
     ```
     Resolution: 1280x720 (720p)
     Quality: 80%
     FPS limit: 20
     Orientation: Landscape
     Focus mode: Continuous autofocus
     ```

3. **Start Server**
   - Scroll to bottom
   - Tap **"Start server"**
   - Note the URLs shown:
     ```
     IPv4: http://192.168.1.100:8080
     RTSP: rtsp://192.168.1.100:8080/h264_ulaw.sdp
     ```
   - **⚠️ Your IP will be different!**

### iOS - IP Camera Lite

1. **Download App**
   - Open App Store
   - Search: "IP Camera Lite"
   - Install (Free)

2. **Start Streaming**
   - Enable RTSP Server
   - Note the RTSP URL

---

## Step 2: Install YOLOv8 on PC

```bash
cd ai-service

# Install YOLOv8 + OpenCV (~500MB download)
pip install ultralytics opencv-python

# This will also install:
# - PyTorch (~200MB)
# - Numpy
# - Other dependencies
```

**First run will auto-download YOLOv8 model (6MB)**

---

## Step 3: Configure AI Service

### Edit `ai-service/main.py`

Find this section (around line 44):

```python
# ==============================================================================
# CONFIGURATION - Update this to use your phone camera!
# ==============================================================================

VIDEO_SOURCE = None  # Change this!
```

**Replace with your phone's RTSP URL:**

```python
# Use your phone's IP address
VIDEO_SOURCE = "rtsp://192.168.1.100:8080/h264_ulaw.sdp"
```

**Or use webcam for testing:**

```python
VIDEO_SOURCE = 0  # Built-in webcam
```

---

## Step 4: Start the System

### Terminal 1 - AI Service

```bash
cd ai-service
python main.py
```

**Look for this output:**

```
📹 Attempting to connect to video source: rtsp://192.168.1.100:8080/...
🧠 Loading YOLOv8 Nano model...
✅ YOLOv8 model loaded successfully
📹 Connecting to video source: rtsp://...
✅ Connected successfully
   Resolution: 1280x720
   FPS: 20
✅ REAL YOLOv8 MODE ACTIVE

🛡️  AUTONOMOUS SHIELD - REAL YOLOv8 MODE
============================================================
```

**If you see "MOCK DETECTOR MODE":**
- Video connection failed
- Check phone IP address
- Ensure phone and PC on same WiFi

### Terminal 2 - Frontend

```bash
npm run dev
```

### Open Dashboard

**http://localhost:5000**

You should see:
- Real video detections
- Bounding boxes on actual objects
- Person detection when you walk by
- Object detection (cup, phone, laptop, etc.)

---

## Step 5: Test Detection

### Test 1: Person Detection

1. Point phone camera at yourself
2. Walk into frame
3. **Expected:** Green bounding box + "person 89%"

### Test 2: Object Detection

1. Hold objects in front of camera:
   - Cup
   - Phone
   - Laptop
   - Book

2. **Expected:** Bounding boxes with labels

### Test 3: Multi-Object

1. Place multiple objects in view
2. **Expected:** Multiple bounding boxes simultaneously

---

## Troubleshooting

### ❌ Can't Connect to Phone

**Error:** `Failed to open video source`

**Solutions:**

1. **Check Same WiFi**
   ```bash
   # On PC, check IP
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   
   # Should be same network as phone (e.g., 192.168.1.x)
   ```

2. **Update IP Address**
   - Phone IP changes on WiFi reconnect
   - Check current IP in IP Webcam app
   - Update `VIDEO_SOURCE` in main.py

3. **Try HTTP Instead**
   ```python
   VIDEO_SOURCE = "http://192.168.1.100:8080/video"
   ```

4. **Disable Firewall**
   - Temporarily disable Windows Firewall
   - Or allow port 8080

5. **Try Different Port**
   - In IP Webcam app: Settings → Server port → 8081
   - Update URL accordingly

### ❌ YOLOv8 Not Installed

**Error:** `⚠️ YOLOv8 not available - using mock detector`

**Solution:**

```bash
pip install ultralytics opencv-python
```

### ❌ Detections Too Slow

**Problem:** <5 FPS on laptop

**Solutions:**

1. **Lower Resolution**
   - IP Webcam: Settings → Resolution → 640x480

2. **Use Lighter Model**
   ```python
   # In video_stream.py
   self.model = YOLO('yolov8n.pt')  # Already using lightest
   ```

3. **Skip Frames**
   ```python
   # In main.py WebSocket
   await asyncio.sleep(0.1)  # Slower: 10 FPS instead of 20
   ```

### ❌ Phone Gets Hot

**Problem:** Camera running too long

**Solutions:**

1. Lower FPS: IP Webcam → FPS limit → 10
2. Reduce quality: Quality → 60%
3. Use power adapter
4. Ventilate phone

---

## Quick Reference

### Phone App URLs

| Format | Example URL |
|--------|-------------|
| **Web UI** | http://192.168.1.100:8080 |
| **Video Stream** | http://192.168.1.100:8080/video |
| **RTSP** | rtsp://192.168.1.100:8080/h264_ulaw.sdp |

### Python Configuration

```python
# Webcam
VIDEO_SOURCE = 0

# Phone RTSP
VIDEO_SOURCE = "rtsp://192.168.1.100:8080/h264_ulaw.sdp"

# Phone HTTP
VIDEO_SOURCE = "http://192.168.1.100:8080/video"

# Disable (use mock)
VIDEO_SOURCE = None
```

### Testing Video Stream

```bash
# Test connection separately
cd ai-service
python video_stream.py "rtsp://YOUR_PHONE_IP:8080/h264_ulaw.sdp"

# Press 'q' to quit
```

---

## What You'll Get

✅ **Real AI surveillance**  
✅ **Live person detection**  
✅ **Object recognition** (80+ classes from COCO dataset)  
✅ **Bounding boxes on real video**  
✅ **Threat classification** (normal/suspicious/critical)  
✅ **All dashboard features working**  

**Cost:** $0 (everything is free!)

---

## Next: Multi-Camera Support

Want to add more cameras?

1. Get another phone
2. Start IP Webcam on it
3. Note the new RTSP URL
4. Modify code to support multiple streams

---

**🛡️ Autonomous Shield**  
*Now with real hardware!*
