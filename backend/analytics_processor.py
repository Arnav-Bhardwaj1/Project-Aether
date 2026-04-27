import time
from typing import List, Dict, Any
from collections import Counter

class GovernanceAnalytics:
    """Processes historical snapshots to generate governance insights."""
    
    @staticmethod
    def calculate_risk_score(snapshots: List[Any]) -> Dict[str, Any]:
        """Calculates an aggregate risk score based on violations."""
        if not snapshots:
            return {"score": 0, "status": "SECURE", "metrics": {}}

        total_interactions = len(snapshots)
        blocked = 0
        redacted = 0
        violations = []

        for snap in snapshots:
            # Check input violations
            if not snap.input_audit.get("passed", True):
                blocked += 1
                violations.extend([v["type"] for v in snap.input_audit.get("violations", [])])
            
            # Check output violations
            if not snap.output_audit.get("passed", True):
                redacted += 1
                violations.extend([v["type"] for v in snap.output_audit.get("violations", [])])

        # Calculate weighted score (0-100, where 100 is high risk)
        # Blocked attempts count heavily towards "System Pressure"
        # Redacted outputs count towards "Leak Prevention"
        risk_index = min(100, (blocked * 15 + redacted * 5) / max(1, total_interactions / 10))
        
        violation_counts = Counter(violations)
        
        status = "SECURE"
        if risk_index > 70: status = "CRITICAL"
        elif risk_index > 40: status = "WARNING"
        elif risk_index > 15: status = "ELEVATED"

        return {
            "score": round(risk_index, 1),
            "status": status,
            "metrics": {
                "total_interactions": total_interactions,
                "blocked_attempts": blocked,
                "redacted_outputs": redacted,
                "violation_distribution": dict(violation_counts)
            },
            "timestamp": time.time()
        }

    @staticmethod
    def generate_heatmap_data(snapshots: List[Any]) -> List[Dict[str, Any]]:
        """Groups violations by time or category for heatmap visualization."""
        # For simplicity, we'll group by category of test (if available) or violation type
        category_stats = {}
        
        for snap in snapshots:
            cat = snap.metadata.get("category", "General")
            if cat not in category_stats:
                category_stats[cat] = {"total": 0, "violations": 0}
            
            category_stats[cat]["total"] += 1
            if not snap.input_audit.get("passed", True) or not snap.output_audit.get("passed", True):
                category_stats[cat]["violations"] += 1
        
        return [
            {"category": k, "intensity": (v["violations"] / v["total"]) * 100 if v["total"] > 0 else 0}
            for k, v in category_stats.items()
        ]
