import os
from openai import OpenAI

client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"
)

try:
    print("Listing models...")
    models = client.models.list()
    for model in models:
        print(model.id)
except Exception as e:
    print(f"Error: {e}")
