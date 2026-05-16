import networkx as nx
import logging
import json
import google.generativeai as genai
from typing import List, Dict, Any, Optional
from cortex_engine import CortexEngine

logger = logging.getLogger("AetherCortex")

class GraphReasoningEngine:
    """
    Performs logical reasoning and path discovery across the semantic knowledge graph.
    """
    
    def __init__(self, api_key: str, cortex: CortexEngine):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.cortex = cortex

    async def discover_hidden_connections(self, start_entity: str, end_entity: str) -> Dict[str, Any]:
        """
        Finds the shortest path between two entities and uses an LLM to 'reason' about their link.
        """
        start_entity = start_entity.lower().strip()
        end_entity = end_entity.lower().strip()

        if not self.cortex.graph.has_node(start_entity) or not self.cortex.graph.has_node(end_entity):
            return {"status": "ERROR", "message": "One or both entities not found in the Cortex."}

        try:
            # 1. Find the shortest path (ignoring direction for discovery)
            undirected = self.cortex.graph.to_undirected()
            path = nx.shortest_path(undirected, source=start_entity, target=end_entity)
            
            # 2. Extract context along the path
            path_triplets = []
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                # Find the relationship data (might be u->v or v->u)
                if self.cortex.graph.has_edge(u, v):
                    data = self.cortex.graph.get_edge_data(u, v)
                    path_triplets.append(f"({u}) -[{data['relationship']}]-> ({v})")
                else:
                    data = self.cortex.graph.get_edge_data(v, u)
                    path_triplets.append(f"({v}) -[{data['relationship']}]-> ({u})")

            # 3. Use LLM to reason about the connection
            context = "\n".join(path_triplets)
            prompt = f"""
            As a Semantic Analyst for the Aether Cortex, analyze the following chain of relationships 
            between '{start_entity}' and '{end_entity}'. 
            
            CHAIN:
            {context}
            
            Based on this chain, explain how these two entities are semantically related in 2-3 concise sentences.
            """
            
            response = self.model.generate_content(prompt)
            reasoning = response.text.strip()

            return {
                "status": "SUCCESS",
                "path": path,
                "triplets": path_triplets,
                "reasoning": reasoning
            }

        except nx.NetworkXNoPath:
            return {"status": "ERROR", "message": "No semantic path exists between these entities."}
        except Exception as e:
            logger.error(f"Reasoning failure: {e}")
            return {"status": "ERROR", "message": str(e)}

    async def identify_concept_clusters(self) -> List[Dict[str, Any]]:
        """
        Detects communities/clusters in the knowledge graph.
        """
        try:
            # Use Louvain or simple connected components for basic clustering
            undirected = self.cortex.graph.to_undirected()
            communities = list(nx.community.greedy_modularity_communities(undirected))
            
            clusters = []
            for i, comm in enumerate(communities):
                nodes = list(comm)
                # Use LLM to name the cluster based on nodes
                nodes_str = ", ".join(nodes[:10])
                name_prompt = f"Given these entities: {nodes_str}. Provide a single 1-3 word theme or category name for this group."
                
                try:
                    name_resp = self.model.generate_content(name_prompt)
                    theme = name_resp.text.strip()
                except:
                    theme = f"Cluster {i+1}"

                clusters.append({
                    "id": i,
                    "theme": theme,
                    "nodes": nodes,
                    "density": nx.density(self.cortex.graph.subgraph(nodes))
                })
            
            return clusters
        except Exception as e:
            logger.error(f"Clustering failure: {e}")
            return []
