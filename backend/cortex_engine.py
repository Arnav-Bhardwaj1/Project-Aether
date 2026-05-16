import networkx as nx
import json
import logging
from typing import Dict, Any, List

logger = logging.getLogger("AetherCortex")

class CortexEngine:
    """
    Manages the long-term semantic knowledge graph using NetworkX.
    """
    
    def __init__(self):
        self.graph = nx.DiGraph()
        
    def add_memory(self, subject: str, predicate: str, object_: str, source: str = "agent"):
        """Adds a triplet memory to the graph."""
        # Clean and normalize strings (lowercase, strip whitespace)
        subject = subject.strip().lower()
        predicate = predicate.strip().lower()
        object_ = object_.strip().lower()
        
        # Add nodes with basic metadata
        if not self.graph.has_node(subject):
            self.graph.add_node(subject, label=subject, type="entity")
        if not self.graph.has_node(object_):
            self.graph.add_node(object_, label=object_, type="entity")
            
        # Add edge representing the relationship
        self.graph.add_edge(subject, object_, relationship=predicate, source=source)
        logger.info(f"Cortex Synapse Formed: ({subject}) -[{predicate}]-> ({object_})")

    def query_context(self, keywords: List[str], max_depth: int = 2) -> str:
        """Retrieves relevant subgraph context based on keywords."""
        relevant_nodes = set()
        
        for kw in keywords:
            kw = kw.lower()
            if self.graph.has_node(kw):
                # Get the neighborhood of the node
                neighborhood = nx.single_source_shortest_path_length(self.graph, kw, cutoff=max_depth)
                relevant_nodes.update(neighborhood.keys())
                
                # Also check predecessors (incoming edges)
                pred_neighborhood = nx.single_target_shortest_path_length(self.graph, kw, cutoff=max_depth)
                relevant_nodes.update(pred_neighborhood.keys())
                
        if not relevant_nodes:
            return ""
            
        subgraph = self.graph.subgraph(relevant_nodes)
        
        context_strings = []
        for u, v, data in subgraph.edges(data=True):
            context_strings.append(f"{u} {data.get('relationship', 'is related to')} {v}")
            
        return " | ".join(context_strings)

    def get_full_graph_data(self) -> Dict[str, Any]:
        """Exports the graph in a format suitable for the frontend visualization."""
        nodes = []
        for n, data in self.graph.nodes(data=True):
            nodes.append({
                "id": n,
                "label": data.get("label", n),
                "type": data.get("type", "entity"),
                "degree": self.graph.degree(n)
            })
            
        links = []
        for u, v, data in self.graph.edges(data=True):
            links.append({
                "source": u,
                "target": v,
                "relationship": data.get("relationship", ""),
                "provenance": data.get("source", "agent")
            })
            
        return {
            "nodes": nodes,
            "links": links,
            "stats": {
                "node_count": self.graph.number_of_nodes(),
                "edge_count": self.graph.number_of_edges(),
                "density": nx.density(self.graph) if self.graph.number_of_nodes() > 1 else 0
            }
        }

    def save_to_file(self, filename: str = "cortex_backup.json"):
        """Serializes the graph to a JSON file."""
        try:
            data = nx.node_link_data(self.graph)
            with open(filename, 'w') as f:
                json.dump(data, f, indent=2)
            logger.info(f"Cortex Persistence: Saved knowledge graph to {filename}")
        except Exception as e:
            logger.error(f"Failed to save graph: {e}")

    def load_from_file(self, filename: str = "cortex_backup.json"):
        """Loads the graph from a JSON file."""
        try:
            with open(filename, 'r') as f:
                data = json.load(f)
            self.graph = nx.node_link_graph(data)
            logger.info(f"Cortex Persistence: Loaded knowledge graph from {filename}")
        except FileNotFoundError:
            logger.warning("Cortex Persistence: No backup file found. Starting fresh.")
        except Exception as e:
            logger.error(f"Failed to load graph: {e}")

    def update_node_metadata(self, node_id: str, updates: Dict[str, Any]):
        """Updates metadata for a specific node."""
        if self.graph.has_node(node_id):
            for k, v in updates.items():
                self.graph.nodes[node_id][k] = v

