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

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("AetherBackend")

# Configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="Aether Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- The Sentry: Security Middleware Logic ---

class SecuritySentry:
    """Intercepts and audits agent inputs/outputs for security violations."""
    
    @staticmethod
    async def audit_input(text: str) -> Dict[str, Any]:
        # Simple placeholder for secret detection (e.g. API keys, high entropy strings)
        violations = []
        if "sk-" in text or "AIza" in text: # Basic patterns for OpenAI/Google keys
            violations.append({"type": "SECRET_LEAK", "severity": "CRITICAL", "message": "Potential API Key detected in prompt."})
        
        return {"passed": len(violations) == 0, "violations": violations}

    @staticmethod
    async def audit_output(text: str) -> Dict[str, Any]:
        violations = []
        # Basic PII check placeholder (Email pattern)
        import re
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        if re.search(email_pattern, text):
            violations.append({"type": "PII_LEAK", "severity": "HIGH", "message": "Email address detected in output."})
            # Redact
            text = re.sub(email_pattern, "[REDACTED_EMAIL]", text)
            
        return {"passed": len(violations) == 0, "violations": violations, "redacted_text": text}

# --- WebSocket Manager for Real-time Tracing ---

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- Trace Persistence (Time-Travel Store) ---

traces_db = {} # session_id -> List[steps]

def save_trace_step(session_id: str, step_data: Dict[str, Any]):
    if session_id not in traces_db:
        traces_db[session_id] = []
    traces_db[session_id].append(step_data)

# --- Models ---

class AgentRequest(BaseModel):
    prompt: str
    session_id: Optional[str] = None

# --- Endpoints ---

@app.get("/")
async def root():
    return {"message": "Aether API is active"}

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
    
    # 1. Audit Input (The Sentry)
    input_audit = await SecuritySentry.audit_input(request.prompt)
    
    await manager.broadcast(json.dumps({
        "type": "TRACE_STEP",
        "session_id": session_id,
        "step": "INPUT_AUDIT",
        "status": "COMPLETED" if input_audit["passed"] else "VIOLATION",
        "data": input_audit
    }))
    
    if not input_audit["passed"]:
        return {"status": "BLOCKED", "reason": input_audit["violations"]}

    # 2. Call Gemini
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        await manager.broadcast(json.dumps({
            "type": "TRACE_STEP",
            "session_id": session_id,
            "step": "LLM_GENERATE",
            "status": "IN_PROGRESS"
        }))
        
        response = model.generate_content(request.prompt)
        raw_output = response.text
        
        # 3. Audit Output (The Sentry)
        output_audit = await SecuritySentry.audit_output(raw_output)
        final_output = output_audit.get("redacted_text", raw_output)
        
        await manager.broadcast(json.dumps({
            "type": "TRACE_STEP",
            "session_id": session_id,
            "step": "OUTPUT_AUDIT",
            "status": "COMPLETED" if output_audit["passed"] else "REDACTED",
            "data": output_audit
        }))
        
        return {
            "session_id": session_id,
            "output": final_output,
            "violations": output_audit["violations"]
        }
        
    except Exception as e:
        logger.error(f"Error calling Gemini: {e}")
        await manager.broadcast(json.dumps({
            "type": "TRACE_STEP",
            "session_id": session_id,
            "step": "LLM_GENERATE",
            "status": "ERROR",
            "error": str(e)
        }))
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/agent/trace/{session_id}")
async def get_session_trace(session_id: str):
    if session_id not in traces_db:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "steps": traces_db[session_id]}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
