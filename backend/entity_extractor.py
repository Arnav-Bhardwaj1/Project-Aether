import json
import logging
import google.generativeai as genai
from typing import List, Dict, Any
from cortex_engine import CortexEngine

logger = logging.getLogger("AetherCortex")

class EntityExtractor:
    """
    Uses an LLM to extract semantic triplets (Subject, Predicate, Object) from natural language
    and injects them into the CortexEngine.
    """
    
    def __init__(self, api_key: str, cortex: CortexEngine):
        if api_key:
            genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.cortex = cortex

    async def extract_and_store(self, text: str, source: str = "agent"):
        """Extracts facts from text and commits them to long-term memory."""
        
        system_instruction = """
        You are an advanced Entity Extraction and Semantic Analysis engine.
        Analyze the following text and extract core facts, entities, and relationships as semantic triplets.
        Focus on persistent knowledge (e.g., configurations, user preferences, architectural details, facts) 
        rather than conversational filler.

        Format your output as a strict JSON array of objects, where each object has:
        - "subject": The primary entity (e.g., "Database", "User")
        - "predicate": The relationship (e.g., "uses", "is hosted on", "prefers")
        - "object": The target entity or value (e.g., "PostgreSQL", "AWS", "Dark Mode")
        
        Keep strings concise (1-3 words preferably).
        If no meaningful persistent facts are found, return an empty array [].
        Do NOT wrap the JSON in markdown blocks.
        """
        
        try:
            response = self.model.generate_content(
                f"{system_instruction}\n\nTEXT TO ANALYZE:\n{text}\n\nJSON Output:"
            )
            content = response.text.strip()
            
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            triplets = json.loads(content)
            
            for t in triplets:
                if "subject" in t and "predicate" in t and "object" in t:
                    self.cortex.add_memory(t["subject"], t["predicate"], t["object"], source=source)
                    
            return triplets
            
        except Exception as e:
            logger.error(f"Failed to extract entities: {e}")
            return []
