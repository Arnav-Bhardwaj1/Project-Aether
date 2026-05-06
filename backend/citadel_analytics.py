import time
from typing import List, Dict, Any

class ComplianceAnalytics:
    """Processes historical governance data into actionable insights."""

    @staticmethod
    def generate_compliance_report(violations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates a detailed breakdown of security posture."""
        
        now = time.time()
        hour_ago = now - 3600
        
        # Filter violations by time
        recent_violations = [v for v in violations if v.get("timestamp", 0) > hour_ago]
        
        # Group by category
        categories = {}
        for v in violations:
            cat = v.get("policy_id", "General")
            categories[cat] = categories.get(cat, 0) + 1
            
        # Group by severity
        severity_map = {"LOW": 1, "MEDIUM": 2, "HIGH": 3, "CRITICAL": 5}
        total_risk_score = sum([severity_map.get(v["severity"], 0) for v in violations])
        
        # Calculate dynamic Trust Score (starts at 100)
        trust_score = max(0, 100 - (total_risk_score * 0.5))
        
        return {
            "trust_score": round(trust_score, 1),
            "total_incidents": len(violations),
            "recent_incidents": len(recent_violations),
            "category_breakdown": categories,
            "compliance_status": "OPTIMAL" if trust_score > 90 else "DEGRADED" if trust_score > 70 else "CRITICAL"
        }

    @staticmethod
    def get_timeline_data(violations: List[Dict[str, Any]], buckets: int = 10) -> List[Dict[str, Any]]:
        """Prepares data for the Recharts trend visualization."""
        if not violations:
            return [{"time": i, "violations": 0} for i in range(buckets)]
            
        # Very simple bucketing logic for the demo
        timeline = []
        for i in range(buckets):
            timeline.append({
                "index": i,
                "violations": len([v for v in violations if (i*10) < v.get("risk_score", 0)*100 <= ((i+1)*10)]),
                "severity": "Varying"
            })
        return timeline
