import asyncio
import logging
from typing import Dict, Any, List, Optional, Callable
from collections import deque
import google.generativeai as genai

# Import components to orchestrate
from citadel_engine import CitadelEngine
from cortex_engine import CortexEngine
from echo_engine import EchoEngine
from mirror_engine import MirrorEngine

logger = logging.getLogger("AetherLoom")

class LoomWorkflowExecutor:
    """
    Asynchronously parses a React Flow visual node-link DAG,
    computes topological execution order, and orchestrates state routing.
    """

    def __init__(
        self,
        citadel: CitadelEngine,
        cortex: CortexEngine,
        echo: EchoEngine,
        mirror: MirrorEngine,
        gemini_key: str
    ):
        self.citadel = citadel
        self.cortex = cortex
        self.echo = echo
        self.mirror = mirror
        if gemini_key:
            genai.configure(api_key=gemini_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')

    async def execute_workflow(
        self,
        nodes: List[Dict[str, Any]],
        edges: List[Dict[str, Any]],
        input_value: str,
        session_id: str,
        progress_callback: Callable[[str, str, Dict[str, Any]], Any]
    ) -> Dict[str, Any]:
        """
        Executes a dynamic DAG in topological order.
        """
        logger.info(f"Loom Engine: Initiating workflow for session {session_id}")

        # 1. Map nodes by ID
        node_map = {n["id"]: n for n in nodes}
        
        # 2. Build adjacency list & count in-degrees for topological sort
        adj_list: Dict[str, List[str]] = {n["id"]: [] for n in nodes}
        in_degree: Dict[str, int] = {n["id"]: 0 for n in nodes}

        for edge in edges:
            source = edge["source"]
            target = edge["target"]
            if source in adj_list and target in in_degree:
                adj_list[source].append(target)
                in_degree[target] += 1

        # 3. Topological Sort (Kahn's Algorithm)
        queue = deque([nid for nid, deg in in_degree.items() if deg == 0])
        topo_order: List[str] = []

        while queue:
            curr = queue.popleft()
            topo_order.append(curr)
            for neighbor in adj_list[curr]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        # Cycle check
        if len(topo_order) != len(nodes):
            return {
                "status": "ERROR",
                "message": "Workflow construction failed: Cycle detected in visual layout."
            }

        # 4. Sequential Execution Loop with state propagation
        current_data = input_value
        results: Dict[str, Any] = {}
        exemplars: List[Dict[str, Any]] = []
        cortex_context = ""

        for node_id in topo_order:
            node = node_map[node_id]
            node_type = node.get("type", "input").upper()
            params = node.get("data", {})

            logger.info(f"Loom Engine: Running node {node_id} ({node_type})")
            await progress_callback(node_id, "RUNNING", {"input": current_data})
            await asyncio.sleep(0.5)  # Visual glow delay

            try:
                if node_type == "INPUT":
                    # Input node just passes the query forward
                    pass

                elif node_type == "CITADEL":
                    # Guardrails Scan
                    audit = await self.citadel.evaluate_text(current_data, "INPUT")
                    results[node_id] = audit
                    if not audit["passed"]:
                        violations = [v["rule_name"] for v in audit["violations"]]
                        await progress_callback(node_id, "VIOLATION", {"violations": violations})
                        return {
                            "status": "BLOCKED",
                            "message": f"Citadel policy violation triggered at node {node_id}.",
                            "violations": audit["violations"]
                        }

                elif node_type == "CORTEX":
                    # Long-Term Memory retrieval
                    depth = int(params.get("depth", 2))
                    keywords = [w.strip() for w in current_data.split() if len(w) > 4][:5]
                    cortex_context = self.cortex.query_context(keywords, max_depth=depth)
                    results[node_id] = {"context": cortex_context}

                elif node_type == "ECHO":
                    # Alignment few-shot exemplar search
                    limit = int(params.get("limit", 2))
                    exemplars = self.echo.retrieve_exemplars(current_data, limit=limit)
                    results[node_id] = {"exemplars_count": len(exemplars)}

                elif node_type == "LLM":
                    # Build Dynamic Prompt
                    sys_prompt = params.get("system_prompt", "You are an aligned assistant.")
                    
                    full_prompt = f"System: {sys_prompt}\n\n"
                    if cortex_context:
                        full_prompt += f"Semantic Context: {cortex_context}\n\n"
                    
                    if exemplars:
                        full_prompt += "Positive exemplars to guide your response:\n"
                        for ex in exemplars:
                            full_prompt += f"Prompt: {ex['prompt']}\nAligned Response: {ex['corrected_response'] if ex['corrected_response'] else ex['original_response']}\n\n"
                    
                    full_prompt += f"Current Input: {current_data}\n\nAligned Response:"
                    
                    response = self.model.generate_content(full_prompt)
                    current_data = response.text
                    results[node_id] = {"output": current_data}

                elif node_type == "MIRROR":
                    # Execute Sandbox writes
                    filepath = params.get("path", "output.txt")
                    self.mirror.write_file(session_id, filepath, current_data)
                    results[node_id] = {"filepath": filepath, "bytes": len(current_data)}

                elif node_type == "OUTPUT":
                    # Terminus
                    pass

                await progress_callback(node_id, "COMPLETED", {"output": current_data})

            except Exception as e:
                logger.error(f"Loom Engine: Node {node_id} execution failed: {e}")
                await progress_callback(node_id, "ERROR", {"error": str(e)})
                return {
                    "status": "ERROR",
                    "message": f"Execution failed at node {node_id}: {str(e)}"
                }

        return {
            "status": "SUCCESS",
            "output": current_data,
            "results": results
        }
