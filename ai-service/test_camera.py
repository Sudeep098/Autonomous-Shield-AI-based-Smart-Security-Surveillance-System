import cv2
import time
import urllib.request
import numpy as np

URL = "http://172.16.4.124:8080/video"

print(f"🔄 Testing connection to: {URL}")

# Method 1: PyOpenCV
print("1️⃣ Method 1: cv2.VideoCapture...")
cap = cv2.VideoCapture(URL)
if cap.isOpened():
    print("✅ cv2.VideoCapture Successful!")
    ret, frame = cap.read()
    if ret:
        print(f"   📸 Frame captured: {frame.shape}")
    else:
        print("   ❌ Connection open, but no frame returned.")
    cap.release()
else:
    print("❌ cv2.VideoCapture Failed to open.")

# Method 2: Urllib (Snapshot)
print("\n2️⃣ Method 2: urllib (Snapshot Mode)...")
try:
    # Try /shot.jpg or just reading the stream
    stream_url = URL.replace("/video", "/shot.jpg")
    print(f"   Trying snapshot URL: {stream_url}")
    with urllib.request.urlopen(stream_url, timeout=3) as response:
        data = response.read()
        print(f"✅ Downloaded {len(data)} bytes")
        arr = np.frombuffer(data, np.uint8)
        img = cv2.imdecode(arr, -1)
        if img is not None:
             print(f"   📸 Image decoded: {img.shape}")
        else:
             print("   ❌ Failed to decode image")
except Exception as e:
    print(f"❌ Urllib failed: {e}")

print("\n------------------------------------------------")
print("diagnostic complete")
