import urllib.request
import time

url = "http://192.168.1.8:8080/shot.jpg"
print(f"Testing connection to {url}")

try:
    start = time.time()
    with urllib.request.urlopen(url, timeout=2) as stream:
        if stream.status == 200:
            data = stream.read()
            print(f"✅ Success! Downloaded {len(data)} bytes in {time.time()-start:.2f}s")
        else:
            print(f"❌ Failed with status: {stream.status}")
except Exception as e:
    print(f"❌ Connection failed: {e}")
