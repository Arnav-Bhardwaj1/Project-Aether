import json
import time
import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel

logger = logging.getLogger("AetherChronos")

class TemporalFrame(BaseModel):
    id: str
    session_id: str
    parent_id: Optional[str] = None
    timestamp: float
    state_delta: Dict[str, Any]
    event_type: str # ACTION, THOUGHT, ERROR, VIOLATION
    metadata: Dict[str, Any] = {}

class ChronosEngine:
    """
    Manages the temporal recording and playback of agent sessions.
    Captures state mutations and provides a queryable timeline.
    """
    
    def __init__(self):
        self.frames: Dict[str, TemporalFrame] = {}
        self.session_timelines: Dict[str, List[str]] = {} # session_id -> List[frame_id]
        
    def record_frame(self, frame: TemporalFrame):
        """Persists a new frame to the temporal store."""
        self.frames[frame.id] = frame
        if frame.session_id not in self.session_timelines:
            self.session_timelines[frame.session_id] = []
        self.session_timelines[frame.session_id].append(frame.id)
        logger.info(f"Temporal Frame Recorded: {frame.id} (Session: {frame.session_id})")

    def get_timeline(self, session_id: str) -> List[TemporalFrame]:
        """Returns the full history of a session, ordered by time."""
        frame_ids = self.session_timelines.get(session_id, [])
        return [self.frames[fid] for fid in frame_ids]

    def get_frame(self, frame_id: str) -> Optional[TemporalFrame]:
        return self.frames.get(frame_id)

    def search_events(self, session_id: str, event_type: str) -> List[TemporalFrame]:
        """Filters a timeline for specific event types (e.g. all violations)."""
        timeline = self.get_timeline(session_id)
        return [f for f in timeline if f.event_type == event_type]

    def prune_history(self, session_id: str, before_timestamp: float):
        """Removes old frames to save storage space."""
        if session_id not in self.session_timelines:
            return
            
        new_timeline = []
        for fid in self.session_timelines[session_id]:
            if self.frames[fid].timestamp >= before_timestamp:
                new_timeline.append(fid)
            else:
                del self.frames[fid]
        self.session_timelines[session_id] = new_timeline
        logger.info(f"Pruned history for session {session_id}")

    def get_session_stats(self, session_id: str) -> Dict[str, Any]:
        """Calculates temporal metrics for a session."""
        timeline = self.get_timeline(session_id)
        if not timeline:
            return {"duration": 0, "frame_count": 0}
            
        duration = timeline[-1].timestamp - timeline[0].timestamp
        return {
            "duration": round(duration, 2),
            "frame_count": len(timeline),
            "start_time": timeline[0].timestamp,
            "end_time": timeline[-1].timestamp,
            "event_distribution": self._count_event_types(timeline)
        }

    def _count_event_types(self, timeline: List[TemporalFrame]) -> Dict[str, int]:
        counts = {}
        for f in timeline:
            counts[f.event_type] = counts.get(f.event_type, 0) + 1
        return counts
