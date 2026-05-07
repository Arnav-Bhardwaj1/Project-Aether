import json
import copy
from typing import Dict, Any, Optional

class StateManager:
    """
    Handles deep-serialization of agent/environment states and 
    computes deltas for efficient temporal storage.
    """

    @staticmethod
    def serialize_state(agent_state: Dict[str, Any], world_state: Dict[str, Any]) -> Dict[str, Any]:
        """Combines and serializes the full system state."""
        return {
            "agent": copy.deepcopy(agent_state),
            "world": copy.deepcopy(world_state),
            "version": "1.0"
        }

    @staticmethod
    def compute_delta(prev_state: Dict[str, Any], current_state: Dict[str, Any]) -> Dict[str, Any]:
        """Calculates what changed between two states (Recursive Diff)."""
        return StateManager._recursive_diff(prev_state, current_state)

    @staticmethod
    def apply_delta(base_state: Dict[str, Any], delta: Dict[str, Any]) -> Dict[str, Any]:
        """Reconstructs a state by applying a delta to a base state."""
        new_state = copy.deepcopy(base_state)
        return StateManager._recursive_apply(new_state, delta)

    @staticmethod
    def _recursive_diff(d1: Dict[str, Any], d2: Dict[str, Any]) -> Dict[str, Any]:
        diff = {}
        for k, v in d2.items():
            if k not in d1:
                diff[k] = v
            elif v != d1[k]:
                if isinstance(v, dict) and isinstance(d1[k], dict):
                    nested_diff = StateManager._recursive_diff(d1[k], v)
                    if nested_diff:
                        diff[k] = nested_diff
                else:
                    diff[k] = v
        
        # Track deletions
        removed_keys = [k for k in d1 if k not in d2]
        if removed_keys:
            diff["__deleted__"] = removed_keys
            
        return diff

    @staticmethod
    def _recursive_apply(base: Dict[str, Any], delta: Dict[str, Any]) -> Dict[str, Any]:
        for k, v in delta.items():
            if k == "__deleted__":
                for rk in v:
                    if rk in base:
                        del base[rk]
            elif isinstance(v, dict) and k in base and isinstance(base[k], dict):
                StateManager._recursive_apply(base[k], v)
            else:
                base[k] = v
        return base

    @staticmethod
    def summarize_changes(delta: Dict[str, Any]) -> str:
        """Generates a human-readable summary of state changes."""
        changes = []
        if "agent" in delta:
            changes.append("Memory Mutation")
        if "world" in delta:
            changes.append("Environment Shift")
        
        return ", ".join(changes) if changes else "Minimal Mutation"
