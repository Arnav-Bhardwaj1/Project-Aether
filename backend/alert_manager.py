import time
from typing import List, Dict, Any

class AlertManager:
    """Manages system alerts and provides AI-generated remediation advice."""

    def __init__(self):
        self.alerts: List[Dict[str, Any]] = []

    def generate_alert(self, anomaly: Dict[str, Any]) -> Dict[str, Any]:
        """Creates an actionable alert from an anomaly."""
        
        metric = anomaly["metric"]
        value = anomaly["value"]
        
        advice = self._get_remediation_advice(metric, value)
        
        alert = {
            "id": f"alert_{anomaly['id']}",
            "title": f"Critical Spike in {metric.capitalize()}",
            "severity": anomaly["severity"],
            "timestamp": anomaly["timestamp"],
            "message": f"Detected value {value} which is statistically anomalous.",
            "advice": advice,
            "status": "UNRESOLVED"
        }
        
        self.alerts.append(alert)
        return alert

    def _get_remediation_advice(self, metric: str, value: float) -> str:
        """Mock AI advice generation."""
        if metric == "latency":
            return "Consider increasing rate limits or check backend service load. Agent may be stuck in a loop."
        elif metric == "violation_risk":
            return "Citadel has detected multiple high-severity violations. Recommend pausing the session and reviewing policy logs."
        elif metric == "tokens":
            return "Excessive token consumption detected. Check if agent is receiving large repeated outputs or is stuck."
        return "No specific advice available. Monitor the session closely."

    def get_active_alerts(self) -> List[Dict[str, Any]]:
        return [a for a in self.alerts if a["status"] == "UNRESOLVED"]

    def resolve_alert(self, alert_id: str):
        for a in self.alerts:
            if a["id"] == alert_id:
                a["status"] = "RESOLVED"
                break
