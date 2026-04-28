import os
from openai import OpenAI

# 1. Initialize the client
# Note: base_url must point to NVIDIA's integration endpoint
client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key="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"  # Replace with your key
)

# 2. Define the request
model_name = "nvidia/llama-3.1-nemotron-70b-instruct"

messages = [
    {"role": "system", "content": "You are an expert Python developer."},
    {"role": "user", "content": "Write a Python function to calculate the Fibonacci sequence using memoization."}
]

try:
    print(f"Sending request to {model_name}...")
    # 3. Make the API call
    completion = client.chat.completions.create(
        model=model_name,
        messages=messages,
        temperature=0.7,
        max_tokens=1024,
        stream=False
    )

    # 4. Process the response
    print(f"\n--- Response from {model_name} ---\n")
    print(completion.choices[0].message.content)
    print("\n--- End of Response ---")

except Exception as e:
    print(f"Error: {e}")