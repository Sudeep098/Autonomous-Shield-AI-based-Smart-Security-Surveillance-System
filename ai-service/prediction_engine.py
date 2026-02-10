import random
import time
from typing import List, Dict

class ThreatPredictor:
    """
    Simulates Predictive Threat Analysis (AI/ML).
    Generates heatmaps of likely intrusion zones based on 'historical' patterns.
    """

    def __init__(self):
        # Define sectors with base risk probabilities
        self.sectors = [
            {"id": "NORTH_GATE", "base_risk": 0.3, "lat": 28.6139, "lng": 77.2090},
            {"id": "SOUTH_PERIMETER", "base_risk": 0.1, "lat": 28.6125, "lng": 77.2105},
            {"id": "EAST_WALL", "base_risk": 0.2, "lat": 28.6150, "lng": 77.2120},
            {"id": "WEST_CHECKPOINT", "base_risk": 0.5, "lat": 28.6135, "lng": 77.2085}
        ]

    def predict_risks(self) -> List[Dict]:
        """
        Generate risk probabilities for each sector based on time of day.
        """
        current_hour = time.localtime().tm_hour
        
        predictions = []
        for sector in self.sectors:
            # Risk increases at night (22:00 - 05:00)
            is_night = current_hour >= 22 or current_hour <= 5
            time_factor = 2.0 if is_night else 0.8
            
            # Add some randomness
            risk_score = min(0.99, sector["base_risk"] * time_factor * random.uniform(0.8, 1.2))
            
            predictions.append({
                "sector_id": sector["id"],
                "coordinates": {"lat": sector["lat"], "lng": sector["lng"]},
                "risk_score": round(risk_score, 2),
                "prediction_window": "15m",
                "likely_threat": "infiltration" if is_night else "loitering"
            })
            
        return predictions
