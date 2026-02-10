import random
import time
import math
import numpy as np
from typing import Dict, List

class MockFusionEngine:
    """
    Simulates multi-sensor fusion data:
    1. Radar: Azimuth, distance, velocity of objects.
    2. Seismic: Vibration levels (tunneling detection).
    3. Thermal: Heat signatures (simulated as temperature variance).
    """

    def __init__(self):
        self.last_update = time.time()
        self.radar_angle = 0
        self.seismic_baseline = 0.2  # Normal ground vibration
        
    def get_radar_data(self) -> List[Dict]:
        """
        Simulate rotating radar sweeping 360 degrees.
        Returns detected blips.
        """
        self.radar_angle = (self.radar_angle + 5) % 360
        blips = []
        
        # Randomly generate a blip
        if random.random() < 0.3:
            # Create a blip at a random distance along the current sweep angle
            blips.append({
                "angle": self.radar_angle,
                "distance": random.uniform(50, 500), # meters
                "velocity": random.uniform(0, 30),   # km/h
                "strength": random.uniform(0.5, 1.0),
                "type": random.choice(["vehicle", "drone", "unknown"])
            })
            
        return blips

    def get_seismic_data(self) -> Dict:
        """
        Simulate seismic sensors for tunnel detection.
        Returns waveform data.
        """
        # Generate a waveform chunk
        t = np.linspace(0, 1, 50)
        
        # Normal background noise
        noise = np.random.normal(0, 0.1, 50)
        
        # Inject "Tunneling" signal occasionally
        is_tunneling = random.random() < 0.05 # 5% chance of activity
        signal = np.sin(2 * np.pi * 5 * t) * (2.0 if is_tunneling else 0.0)
        
        waveform = (self.seismic_baseline + noise + signal).tolist()
        
        return {
            "status": "CRITICAL" if is_tunneling else "NORMAL",
            "waveform": waveform,
            "magnitude": round(np.max(np.abs(waveform)), 2),
            "depth": random.uniform(2, 10) if is_tunneling else 0
        }

    def get_thermal_data(self) -> Dict:
        """
        Simulate thermal camera metrics.
        """
        return {
            "ambient_temp": round(random.uniform(20, 25), 1),
            "max_temp_detected": round(random.uniform(25, 38), 1),
            "hotspots": random.randint(0, 3)
        }

    def update(self) -> Dict:
        """
        Get fused sensor frame.
        """
        return {
            "radar": self.get_radar_data(),
            "seismic": self.get_seismic_data(),
            "thermal": self.get_thermal_data(),
            "timestamp": time.time()
        }
