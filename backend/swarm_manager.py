import json
import asyncio
import uuid
import logging
import time
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from agent_definitions import AGENT_ROLES

logger = logging.getLogger("AetherNexus")

class SwarmManager:
    """
    Manages the lifecycle of a multi-agent swarm, including task decomposition,
    agent execution, and inter-agent communication.
    """
    
    def __init__(self, api_key: str, execute_callback):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.execute_callback = execute_callback
        self.active_swarms: Dict[str, bool] = {}

    async def decompose_task(self, prompt: str) -> List[Dict[str, Any]]:
        """Uses the Orchestrator to break a prompt into sub-tasks."""
        orchestrator = AGENT_ROLES["ORCHESTRATOR"]
        system_instruction = orchestrator["system_prompt"]
        
        try:
            # We use a direct call here for decomposition
            response = self.model.generate_content(
                f"{system_instruction}\n\nUSER REQUEST: {prompt}\n\nJSON Output:"
            )
            content = response.text.strip()
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
            
            return json.loads(content)
        except Exception as e:
            logger.error(f"Task decomposition failed: {e}")
            # Fallback to a single-step research task if decomposition fails
            return [{"id": "fallback", "role": "RESEARCHER", "instruction": prompt}]

    async def launch_swarm(self, session_id: str, prompt: str, broadcast_fn):
        """Orchestrates the full multi-agent workflow."""
        swarm_id = str(uuid.uuid4())
        self.active_swarms[swarm_id] = True
        
        # 1. Notify start and broadcast initial nodes
        await broadcast_fn({
            "type": "NEXUS_SYNC",
            "swarm_id": swarm_id,
            "status": "INITIALIZING",
            "message": "Orchestrating task decomposition..."
        })

        # 2. Decompose
        tasks = await self.decompose_task(prompt)
        
        # Build initial graph state
        nodes = [{"id": "USER", "type": "origin", "label": "User Input"}]
        edges = []
        
        for task in tasks:
            nodes.append({
                "id": task["id"],
                "type": "agent",
                "role": task["role"],
                "label": AGENT_ROLES[task["role"]]["name"],
                "status": "PENDING"
            })
            # Connect to dependencies or user
            parents = task.get("depends_on", [])
            if isinstance(parents, str): parents = [parents]
            if not parents:
                edges.append({"from": "USER", "to": task["id"]})
            else:
                for p in parents:
                    edges.append({"from": p, "to": task["id"]})

        await broadcast_fn({
            "type": "NEXUS_SYNC",
            "swarm_id": swarm_id,
            "nodes": nodes,
            "edges": edges,
            "status": "READY"
        })

        # 3. Execution Loop
        context = {"original_prompt": prompt, "results": {}}
        
        for task in tasks:
            if not self.active_swarms.get(swarm_id): break
            
            # Update node status to active
            await broadcast_fn({
                "type": "NEXUS_SYNC",
                "swarm_id": swarm_id,
                "update_node": {"id": task["id"], "status": "ACTIVE"}
            })

            # Gather results from dependencies for context
            dep_results = ""
            parents = task.get("depends_on", [])
            if isinstance(parents, str): parents = [parents]
            for p in parents:
                dep_results += f"\nResult from {p}: {context['results'].get(p, '')}"

            # Execute agent logic (via callback to main.py to reuse Sentry & Snapshotting)
            agent_prompt = f"TASK: {task['instruction']}\n\nCONTEXT: {dep_results or prompt}"
            
            # Metadata for Nexus tracing
            nexus_meta = {
                "swarm_id": swarm_id,
                "role": task["role"],
                "is_nexus": True
            }
            
            result = await self.execute_callback(
                prompt=agent_prompt,
                session_id=session_id,
                branch_name=f"Nexus-{task['role']}",
                metadata=nexus_meta
            )
            
            context["results"][task["id"]] = result.get("output", "Error or blocked.")
            
            # Update node status to complete
            await broadcast_fn({
                "type": "NEXUS_SYNC",
                "swarm_id": swarm_id,
                "update_node": {"id": task["id"], "status": "COMPLETED"},
                "message": f"Agent {task['role']} finalized output."
            })
            
            # Small delay for visual pacing
            await asyncio.sleep(2)

        # 4. Final Aggregation (Optional, here we just finish)
        await broadcast_fn({
            "type": "NEXUS_SYNC",
            "swarm_id": swarm_id,
            "status": "FINISHED",
            "message": "Swarm orchestration successful."
        })
        
        del self.active_swarms[swarm_id]

    def stop_swarm(self, swarm_id: str):
        if swarm_id in self.active_swarms:
            self.active_swarms[swarm_id] = False
