import re
with open('server.py', 'r', encoding='utf-8') as f:
    content = f.read()
# Replace the OLLAMA section header
old1 = ''
_OLLAMA_MODELS = ["dolphin-local:latest", "mistral:7b", "qwen3-coder:480b-cloud"]
_OLLAMA_BASE   = "http://localhost:11434"'
new1 = ''
# NVIDIA NIM Integration for intelligent responses'
content = content.replace(old1, new1)
