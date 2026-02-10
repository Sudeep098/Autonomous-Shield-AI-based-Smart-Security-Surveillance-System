"""
AI-Based Security & Surveillance System - Mock Detection Engine
Simulates YOLOv8 object detection without requiring the full model
Generates realistic threat detections for demonstration
"""

import random
import time
from datetime import datetime
from typing import List, Dict, Tuple
from enum import Enum

class ThreatLevel(Enum):
    """Threat classification levels"""
    NORMAL = "normal"
    SUSPICIOUS = "suspicious"
    CRITICAL = "critical"

class ObjectClass(Enum):
    """Detected object classes"""
    HUMAN = "human"
    VEHICLE = "vehicle"
    WEAPON = "weapon"
    DRONE = "drone"
    UNKNOWN = "unknown"

class MockDetector:
    """
    Simulates YOLOv8 detection behavior
    Generates realistic bounding boxes, confidence scores, and object classes
    """
    
    
    def __init__(self, frame_width: int = 1280, frame_height: int = 720):
        self.frame_width = frame_width
        self.frame_height = frame_height
        self.detection_count = 0
        
        # Track active objects for stable IDs
        self.active_tracks = {}
        self.next_track_id = 1
        
        # Realistic detection probabilities
        self.class_distribution = {
            ObjectClass.HUMAN: 0.60,      # 60% humans
            ObjectClass.VEHICLE: 0.15,    # 15% vehicles
            ObjectClass.WEAPON: 0.05,     # 5% weapons (CRITICAL)
            ObjectClass.DRONE: 0.10,      # 10% drones (AERIAL THREAT)
            ObjectClass.UNKNOWN: 0.10     # 10% unknown
        }

    def _generate_bounding_box(self) -> Tuple[int, int, int, int]:
        """Generate realistic bounding box coordinates (x, y, width, height)"""
        # Random position
        x = random.randint(0, self.frame_width - 200)
        y = random.randint(0, self.frame_height - 200)
        
        # Realistic sizes based on object type
        width = random.randint(80, 300)
        height = random.randint(100, 400)
        
        return (x, y, width, height)
    
    def _generate_confidence(self, obj_class: ObjectClass) -> float:
        """Generate realistic confidence score"""
        if obj_class == ObjectClass.WEAPON:
            # Weapons: 85-98% confidence
            return round(random.uniform(0.85, 0.98), 2)
        elif obj_class == ObjectClass.HUMAN:
            # Humans: 75-95% confidence
            return round(random.uniform(0.75, 0.95), 2)
        elif obj_class == ObjectClass.VEHICLE:
            # Vehicles: 70-90% confidence
            return round(random.uniform(0.70, 0.90), 2)
        elif obj_class == ObjectClass.DRONE:
            # Drones: 60-85% confidence (harder to detect)
            return round(random.uniform(0.60, 0.85), 2)
        else:
            # Unknown: 60-75% confidence
            return round(random.uniform(0.60, 0.75), 2)
    
    def _select_object_class(self) -> ObjectClass:
        """Probabilistically select object class"""
        rand_val = random.random()
        cumulative = 0.0
        
        for obj_class, prob in self.class_distribution.items():
            cumulative += prob
            if rand_val <= cumulative:
                return obj_class
        
        return ObjectClass.UNKNOWN
    
    def _determine_threat_level(self, obj_class: ObjectClass, confidence: float) -> ThreatLevel:
        """Classify threat level based on object and confidence"""
        if obj_class == ObjectClass.WEAPON and confidence > 0.85:
            return ThreatLevel.CRITICAL
        elif obj_class == ObjectClass.DRONE:
            return ThreatLevel.SUSPICIOUS # Drones are always suspicious
        elif obj_class == ObjectClass.WEAPON or (obj_class == ObjectClass.HUMAN and confidence > 0.90):
            return ThreatLevel.SUSPICIOUS
        else:
            return ThreatLevel.NORMAL

    def _update_tracks(self):
        """Update active tracks: move them slightly, remove old ones, add new ones"""
        
        # 1. Update existing tracks
        current_tracks = {}
        for track_id, track in self.active_tracks.items():
            # Randomly drop tracks (simulate leaving frame)
            if random.random() < 0.05:
                continue
                
            # Move bounding box slightly
            x, y, w, h = track['bbox']
            dx = random.randint(-10, 10)
            dy = random.randint(-10, 10)
            
            # Keep in bounds
            x = max(0, min(x + dx, self.frame_width - w))
            y = max(0, min(y + dy, self.frame_height - h))
            
            track['bbox'] = (x, y, w, h)
            current_tracks[track_id] = track

        # 2. Add new tracks if too few
        target_count = random.randint(1, 5)
        while len(current_tracks) < target_count:
            obj_class = self._select_object_class()
            confidence = self._generate_confidence(obj_class)
            bbox = self._generate_bounding_box()
            threat_level = self._determine_threat_level(obj_class, confidence)
            
            if confidence >= 0.60:
                track_id = str(self.next_track_id)
                self.next_track_id += 1
                
                current_tracks[track_id] = {
                    "id": track_id,
                    "class": obj_class,
                    "confidence": confidence,
                    "bbox": bbox,
                    "threat_level": threat_level
                }
        
        self.active_tracks = current_tracks

    def detect_frame(self, num_objects: int = None) -> List[Dict]:
        """
        Simulate YOLOv8 detection on a single frame with tracking
        """
        self._update_tracks()
        
        detections = []
        for track in self.active_tracks.values():
            detection = {
                "id": f"det_{track['id']}",
                "class": track['class'].value,
                "confidence": track['confidence'],
                "bbox": {
                    "x": track['bbox'][0],
                    "y": track['bbox'][1],
                    "width": track['bbox'][2],
                    "height": track['bbox'][3]
                },
                "threat_level": track['threat_level'].value,
                "timestamp": datetime.utcnow().isoformat(),
                "frame_id": int(time.time() * 1000)
            }
            detections.append(detection)
            
        return detections
    
    def generate_threat_alert(self, detection: Dict) -> Dict:
        """
        Generate formatted threat alert from detection
        Matches original vision: "Human detected, 92% confidence, North Gate, Rifle"
        """
        if detection["threat_level"] not in [ThreatLevel.CRITICAL.value, ThreatLevel.SUSPICIOUS.value]:
            return None
        
        # Mock GPS coordinates (can be replaced with real camera locations)
        locations = [
            {"name": "North Gate", "lat": 28.6139, "lng": 77.2090},
            {"name": "South Perimeter", "lat": 28.6125, "lng": 77.2105},
            {"name": "East Sector", "lat": 28.6150, "lng": 77.2120},
            {"name": "West Checkpoint", "lat": 28.6135, "lng": 77.2085}
        ]
        
        location = random.choice(locations)
        
        alert = {
            "alert_id": f"alert_{int(time.time() * 1000)}",
            "type": "CRITICAL_THREAT" if detection["threat_level"] == ThreatLevel.CRITICAL.value else "SUSPICIOUS_ACTIVITY",
            "priority": "CRITICAL" if detection["threat_level"] == ThreatLevel.CRITICAL.value else "HIGH",
            "title": f"{detection['class'].title()} Threat Detected",
            "object": detection["class"],
            "confidence": f"{int(detection['confidence'] * 100)}%",
            "location": location["name"],
            "coordinates": {
                "lat": location["lat"],
                "lng": location["lng"]
            },
            "description": f"{detection['class'].title()} detected with {detection['confidence']:.0%} confidence at {location['name']}",
            "timestamp": detection["timestamp"],
            "requires_action": True,
            "bbox": detection["bbox"],
            "detection_id": detection["id"]
        }
        
        return alert


# Example usage and testing
if __name__ == "__main__":
    detector = MockDetector()
    
    print("🎯 Mock YOLOv8 Detection Engine - Test Run\n")
    print("=" * 60)
    
    # Simulate 10 frames
    for frame_num in range(10):
        print(f"\n📹 Frame {frame_num + 1}:")
        detections = detector.detect_frame()
        
        if not detections:
            print("  ✓ No objects detected (clear frame)")
            continue
        
        for det in detections:
            emoji = "🔴" if det["threat_level"] == "critical" else "🟡" if det["threat_level"] == "suspicious" else "🟢"
            print(f"  {emoji} {det['class'].upper():<10} | Confidence: {det['confidence']:.0%} | Threat: {det['threat_level']}")
            
            # Generate alert for critical threats
            if det["threat_level"] == "critical":
                alert = detector.generate_threat_alert(det)
                print(f"     🚨 ALERT: {alert['description']}")
        
        time.sleep(0.5)  # Simulate frame rate
