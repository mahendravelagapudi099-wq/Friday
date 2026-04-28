import re
with open("E:/NeuroLinked-V1.3-SOURCE/sensory/vision.py", "r", encoding="utf-8") as f:
    content = f.read()

# Fix the duplicate lines
content = content.replace("self.prev_frame = gray\\n        self.last_frame = frame\\n        return frame\\n        self.last_frame = frame\\n        return frame\n\n\n        # Normalize\n", "self.prev_frame = gray\n        self.last_frame = frame\n\n")

# Remove the duplicate normalize section
content = content.replace("\n        # Normalize\n        features = np.clip(features, 0, 1)\n        return features\n", "")

with open("E:/NeuroLinked-V1.3-SOURCE/sensory/vision.py", "w", encoding="utf-8") as f:
    f.write(content)
print("Fixed")
