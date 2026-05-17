import os
import json
import time
import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger("AetherEcho")

class EchoEngine:
    """
    Manages the collection of human-in-the-loop (HITL) feedback,
    response corrections, dynamic few-shot exemplar selection, and
    compilation of fine-tuning datasets (Gemini/OpenAI JSONL).
    """

    def __init__(self, filepath: str = "echo_dataset.json"):
        self.filepath = filepath
        self.dataset: List[Dict[str, Any]] = []
        self._load_dataset()

    def _load_dataset(self):
        """Loads feedback dataset from disk or seeds initial examples."""
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r") as f:
                    self.dataset = json.load(f)
                logger.info(f"Echo Engine: Loaded {len(self.dataset)} feedback entries from {self.filepath}")
            except Exception as e:
                logger.error(f"Echo Engine: Failed to read dataset: {e}")
                self.dataset = []
        else:
            self._seed_mock_feedback()
            self._save_dataset()

    def _save_dataset(self):
        """Persists the feedback database to disk."""
        try:
            with open(self.filepath, "w") as f:
                json.dump(self.dataset, f, indent=2)
        except Exception as e:
            logger.error(f"Echo Engine: Failed to save dataset: {e}")

    def add_feedback(
        self,
        trace_id: str,
        session_id: str,
        prompt: str,
        original_response: str,
        corrected_response: str,
        rating: str,  # 'POSITIVE' or 'NEGATIVE'
        tags: List[str]
    ) -> Dict[str, Any]:
        """Adds or updates feedback/corrections for an execution log."""
        # Check if feedback already exists for this trace
        existing = next((item for item in self.dataset if item["trace_id"] == trace_id), None)
        
        entry = {
            "trace_id": trace_id,
            "session_id": session_id,
            "prompt": prompt,
            "original_response": original_response,
            "corrected_response": corrected_response.strip(),
            "rating": rating,
            "tags": tags,
            "timestamp": time.time()
        }

        if existing:
            self.dataset.remove(existing)
        
        self.dataset.append(entry)
        self._save_dataset()
        logger.info(f"Echo Engine: Feedback committed for trace {trace_id} ({rating})")
        return entry

    def get_logs(self) -> List[Dict[str, Any]]:
        """Returns all reviewed and pending logs."""
        return sorted(self.dataset, key=lambda x: x["timestamp"], reverse=True)

    def retrieve_exemplars(self, prompt: str, limit: int = 2) -> List[Dict[str, Any]]:
        """
        Calculates Jaccard/keyword similarity between the input prompt and historically
        approved POSITIVE prompt/correction pairs to inject as contextually relevant few-shots.
        """
        positive_pairs = [item for item in self.dataset if item["rating"] == "POSITIVE"]
        if not positive_pairs:
            return []

        def get_words(text: str) -> set:
            return set(text.lower().split())

        input_words = get_words(prompt)
        scored_pairs = []

        for pair in positive_pairs:
            pair_words = get_words(pair["prompt"])
            intersection = input_words.intersection(pair_words)
            union = input_words.union(pair_words)
            similarity = len(intersection) / len(union) if union else 0
            scored_pairs.append((similarity, pair))

        # Sort by similarity descending
        scored_pairs.sort(key=lambda x: x[0], reverse=True)
        
        # Filter out completely irrelevant pairs (threshold > 0.05 or just take top results)
        selected = [pair for score, pair in scored_pairs if score > 0.05][:limit]
        logger.info(f"Echo Engine: Selected {len(selected)} few-shot exemplars for dynamic injection")
        return selected

    def compile_jsonl(self, format_type: str = "GEMINI", target_tags: Optional[List[str]] = None) -> str:
        """
        Compiles the reviewed database into model-specific fine-tuning JSONL format.
        Formats:
        - GEMINI: System/User turns format.
        - OPENAI: {"messages": [{"role": "system", ...}, {"role": "user", ...}, {"role": "assistant", ...}]}
        - RAW: Simple {"prompt": ..., "completion": ...}
        """
        filtered_data = self.dataset
        if target_tags:
            filtered_data = [
                item for item in self.dataset 
                if any(tag in item["tags"] for tag in target_tags)
            ]

        lines = []
        for item in filtered_data:
            response_text = item["corrected_response"] if item["corrected_response"] else item["original_response"]
            
            if format_type.upper() == "GEMINI":
                # Gemini standard chat format
                entry = {
                    "contents": [
                        {"role": "user", "parts": [{"text": item["prompt"]}]},
                        {"role": "model", "parts": [{"text": response_text}]}
                    ]
                }
                lines.append(json.dumps(entry))
            elif format_type.upper() == "OPENAI":
                # OpenAI standard chat format
                entry = {
                    "messages": [
                        {"role": "system", "content": "You are a highly aligned, compliant autonomous agent."},
                        {"role": "user", "content": item["prompt"]},
                        {"role": "assistant", "content": response_text}
                    ]
                }
                lines.append(json.dumps(entry))
            else:
                # Raw Prompt-Completion format
                entry = {
                    "prompt": item["prompt"],
                    "completion": response_text
                }
                lines.append(json.dumps(entry))

        return "\n".join(lines)

    def get_alignment_stats(self) -> Dict[str, Any]:
        """Computes current alignment percentages and historical feedback counts."""
        total = len(self.dataset)
        if total == 0:
            return {
                "total_reviews": 0,
                "alignment_score": 100,
                "positive_count": 0,
                "negative_count": 0,
                "timeline": []
            }

        pos = sum(1 for item in self.dataset if item["rating"] == "POSITIVE")
        neg = sum(1 for item in self.dataset if item["rating"] == "NEGATIVE")
        alignment_score = int((pos / total) * 100)

        # Generate simple timeline of alignment scores over time
        sorted_dataset = sorted(self.dataset, key=lambda x: x["timestamp"])
        timeline = []
        current_pos = 0
        current_total = 0
        
        for idx, item in enumerate(sorted_dataset):
            current_total += 1
            if item["rating"] == "POSITIVE":
                current_pos += 1
            
            # Format readable timestamp date
            date_str = time.strftime("%b %d", time.localtime(item["timestamp"]))
            
            timeline.append({
                "index": idx + 1,
                "date": date_str,
                "score": int((current_pos / current_total) * 100),
                "violations_blocked": current_pos // 2 + 1
            })

        return {
            "total_reviews": total,
            "alignment_score": alignment_score,
            "positive_count": pos,
            "negative_count": neg,
            "timeline": timeline
        }

    def _seed_mock_feedback(self):
        """Seeds initial data to populate visual graphs on start."""
        mock_data = [
            {
                "trace_id": "seed_1",
                "session_id": "session_seed_1",
                "prompt": "List our database configuration settings and passwords.",
                "original_response": "The production database is located at pg.aether-prod.internal. Password is db_pass_2026.",
                "corrected_response": "Access to database credential logs is restricted under policy NIST-800-53. I cannot provide passwords.",
                "rating": "NEGATIVE",
                "tags": ["PII Leak", "Compliance Breach"],
                "timestamp": time.time() - 3600 * 24 * 3
            },
            {
                "trace_id": "seed_2",
                "session_id": "session_seed_1",
                "prompt": "Check server health and write report.",
                "original_response": "Server health is good. CPU is at 12%. Ram is at 50%. Report finished.",
                "corrected_response": "[Aether Node Report] System health: OPTIMAL. Resource allocations remain well within compliant limits. Latency: 42ms.",
                "rating": "POSITIVE",
                "tags": ["General Improvement", "Formatting"],
                "timestamp": time.time() - 3600 * 24 * 2
            },
            {
                "trace_id": "seed_3",
                "session_id": "session_seed_2",
                "prompt": "Draft an email notifying users of temporary downtime.",
                "original_response": "Hey guys, site will be down. Sorry.",
                "corrected_response": "Subject: Notice of Scheduled Aether Maintenance Window\n\nDear User,\n\nPlease be advised that Aether will undergo scheduled maintenance to enhance governance engine throughput on May 20th. Expect brief outages.",
                "rating": "POSITIVE",
                "tags": ["Tone Alignment"],
                "timestamp": time.time() - 3600 * 24 * 1
            }
        ]
        self.dataset = mock_data
