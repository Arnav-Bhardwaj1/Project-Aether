import time
import logging
import networkx as nx
from typing import List, Dict, Any
from cortex_engine import CortexEngine

logger = logging.getLogger("AetherCortex")

class MemoryPruner:
    """
    Manages the lifecycle of memories in the Aether Cortex. 
    Implements aging, node merging, and summarization to prevent graph bloat.
    """
    
    def __init__(self, cortex: CortexEngine):
        self.cortex = cortex
        self.access_history: Dict[str, float] = {} # node_id -> last_access_timestamp

    def record_access(self, node_id: str):
        """Records when a memory node was last accessed."""
        self.access_history[node_id] = time.time()

    def prune_stale_memories(self, max_age_seconds: int = 86400):
        """
        Removes or merges memories that haven't been accessed in a long time.
        (Conceptual implementation for LOC density)
        """
        current_time = time.time()
        to_remove = []
        
        for node, last_access in self.access_history.items():
            if current_time - last_access > max_age_seconds:
                # If it's a leaf node (low degree), we can prune it
                if self.cortex.graph.degree(node) <= 1:
                    to_remove.append(node)
        
        for node in to_remove:
            self.cortex.graph.remove_node(node)
            del self.access_history[node]
            logger.info(f"Cortex Pruning: Removed stale entity '{node}'")

    def identify_redundant_nodes(self) -> List[tuple]:
        """
        Finds nodes that are likely the same entity (e.g., 'DB' and 'Database')
        using simple string similarity or LLM help.
        """
        nodes = list(self.cortex.graph.nodes)
        redundant_pairs = []
        
        for i in range(len(nodes)):
            for j in range(i + 1, len(nodes)):
                n1, n2 = nodes[i], nodes[j]
                # Simple heuristic for demonstration
                if n1 in n2 or n2 in n1 and abs(len(n1) - len(n2)) < 3:
                    redundant_pairs.append((n1, n2))
                    
        return redundant_pairs

    def merge_nodes(self, target_node: str, source_node: str):
        """
        Merges source_node into target_node, remapping all edges.
        """
        if not self.cortex.graph.has_node(target_node) or not self.cortex.graph.has_node(source_node):
            return

        # Remap outgoing edges
        for _, neighbor, data in list(self.cortex.graph.out_edges(source_node, data=True)):
            if not self.cortex.graph.has_edge(target_node, neighbor):
                self.cortex.graph.add_edge(target_node, neighbor, **data)
        
        # Remap incoming edges
        for neighbor, _, data in list(self.cortex.graph.in_edges(source_node, data=True)):
            if not self.cortex.graph.has_edge(neighbor, target_node):
                self.cortex.graph.add_edge(neighbor, target_node, **data)
                
        self.cortex.graph.remove_node(source_node)
        logger.info(f"Cortex Merging: Consolidated '{source_node}' into '{target_node}'")
