import numpy as np
import logging
import time
from typing import List, Dict, Any

logger = logging.getLogger("AetherPulse")

class PulseEngine:
    """
    The analytical heart of Aether Pulse.
    Processes metric streams to detect anomalies and synthesize health scores.
    """
    
    def __init__(self):
        self.metric_history: Dict[str, List[float]] = {
            "latency": [],
            "tokens": [],
            "violation_risk": []
        }
        self.anomalies: List[Dict[str, Any]] = []

    def record_metric(self, name: str, value: float):
        """Records a new metric value and checks for anomalies."""
        if name not in self.metric_history:
            self.metric_history[name] = []
        self.metric_history[name].append(value)
        
        # Keep history bounded
        if len(self.metric_history[name]) > 100:
            self.metric_history[name].pop(0)
            
        self._check_anomaly(name, value)

    def _check_anomaly(self, name: str, value: float):
        """Uses Z-score to detect statistical anomalies."""
        history = self.metric_history[name]
        if len(history) < 10:
            return # Not enough data
            
        mean = np.mean(history)
        std = np.std(history)
        
        if std == 0:
            return
            
        z_score = (value - mean) / std
        
        if abs(z_score) > 3.0: # 3 standard deviations
            anomaly = {
                "id": f"anom_{int(time.time())}_{name}",
                "metric": name,
                "value": value,
                "z_score": float(z_score),
                "timestamp": time.time(),
                "severity": "CRITICAL" if abs(z_score) > 5.0 else "HIGH"
            }
            self.anomalies.append(anomaly)
            logger.warning(f"Anomaly detected in {name}: {value} (Z-score: {z_score})")

    def synthesize_health_score(self) -> float:
        """Calculates a unified health score from 0 to 100."""
        scores = []
        
        # 1. Latency Score
        if self.metric_history["latency"]:
            latest_latency = self.metric_history["latency"][-1]
            # Assume > 2 seconds is bad
            scores.append(max(0, 100 - (latest_latency * 50)))
            
        # 2. Violation Risk Score
        if self.metric_history["violation_risk"]:
            latest_risk = self.metric_history["violation_risk"][-1]
            scores.append(max(0, 100 - (latest_risk * 100)))
            
        if not scores:
            return 100.0
            
        return float(np.mean(scores))

    def get_live_pulse(self) -> List[float]:
        """Generates a wave-like pulse based on current health for the UI."""
        health = self.synthesize_health_score()
        base_freq = 1.0 if health > 80 else 2.0 if health > 50 else 3.0
        
        # Generate a sine wave with some noise
        t = np.linspace(0, 10, 50)
        pulse = np.sin(t * base_freq) * (health / 100.0)
        # Add random noise
        pulse += np.random.normal(0, 0.05, 50)
        
        return pulse.tolist()

    def get_recent_anomalies(self, count: int = 5) -> List[Dict[str, Any]]:
        return self.anomalies[-count:]
