import logging
import json
import asyncio
from typing import Dict, Any, List, Optional
from mirror_engine import MirrorEngine

logger = logging.getLogger("AetherSandbox")

class SandboxOrchestrator:
    """
    Orchestrates the lifecycle of a sandbox session. 
    Intercepts agent intents and applies them to the MirrorEngine.
    """
    
    def __init__(self, mirror_engine: MirrorEngine, broadcast_fn, aegis_engine=None):
        self.mirror = mirror_engine
        self.broadcast = broadcast_fn
        self.aegis = aegis_engine
        self.active_sandboxes: Dict[str, str] = {} # session_id -> template_id

    async def initialize_sandbox(self, session_id: str, template_id: str):
        """Prepares a new simulation world."""
        state = self.mirror.initialize_session(session_id, template_id)
        
        await self.broadcast({
            "type": "WORLD_SYNC",
            "session_id": session_id,
            "status": "READY",
            "world_name": state["name"],
            "files": state["files"],
            "database": state["database"]
        })
        return state

    async def process_agent_action(self, session_id: str, action: Dict[str, Any]):
        """
        Applies an agent's intent to the virtual environment.
        Example action: {"type": "FILE_CREATE", "path": "/test.txt", "content": "..."}
        """
        if session_id not in self.mirror.sessions:
            logger.error(f"Sandbox session {session_id} not found.")
            return

        action_type = action.get("type")
        path_or_table = action.get("path") or action.get("table") or ""
        
        # Check decoys first via Aegis
        if self.aegis and action_type in ["FILE_WRITE", "FILE_DELETE", "DB_INSERT"]:
            decoy_triggered = self.aegis.check_sandbox_decoys(session_id, action_type, path_or_table)
            if decoy_triggered:
                import time
                await self.broadcast({
                    "type": "AEGIS_ALERT",
                    "session_id": session_id,
                    "alert": {
                        "id": f"alert_decoy_{int(time.time())}",
                        "timestamp": time.time(),
                        "type": "INTRUSION_ATTEMPT",
                        "rule_id": decoy_triggered["decoy_id"],
                        "target": path_or_table,
                        "message": f"HONEYPOT TRIGGERED: Unauthorized agent attempt to {action_type} decoy '{path_or_table}'.",
                        "severity": "CRITICAL",
                        "session_id": session_id
                    }
                })
            
        mutation = None
        
        if action_type == "FILE_WRITE":
            mutation = self.mirror.write_file(session_id, action["path"], action["content"])
        elif action_type == "FILE_DELETE":
            mutation = self.mirror.delete_file(session_id, action["path"])
        elif action_type == "DB_INSERT":
            mutation = self.mirror.mutate_db(session_id, action["table"], "INSERT", action["data"])
        
        if mutation:
            # Notify frontend of environment change
            await self.broadcast({
                "type": "WORLD_MUTATION",
                "session_id": session_id,
                "mutation": mutation,
                # Include partial state update
                "files": self.mirror.sessions[session_id]["files"],
                "database": self.mirror.sessions[session_id]["database"]
            })
            return mutation
        
        return None

    async def generate_impact_report(self, session_id: str) -> Dict[str, Any]:
        """Calculates 'Blast Radius' and operational risk metrics."""
        state = self.mirror.get_state(session_id)
        if not state: return {}
        
        mutations = state["mutations"]
        file_changes = len([m for m in mutations if "FILE" in m["type"]])
        db_changes = len([m for m in mutations if "DB" in m["type"]])
        
        # Heuristic risk calculation
        risk_score = min(100, (file_changes * 10) + (db_changes * 15))
        
        return {
            "session_id": session_id,
            "metrics": {
                "file_pressure": file_changes * 0.2, # 0-1 range
                "data_entropy": db_changes * 0.3,
                "integrity_risk": risk_score / 100
            },
            "mutation_count": len(mutations),
            "critical_violations": [m for m in mutations if "secrets" in m.get("path", "").lower()]
        }
