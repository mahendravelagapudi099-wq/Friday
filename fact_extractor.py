import re

class FactExtractor:
    """Deterministic extraction of user facts from natural language."""
    
    def __init__(self):
        # Pattern mapping: Regex -> (Key, Label)
        self.rules = [
            (r"(?:my name is|i am|call me) ([\w\s]+)", "name"),
            (r"(?:my favorite color is|i love the color) ([\w\s]+)", "favorite_color"),
            (r"(?:i live in|i am from) ([\w\s,]+)", "location"),
            (r"(?:i work as a|my job is) ([\w\s]+)", "profession"),
            (r"(?:my birthday is) ([\w\s,]+)", "birthday")
        ]

    def extract(self, text: str):
        """Returns a list of (key, value) pairs found in the text."""
        facts = []
        clean_text = text.lower().strip()
        
        # Avoid extracting from questions
        if "?" in clean_text or any(w in clean_text for w in ["what", "who", "where", "how", "why"]):
            return []

        for pattern, key in self.rules:
            match = re.search(pattern, clean_text)
            if match:
                value = match.group(1).strip()
                facts.append({"key": key, "value": value})
        
        return facts

    def is_query_for_fact(self, text: str):
        """Detects if the user is asking for a specific stored fact using strong patterns."""
        text = text.lower()
        patterns = {
            "name": ["my name", "who am i", "what is my name"],
            "favorite_color": ["favorite color", "favourite color", "which color i like"],
            "location": ["where do i live", "my location", "where am i from"],
            "profession": ["my job", "what do i do", "my profession"]
        }
        for key, phrases in patterns.items():
            if any(p in text for p in phrases):
                return key
        return None
