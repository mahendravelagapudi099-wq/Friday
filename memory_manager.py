import os
import json
import uuid
import time
import numpy as np

class MemoryManager:
    """Manages structured long-term memory with hierarchical retrieval."""
    
    def __init__(self, storage_path="brain_state/knowledge/structured_memory.json"):
        self.storage_path = storage_path
        self.memories = []
        self._load()

    def _load(self):
        if os.path.exists(self.storage_path):
            try:
                with open(self.storage_path, "r") as f:
                    self.memories = json.load(f)
            except:
                self.memories = []
        else:
            os.makedirs(os.path.dirname(self.storage_path), exist_ok=True)

    def _save(self):
        with open(self.storage_path, "w") as f:
            json.dump(self.memories, f, indent=2)

    def store_fact(self, key: str, value: str, embedding: list = None):
        """Updates or creates a structured fact."""
        # Check for existing key to avoid duplicates
        for mem in self.memories:
            if mem.get("key") == key:
                mem["value"] = value
                mem["timestamp"] = int(time.time())
                self._save()
                return

        new_mem = {
            "id": str(uuid.uuid4()),
            "type": "fact",
            "key": key,
            "value": value,
            "embedding": embedding,
            "timestamp": int(time.time())
        }
        self.memories.append(new_mem)
        self._save()

    def get_by_key(self, key: str):
        """Direct lookup by key (highest priority)."""
        for mem in self.memories:
            if mem.get("key") == key:
                return mem
        return None

    def semantic_search(self, query_embedding: list, threshold=0.8):
        """Fallback to semantic search if direct key match fails."""
        if not self.memories or query_embedding is None:
            return None
        
        best_match = None
        highest_sim = -1
        
        q_vec = np.array(query_embedding)
        
        for mem in self.memories:
            if mem.get("embedding") is None:
                continue
                
            m_vec = np.array(mem["embedding"])
            # Cosine similarity
            sim = np.dot(q_vec, m_vec) / (np.linalg.norm(q_vec) * np.linalg.norm(m_vec))
            
            if sim > highest_sim:
                highest_sim = sim
                best_match = mem
        
        if highest_sim > threshold:
            return best_match
        return None

    def format_response(self, mem: dict):
        """Formats a memory into a professional persona response."""
        key = mem.get("key")
        val = mem.get("value")
        
        templates = {
            "name": f"Your name is {val}.",
            "favorite_color": f"Your favorite color is {val}.",
            "location": f"You are currently based in {val}.",
            "profession": f"Your professional record indicates you are a {val}."
        }
        
        return templates.get(key, f"I have a record of this: {val}.")
