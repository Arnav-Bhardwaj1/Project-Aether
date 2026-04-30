import time
import copy
from typing import Dict, Any, List, Optional
from world_definitions import WORLD_TEMPLATES

class MirrorEngine:
    """
    Manages the state of virtualized environments (Digital Twins).
    Supports state isolation, mutation tracking, and snapshots.
    """
    
    def __init__(self):
        # session_id -> {files: {}, database: {}, history: []}
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def initialize_session(self, session_id: str, template_id: str) -> Dict[str, Any]:
        """Creates a new virtual world from a template."""
        template = WORLD_TEMPLATES.get(template_id, WORLD_TEMPLATES["CORP_DEV_BOX"])
        
        self.sessions[session_id] = {
            "template_id": template_id,
            "name": template["name"],
            "files": copy.deepcopy(template.get("files", {})),
            "database": copy.deepcopy(template.get("database", {})),
            "mutations": [],
            "snapshots": []
        }
        return self.sessions[session_id]

    def get_state(self, session_id: str) -> Optional[Dict[str, Any]]:
        return self.sessions.get(session_id)

    def write_file(self, session_id: str, path: str, content: str, actor: str = "agent"):
        """Mutates a virtual file."""
        if session_id not in self.sessions: return
        
        prev_content = self.sessions[session_id]["files"].get(path)
        self.sessions[session_id]["files"][path] = content
        
        mutation = {
            "id": f"mut_{int(time.time()*1000)}",
            "type": "FILE_WRITE",
            "path": path,
            "content": content,
            "prev_content": prev_content,
            "actor": actor,
            "timestamp": time.time()
        }
        self.sessions[session_id]["mutations"].append(mutation)
        return mutation

    def delete_file(self, session_id: str, path: str, actor: str = "agent"):
        """Deletes a virtual file."""
        if session_id not in self.sessions or path not in self.sessions[session_id]["files"]: 
            return
        
        prev_content = self.sessions[session_id]["files"].pop(path)
        mutation = {
            "id": f"mut_{int(time.time()*1000)}",
            "type": "FILE_DELETE",
            "path": path,
            "prev_content": prev_content,
            "actor": actor,
            "timestamp": time.time()
        }
        self.sessions[session_id]["mutations"].append(mutation)
        return mutation

    def mutate_db(self, session_id: str, table: str, query: str, data: Any, actor: str = "agent"):
        """Simulates a database mutation."""
        if session_id not in self.sessions: return
        
        # Simple list-based mock DB mutation
        if table in self.sessions[session_id]["database"]:
            # For demo, we just append or update based on query (mock logic)
            self.sessions[session_id]["database"][table].append(data)
            
        mutation = {
            "id": f"mut_{int(time.time()*1000)}",
            "type": "DB_MUTATION",
            "table": table,
            "query": query,
            "data": data,
            "actor": actor,
            "timestamp": time.time()
        }
        self.sessions[session_id]["mutations"].append(mutation)
        return mutation

    def capture_snapshot(self, session_id: str, label: str) -> str:
        """Saves current state as a snapshot."""
        if session_id not in self.sessions: return ""
        
        snapshot = {
            "id": f"snap_{int(time.time()*1000)}",
            "label": label,
            "files": copy.deepcopy(self.sessions[session_id]["files"]),
            "database": copy.deepcopy(self.sessions[session_id]["database"]),
            "timestamp": time.time()
        }
        self.sessions[session_id]["snapshots"].append(snapshot)
        return snapshot["id"]

    def restore_snapshot(self, session_id: str, snapshot_id: str) -> bool:
        """Restores world state from a snapshot."""
        if session_id not in self.sessions: return False
        
        snap = next((s for s in self.sessions[session_id]["snapshots"] if s["id"] == snapshot_id), None)
        if not snap: return False
        
        self.sessions[session_id]["files"] = copy.deepcopy(snap["files"])
        self.sessions[session_id]["database"] = copy.deepcopy(snap["database"])
        
        mutation = {
            "id": f"mut_{int(time.time()*1000)}",
            "type": "WORLD_RESTORE",
            "snapshot_id": snapshot_id,
            "label": snap["label"],
            "actor": "system",
            "timestamp": time.time()
        }
        self.sessions[session_id]["mutations"].append(mutation)
        return True
