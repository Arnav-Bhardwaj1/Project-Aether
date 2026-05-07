import uuid
import logging
from typing import Dict, Any, List, Optional
from chronos_engine import ChronosEngine, TemporalFrame
from state_manager import StateManager

logger = logging.getLogger("AetherChronos")

class BranchOrchestrator:
    """
    Manages the branching of sessions into parallel 'realities'.
    Allows forking an agent's history from any point in time.
    """
    
    def __init__(self, chronos: ChronosEngine):
        self.chronos = chronos
        self.branches: Dict[str, Dict[str, Any]] = {} # branch_id -> metadata

    def fork_session(self, session_id: str, frame_id: str, new_branch_name: str) -> Dict[str, Any]:
        """Creates a new session forked from a specific frame in an existing session."""
        
        # 1. Retrieve the base frame
        base_frame = self.chronos.get_frame(frame_id)
        if not base_frame:
            raise ValueError(f"Frame {frame_id} not found.")
            
        # 2. Reconstruct the state at that point
        timeline = self.chronos.get_timeline(session_id)
        full_state = {}
        for f in timeline:
            full_state = StateManager.apply_delta(full_state, f.state_delta)
            if f.id == frame_id:
                break
                
        # 3. Create a new session ID
        new_session_id = f"fork_{uuid.uuid4().hex[:8]}"
        
        # 4. Record the fork event in Chronos
        fork_metadata = {
            "source_session": session_id,
            "source_frame": frame_id,
            "branch_name": new_branch_name,
            "fork_timestamp": base_frame.timestamp
        }
        
        self.branches[new_session_id] = fork_metadata
        
        logger.info(f"Session Forked: {session_id} -> {new_session_id} at frame {frame_id}")
        
        return {
            "new_session_id": new_session_id,
            "forked_state": full_state,
            "metadata": fork_metadata
        }

    def get_session_lineage(self, session_id: str) -> List[Dict[str, Any]]:
        """Returns the history of forks that led to this session."""
        lineage = []
        current_id = session_id
        
        while current_id in self.branches:
            branch_info = self.branches[current_id]
            lineage.append({
                "session_id": current_id,
                **branch_info
            })
            current_id = branch_info["source_session"]
            
        return lineage[::-1] # Reverse to get chronological order

    def get_all_branches(self, root_session_id: str) -> List[Dict[str, Any]]:
        """Finds all sessions that were forked from a specific root session."""
        related_branches = []
        for sid, info in self.branches.items():
            if info["source_session"] == root_session_id:
                related_branches.append({
                    "session_id": sid,
                    **info
                })
        return related_branches
