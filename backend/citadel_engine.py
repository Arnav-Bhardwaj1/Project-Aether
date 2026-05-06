import re
import json
import asyncio
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai
from pydantic import BaseModel

logger = logging.getLogger("AetherCitadel")

class PolicyRule(BaseModel):
    id: str
    name: str
    type: str # REGEX, SEMANTIC, ENTROPY, QUOTA
    pattern: Optional[str] = None
    severity: str # LOW, MEDIUM, HIGH, CRITICAL
    description: str
    enabled: bool = True

class PolicyManifest(BaseModel):
    id: str
    name: str
    rules: List[PolicyRule]
    active: bool = True

class CitadelEngine:
    """
    The core enforcement engine for Aether Citadel.
    Evaluates agent interactions against a multi-layered policy suite.
    """
    
    def __init__(self, api_key: Optional[str] = None):
        self.policies: Dict[str, PolicyManifest] = {}
        self.violation_history: List[Dict[str, Any]] = []
        if api_key:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-1.5-flash')
        else:
            self.model = None

    def load_policy(self, manifest: PolicyManifest):
        self.policies[manifest.id] = manifest
        logger.info(f"Policy loaded: {manifest.name} ({len(manifest.rules)} rules)")

    async def evaluate_text(self, text: str, context: str = "INPUT") -> Dict[str, Any]:
        """Evaluates text against all active policies."""
        violations = []
        
        for p_id, manifest in self.policies.items():
            if not manifest.active:
                continue
            
            for rule in manifest.rules:
                if not rule.enabled:
                    continue
                
                violation = await self._check_rule(text, rule)
                if violation:
                    violation["policy_id"] = p_id
                    violation["context"] = context
                    violations.append(violation)
        
        # Record violations
        for v in violations:
            self.violation_history.append(v)
            
        return {
            "passed": len(violations) == 0,
            "violations": violations,
            "risk_score": self._calculate_instant_risk(violations)
        }

    async def _check_rule(self, text: str, rule: PolicyRule) -> Optional[Dict[str, Any]]:
        """Checks a single rule against the text."""
        
        if rule.type == "REGEX":
            if re.search(rule.pattern, text, re.IGNORECASE):
                return {
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "severity": rule.severity,
                    "message": rule.description
                }
        
        elif rule.type == "ENTROPY":
            # Simple check for high-entropy strings (potential secrets)
            # This is a placeholder for a more complex entropy calculation
            if len(set(text)) / len(text) > 0.7 and len(text) > 20:
                return {
                    "rule_id": rule.id,
                    "rule_name": rule.name,
                    "severity": rule.severity,
                    "message": "High entropy string detected (Potential Secret)."
                }
                
        elif rule.type == "SEMANTIC" and self.model:
            # Use Gemini to check for abstract policy violations
            prompt = f"""
            Analyze the following text for a violation of this security policy:
            Policy Name: {rule.name}
            Description: {rule.description}
            
            Text to Analyze: "{text}"
            
            Does this text violate the policy? Answer ONLY with a JSON object:
            {{"violated": true/false, "reason": "short explanation if true"}}
            """
            try:
                response = await asyncio.to_thread(self.model.generate_content, prompt)
                result = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
                if result.get("violated"):
                    return {
                        "rule_id": rule.id,
                        "rule_name": rule.name,
                        "severity": rule.severity,
                        "message": result.get("reason", rule.description)
                    }
            except Exception as e:
                logger.error(f"Semantic check failed: {e}")
        
        return None

    def _calculate_instant_risk(self, violations: List[Dict[str, Any]]) -> float:
        """Calculates a risk score from 0.0 to 1.0 based on violations."""
        if not violations:
            return 0.0
        
        weights = {"LOW": 0.1, "MEDIUM": 0.3, "HIGH": 0.7, "CRITICAL": 1.0}
        max_severity = max([weights.get(v["severity"], 0) for v in violations])
        return max_severity

    def get_compliance_stats(self) -> Dict[str, Any]:
        """Aggregates historical violation data for the dashboard."""
        total_violations = len(self.violation_history)
        severity_counts = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        
        for v in self.violation_history:
            severity_counts[v["severity"]] += 1
            
        return {
            "total_violations": total_violations,
            "severity_distribution": severity_counts,
            "trust_score": max(0, 100 - (total_violations * 2)) # Simple placeholder logic
        }

    def export_audit_log(self, format: str = "json") -> str:
        """Exports the full audit log in various formats."""
        if format == "json":
            return json.dumps(self.violation_history, indent=2)
        elif format == "csv":
            import csv
            import io
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=["timestamp", "policy_id", "rule_name", "severity", "message", "context"])
            writer.writeheader()
            for v in self.violation_history:
                writer.writerow({k: v.get(k, "") for k in writer.fieldnames})
            return output.getvalue()
        return ""

    def simulate_threat_landscape(self):
        """Internal diagnostic to check engine responsiveness."""
        logger.info("Initializing threat landscape simulation...")
        # Placeholder for complex simulation logic
        pass

