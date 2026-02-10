import requests
import json
import time

BASE_URL = "http://localhost:5000/api"

def test_suspect_api():
    print("🚀 Starting Suspect API Verification...")

    # 1. Create a Test Suspect
    test_suspect = {
        "suspectName": "Test Subject Alpha",
        "detectionId": f"test_det_{int(time.time())}",
        "confidence": 95.5,
        "priority": "CRITICAL",  # Should map to threatLevel: 'critical'
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%S.000Z", time.gmtime()),
        "location": "Sector 7G",
        "cameraId": "CAM_TEST_01",
        "coordinates": {"lat": 34.0836, "lng": 74.7973},
        "bbox": {"x": 100, "y": 100, "width": 50, "height": 50},
        "description": "Verification Test Entry"
    }

    try:
        print(f"\n📝 Creating suspect: {test_suspect['suspectName']}")
        response = requests.post(f"{BASE_URL}/suspects", json=test_suspect)
        
        if response.status_code == 201:
            print("✅ Suspect created successfully")
            print(json.dumps(response.json(), indent=2))
        else:
            print(f"❌ Failed to create suspect: {response.status_code}")
            print(response.text)
            return

        # 2. Retrieve Suspects
        print("\n🔍 Retrieving suspects list...")
        response = requests.get(f"{BASE_URL}/suspects?limit=5")
        
        if response.status_code == 200:
            suspects = response.json()
            print(f"✅ Retrieved {len(suspects)} suspects")
            
            # Verify our recent addition is there
            found = False
            for s in suspects:
                if s.get('detectionId') == test_suspect['detectionId']:
                    found = True
                    print(f"✅ Verified persistence of {test_suspect['detectionId']}")
                    break
            
            if not found:
                print("❌ Created suspect not found in list!")
        else:
            print(f"❌ Failed to get suspects: {response.status_code}")

    except Exception as e:
        print(f"❌ Error during verification: {e}")

if __name__ == "__main__":
    test_suspect_api()
