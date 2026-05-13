import os
import json
import asyncio
import uuid
import logging
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

from forge_engine import RedTeamGenerator, SimulationOrchestrator
from analytics_processor import GovernanceAnalytics
from swarm_manager import SwarmManager
from mirror_engine import MirrorEngine
from sandbox_orchestrator import SandboxOrchestrator
from chronos_engine import ChronosEngine, TemporalFrame
from state_manager import StateManager
from branch_orchestrator import BranchOrchestrator
from pulse_engine import PulseEngine
from metric_synthesizer import MetricSynthesizer
from alert_manager import AlertManager



load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherBackend")

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize Components
forge_engine = RedTeamGenerator(GEMINI_API_KEY)
mirror_engine = MirrorEngine()
chronos = ChronosEngine()
branch_orchestrator = BranchOrchestrator(chronos)
pulse_engine = PulseEngine()
metric_synthesizer = MetricSynthesizer(GEMINI_API_KEY)
alert_manager = AlertManager()
# SwarmManager initialized later with callback



app = FastAPI(title="Aether Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from citadel_engine import CitadelEngine
from policy_library import get_standard_policies
from citadel_analytics import ComplianceAnalytics
import time

# --- Aether Citadel: Governance Middleware ---

citadel = CitadelEngine(GEMINI_API_KEY)

# Load default policies
for policy in get_standard_policies():
    citadel.load_policy(policy)

class CitadelMiddleware:
    """Interlocks with CitadelEngine to enforce governance during execution."""
    
    @staticmethod
    async def audit_flow(text: str, context: str = "INPUT") -> Dict[str, Any]:
        result = await citadel.evaluate_text(text, context)
        
        # Add timestamp to violations for analytics
        for v in result["violations"]:
            v["timestamp"] = time.time()
            
        return result


# --- WebSocket Manager for Real-time Tracing ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: Any):
        if isinstance(message, dict):
            message = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- Initialize Stateful Orchestrators ---
sandbox_orchestrator = SandboxOrchestrator(mirror_engine, manager.broadcast)

# --- Core Execution Logic ---

async def execute_agent_logic(prompt: str, session_id: str, parent_id: Optional[str] = None, branch_name: str = "Main", metadata: Dict[str, Any] = {}):
    """Encapsulated execution logic used by API, Forge, and Nexus."""
    snapshot_id = str(uuid.uuid4())
    start_time = time.time()
    
    # 1. Audit Input via Citadel
    input_audit = await CitadelMiddleware.audit_flow(prompt, "INPUT")
    
    await manager.broadcast({
        "type": "TRACE_STEP",
        "session_id": session_id,
        "snapshot_id": snapshot_id,
        "step": "CITADEL_SCAN_INPUT",
        "status": "COMPLETED" if input_audit["passed"] else "VIOLATION",
        "data": input_audit
    })
    
    if not input_audit["passed"] and any(v["severity"] in ["HIGH", "CRITICAL"] for v in input_audit["violations"]):
        return {"status": "BLOCKED", "reason": input_audit["violations"], "snapshot_id": snapshot_id}


    # 2. Call Gemini
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        await manager.broadcast({
            "type": "TRACE_STEP",
            "session_id": session_id,
            "snapshot_id": snapshot_id,
            "step": "LLM_GENERATE",
            "status": "IN_PROGRESS"
        })
        
        response = model.generate_content(prompt)
        raw_output = response.text
        
        # 3. Audit Output via Citadel
        output_audit = await CitadelMiddleware.audit_flow(raw_output, "OUTPUT")
        final_output = raw_output
        
        # Automatic Redaction for certain violations
        for v in output_audit["violations"]:
            if "Email" in v["rule_name"]:
                import re
                final_output = re.sub(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', "[REDACTED_EMAIL]", final_output)

        await manager.broadcast({
            "type": "TRACE_STEP",
            "session_id": session_id,
            "snapshot_id": snapshot_id,
            "step": "CITADEL_SCAN_OUTPUT",
            "status": "COMPLETED" if output_audit["passed"] else "REDACTED",
            "data": output_audit
        })

        
        # Check if this is a Mirror action
        if metadata.get("is_mirror") and "CREATE FILE" in raw_output.upper():
            # Extract path and content (very simple mock parser)
            import re
            path_match = re.search(r"path: ([\w/.-]+)", raw_output.lower())
            content_match = re.search(r"content: (.+)", raw_output.lower())
            if path_match:
                await sandbox_orchestrator.process_agent_action(session_id, {
                    "type": "FILE_WRITE",
                    "path": path_match.group(1),
                    "content": content_match.group(1) if content_match else "Empty file"
                })
        
        # 4. Save Snapshot & Record Temporal Frame
        snapshot = Snapshot(
            id=snapshot_id,
            parent_id=parent_id,
            session_id=session_id,
            branch_name=branch_name,
            prompt=prompt,
            response=final_output,
            input_audit=input_audit,
            output_audit=output_audit,
            metadata={
                "latency": time.time() - start_time,
                "model": "gemini-1.5-flash",
                **metadata
            },
            timestamp=time.time()
        )
        flux_store.add_snapshot(snapshot)

        # Chronos Recording
        current_world_state = mirror_engine.get_session_state(session_id) if metadata.get("is_mirror") else {}
        serialized_state = StateManager.serialize_state({"prompt": prompt, "response": final_output}, current_world_state)
        
        # Simple delta logic: Compare with previous frame if exists
        timeline = chronos.get_timeline(session_id)
        delta = serialized_state
        if timeline:
            # Reconstruction would be needed for true delta, using simplified version for now
            pass

        chronos.record_frame(TemporalFrame(
            id=snapshot_id,
            session_id=session_id,
            parent_id=parent_id,
            timestamp=time.time(),
            state_delta=delta,
            event_type="ACTION",
            metadata=metadata
        ))

        # Pulse Recording
        latency = time.time() - start_time
        pulse_engine.record_metric("latency", latency)
        pulse_engine.record_metric("violation_risk", float(len(output_audit["violations"])))
        
        # Generate alert if anomaly detected
        recent_anomalies = pulse_engine.get_recent_anomalies(1)
        if recent_anomalies and recent_anomalies[0]["timestamp"] > time.time() - 5:
            alert_manager.generate_alert(recent_anomalies[0])
        
        return {
            "status": "SUCCESS",
            "session_id": session_id,
            "snapshot_id": snapshot_id,
            "output": final_output,
            "violations": output_audit["violations"]
        }


    except Exception as e:
        logger.error(f"Error in execution: {e}")
        return {"status": "ERROR", "error": str(e)}

# --- Initialize Managers ---
forge_manager = ConnectionManager()
forge_orchestrator = SimulationOrchestrator(forge_engine, execute_agent_logic)
swarm_manager = SwarmManager(GEMINI_API_KEY, execute_agent_logic)


# --- Flux Engine: Temporal State Store ---

class Snapshot(BaseModel):
    id: str
    parent_id: Optional[str] = None
    session_id: str
    branch_name: str = "Main"
    prompt: str
    response: str
    input_audit: Dict[str, Any]
    output_audit: Dict[str, Any]
    metadata: Dict[str, Any] = {}
    timestamp: float

class FluxStore:
    """Manages the tree of agent snapshots and branches."""
    def __init__(self):
        self.snapshots: Dict[str, Snapshot] = {}
        self.session_trees: Dict[str, List[str]] = {} # session_id -> List[snapshot_id]

    def add_snapshot(self, snapshot: Snapshot):
        self.snapshots[snapshot.id] = snapshot
        if snapshot.session_id not in self.session_trees:
            self.session_trees[snapshot.session_id] = []
        self.session_trees[snapshot.session_id].append(snapshot.id)
        logger.info(f"Snapshot saved: {snapshot.id} (Parent: {snapshot.parent_id})")

    def get_tree(self, session_id: str) -> List[Snapshot]:
        snapshot_ids = self.session_trees.get(session_id, [])
        return [self.snapshots[sid] for sid in snapshot_ids]

    def get_snapshot(self, snapshot_id: str) -> Optional[Snapshot]:
        return self.snapshots.get(snapshot_id)

flux_store = FluxStore()

# --- Models ---

class AgentRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None
    parent_id: Optional[str] = None
    branch_name: Optional[str] = "Main"
    policy_overrides: Optional[Dict[str, Any]] = None

class ForgeRequest(BaseModel):
    session_id: str
    categories: List[str]

class NexusRequest(BaseModel):
    session_id: str
    prompt: str

class MirrorInitRequest(BaseModel):
    session_id: str
    template_id: str

class MirrorActionRequest(BaseModel):
    session_id: str
    action: Dict[str, Any]

# --- Endpoints ---

@app.get("/")
async def root():
    return {
        "status": "online",
        "engine": "Aether Flux Engine v1.0",
        "features": ["branching", "snapshotting", "time-travel", "forge", "nexus", "mirror"]
    }

@app.websocket("/ws/trace")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.post("/api/agent/execute")
async def execute_agent(request: AgentRequest):
    if not GEMINI_API_KEY:
        raise HTTPException(status_code=500, detail="Gemini API Key not configured")
    
    session_id = request.session_id or str(uuid.uuid4())
    result = await execute_agent_logic(
        prompt=request.prompt,
        session_id=session_id,
        parent_id=request.parent_id,
        branch_name=request.branch_name or "Main"
    )
    
    if result["status"] == "ERROR":
        raise HTTPException(status_code=500, detail=result["error"])
    
    return result

@app.post("/api/forge/simulate")
async def simulate_forge(request: ForgeRequest):
    """Triggers a background simulation suite."""
    if forge_orchestrator.is_running:
        return {"status": "BUSY", "message": "Simulation already in progress"}
    
    asyncio.create_task(forge_orchestrator.run_simulation_suite(request.session_id, request.categories))
    return {"status": "STARTED", "message": "Forge simulation suite launched"}

@app.post("/api/nexus/launch")
async def launch_nexus(request: NexusRequest):
    """Triggers a multi-agent swarm workflow."""
    # Run swarm in background
    asyncio.create_task(swarm_manager.launch_swarm(
        request.session_id, 
        request.prompt, 
        manager.broadcast
    ))
    return {"status": "STARTED", "message": "Nexus swarm launched"}

@app.post("/api/nexus/stop/{swarm_id}")
async def stop_nexus(swarm_id: str):
    swarm_manager.stop_swarm(swarm_id)
    return {"status": "STOPPED", "message": "Nexus swarm termination signaled"}

@app.post("/api/mirror/init")
async def init_mirror(request: MirrorInitRequest):
    return await sandbox_orchestrator.initialize_sandbox(request.session_id, request.template_id)

@app.post("/api/mirror/action")
async def mirror_action(request: MirrorActionRequest):
    return await sandbox_orchestrator.process_agent_action(request.session_id, request.action)

@app.get("/api/mirror/impact/{session_id}")
async def get_mirror_impact(session_id: str):
    return await sandbox_orchestrator.generate_impact_report(session_id)

@app.get("/api/forge/analytics/{session_id}")
async def get_forge_analytics(session_id: str):
    """Retrieves security insights for a session."""
    snapshots = flux_store.get_tree(session_id)
    risk_data = GovernanceAnalytics.calculate_risk_score(snapshots)
    heatmap = GovernanceAnalytics.generate_heatmap_data(snapshots)
    
    return {
        "risk_report": risk_data,
        "heatmap": heatmap
    }


@app.get("/api/flux/tree/{session_id}")
async def get_flux_tree(session_id: str):
    tree = flux_store.get_tree(session_id)
    if not tree:
        # Check if we have any snapshots for this session, if not return empty
        return {"session_id": session_id, "snapshots": []}
    return {"session_id": session_id, "snapshots": tree}

# --- Citadel Endpoints ---

@app.get("/api/citadel/stats")
async def get_citadel_stats():
    """Returns real-time compliance analytics."""
    report = ComplianceAnalytics.generate_compliance_report(citadel.violation_history)
    timeline = ComplianceAnalytics.get_timeline_data(citadel.violation_history)
    return {
        "report": report,
        "timeline": timeline,
        "active_policies": [p.name for p in citadel.policies.values() if p.active]
    }

@app.get("/api/citadel/policies")
async def get_policies():
    return list(citadel.policies.values())

@app.post("/api/citadel/policies/{policy_id}/toggle")
async def toggle_policy(policy_id: str):
    if policy_id in citadel.policies:
        citadel.policies[policy_id].active = not citadel.policies[policy_id].active
        return {"status": "SUCCESS", "active": citadel.policies[policy_id].active}
    raise HTTPException(status_code=404, detail="Policy not found")

# --- Chronos Endpoints ---

@app.get("/api/chronos/timeline/{session_id}")
async def get_chronos_timeline(session_id: str):
    timeline = chronos.get_timeline(session_id)
    stats = chronos.get_session_stats(session_id)
    return {
        "timeline": timeline,
        "stats": stats
    }

@app.post("/api/chronos/fork")
async def fork_session(request: Dict[str, Any]):
    session_id = request.get("session_id")
    frame_id = request.get("frame_id")
    name = request.get("name", "Unnamed Fork")
    
    if not session_id or not frame_id:
        raise HTTPException(status_code=400, detail="Missing session_id or frame_id")
        
    try:
        result = branch_orchestrator.fork_session(session_id, frame_id, name)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- Pulse Endpoints ---

@app.get("/api/pulse/live")
async def get_live_pulse():
    return {
        "heartbeat": pulse_engine.get_live_pulse(),
        "health_score": pulse_engine.synthesize_health_score(),
        "active_alerts_count": len(alert_manager.get_active_alerts())
    }

@app.get("/api/pulse/alerts")
async def get_alerts():
    return alert_manager.get_active_alerts()

@app.get("/api/pulse/metrics/{session_id}")
async def get_session_metrics(session_id: str):
    # In a real app, we would load the trace log
    # For demo, we synthesize from a mock trace
    mock_trace = "Agent started. Executed tool. Accessed database. No violations."
    metrics = await metric_synthesizer.synthesize_session_metrics(session_id, mock_trace)
    radar = metric_synthesizer.get_radar_data(metrics)
    return {
        "metrics": metrics,
        "radar": radar
    }



# --- Forge Endpoints ---

@app.websocket("/ws/forge")
async def websocket_forge(websocket: WebSocket):
    await forge_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        forge_manager.disconnect(websocket)

@app.post("/api/forge/simulate")
async def run_forge_simulation(request: Dict[str, Any]):
    session_id = request.get("session_id", f"forge_{uuid.uuid4().hex[:8]}")
    categories = request.get("categories", ["JAILBREAK"])
    iterations = request.get("iterations", 3)
    
    async def progress_callback(data: dict):
        await forge_manager.broadcast({
            "type": "FORGE_RESULT",
            "data": data
        })
        
    # Run in background to avoid blocking the HTTP response
    asyncio.create_task(
        forge_orchestrator.run_simulation_suite(session_id, categories, iterations, progress_callback)
    )
    
    return {"status": "STARTED", "session_id": session_id}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
