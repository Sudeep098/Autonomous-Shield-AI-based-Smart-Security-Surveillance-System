import time
import psutil
import requests
import socket
import random
import math
from datetime import datetime

# Configuration
import sys
DEFAULT_HOST = "localhost"

# Check for command line argument for IP
if len(sys.argv) > 1:
    TARGET_IP = sys.argv[1]
else:
    print(f"ℹ️  To connect to a remote server, run: python telemetry_simulator.py <SERVER_IP>")
    print(f"   (Using default: {DEFAULT_HOST})")
    TARGET_IP = DEFAULT_HOST

EDGE_DEVICE_ID = socket.gethostname()
BACKEND_ENDPOINT = f"http://{TARGET_IP}:5000/api/telemetry"
INTERVAL_SEC = 1.0

# Try to import GPUtil for Real GPU Stats
try:
    import GPUtil
    HAS_REAL_GPU = len(GPUtil.getGPUs()) > 0
    print(f"✅ Real GPU detected: {GPUtil.getGPUs()[0].name}")
except ImportError:
    HAS_REAL_GPU = False
    print("⚠️  GPUtil not found. Using Simulated GPU content. (pip install GPUtil)")
except Exception:
    HAS_REAL_GPU = False
    print("⚠️  No GPU detected. Using Simulated GPU content.")

t = 0.0  # time index for smooth curves

def get_cpu_stats():
    return {
        "cpu_percent": psutil.cpu_percent(interval=None),
    }

def get_memory_stats():
    mem = psutil.virtual_memory()
    return {
        "memory_percent": mem.percent,
    }

def get_gpu_stats():
    global t
    t += 0.08
    
    if HAS_REAL_GPU:
        try:
            gpu = GPUtil.getGPUs()[0] # Use primary GPU
            return {
                "gpu_load_percent": round(gpu.load * 100, 2),
                "gpu_memory_percent": round(gpu.memoryUtil * 100, 2),
                "gpu_temp_c": round(gpu.temperature, 1)
            }
        except:
             pass # Fallback if read fails

    # Fallback: Smooth wave + noise (looks real)
    gpu_load = 55 + 25 * math.sin(t) + random.uniform(-5, 5)
    gpu_mem = 45 + 20 * math.sin(t * 0.7) + random.uniform(-3, 3)
    temp = 60 + 10 * math.sin(t * 0.5)

    return {
        "gpu_load_percent": round(max(0, min(gpu_load, 100)), 2),
        "gpu_memory_percent": round(max(0, min(gpu_mem, 100)), 2),
        "gpu_temp_c": round(temp, 1)
    }

def simulated_ai_latency():
    # Typical edge inference latency
    return round(random.uniform(18, 38), 2)

def send(payload):
    try:
        response = requests.post(BACKEND_ENDPOINT, json=payload, timeout=0.3)
        if response.status_code == 200:
            gpu_mode = "REAL" if HAS_REAL_GPU else "SIM"
            print(f"✅ Telemetry sent [{gpu_mode}]: GPU={payload['gpu']['gpu_load_percent']}% CPU={payload['cpu']['cpu_percent']}%")
        else:
            print(f"⚠️ Failed to send: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection error: {e}")

print(f"🚀 Starting Telemetry Simulator for {EDGE_DEVICE_ID}...")
print(f"📡 Target: {BACKEND_ENDPOINT}")

while True:
    telemetry = {
        "device_id": EDGE_DEVICE_ID,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cpu": get_cpu_stats(),
        "memory": get_memory_stats(),
        "gpu": get_gpu_stats(),
        "ai": {
            "inference_latency_ms": simulated_ai_latency()
        }
    }

    send(telemetry)
    time.sleep(INTERVAL_SEC)
