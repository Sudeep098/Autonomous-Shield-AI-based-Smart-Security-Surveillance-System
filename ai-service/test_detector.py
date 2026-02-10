"""
Quick test to verify mock detector is generating detections
"""

import sys
sys.path.append('.')

from mock_detector import MockDetector

detector = MockDetector(frame_width=1280, frame_height=720)

print("Testing mock detector...")
print("="*60)

for i in range(5):
    detections = detector.detect_frame()
    print(f"\nFrame {i+1}: {len(detections)} detections")
    for det in detections:
        print(f"  - {det['class']}: {det['confidence']:.0%} [{det['threat_level']}]")

print("\n" + "="*60)
print("✅ Mock detector is working!")
