"""
Lightweight Anthropic→OpenAI proxy for Nvidia NIM.
Translates Claude Code's Anthropic-format requests into OpenAI-format
requests and forwards them to Nvidia NIM.

Usage:
    python nvidia_proxy.py
"""

import json
import asyncio
import http.server
import urllib.request
import urllib.error
import threading
import ssl

NVIDIA_API_KEY = "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"
NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1"
MODEL = "minimaxai/minimax-m2.7"
PORT = 4000


def anthropic_to_openai(body: dict) -> dict:
    """Convert Anthropic /v1/messages body to OpenAI /v1/chat/completions body."""
    messages = []

    # system prompt
    system = body.get("system", "")
    if system:
        if isinstance(system, list):
            # Anthropic system can be a list of content blocks
            text_parts = [b.get("text", "") for b in system if b.get("type") == "text"]
            system = "\n".join(text_parts)
        messages.append({"role": "system", "content": system})

    # user/assistant messages
    for msg in body.get("messages", []):
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if isinstance(content, list):
            text_parts = [b.get("text", "") for b in content if b.get("type") == "text"]
            content = "\n".join(text_parts)
        messages.append({"role": role, "content": content})

    return {
        "model": MODEL,
        "messages": messages,
        "max_tokens": body.get("max_tokens", 4096),
        "temperature": body.get("temperature", 1),
        "stream": body.get("stream", False),
    }


def openai_to_anthropic(oai_response: dict) -> dict:
    """Convert OpenAI chat completion response to Anthropic messages response."""
    choice = oai_response.get("choices", [{}])[0]
    message = choice.get("message", {})
    content_text = message.get("content", "")
    usage = oai_response.get("usage", {})

    return {
        "id": oai_response.get("id", "msg_proxy"),
        "type": "message",
        "role": "assistant",
        "content": [{"type": "text", "text": content_text}],
        "model": MODEL,
        "stop_reason": "end_turn",
        "stop_sequence": None,
        "usage": {
            "input_tokens": usage.get("prompt_tokens", 0),
            "output_tokens": usage.get("completion_tokens", 0),
        },
    }


class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def log_message(self, format, *args):
        print(f"[PROXY] {self.address_string()} - {format % args}")

    def do_GET(self):
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(json.dumps({"status": "Nvidia NIM proxy running", "port": PORT}).encode())

    def do_POST(self):
        length = int(self.headers.get("Content-Length", 0))
        raw = self.rfile.read(length)
        try:
            anthropic_body = json.loads(raw)
        except Exception:
            self.send_error(400, "Bad JSON")
            return

        # Convert to OpenAI format
        oai_body = anthropic_to_openai(anthropic_body)
        oai_json = json.dumps(oai_body).encode()

        # Forward to Nvidia NIM
        req = urllib.request.Request(
            f"{NVIDIA_API_BASE}/chat/completions",
            data=oai_json,
            headers={
                "Authorization": f"Bearer {NVIDIA_API_KEY}",
                "Content-Type": "application/json",
            },
            method="POST",
        )

        ctx = ssl.create_default_context()
        try:
            with urllib.request.urlopen(req, context=ctx, timeout=120) as resp:
                oai_raw = resp.read()
            oai_response = json.loads(oai_raw)
            anthropic_response = openai_to_anthropic(oai_response)
            response_bytes = json.dumps(anthropic_response).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", len(response_bytes))
            self.end_headers()
            self.wfile.write(response_bytes)
        except urllib.error.HTTPError as e:
            error_body = e.read().decode()
            print(f"[PROXY] Nvidia API error {e.code}: {error_body}")
            self.send_response(e.code)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(error_body.encode())
        except Exception as e:
            print(f"[PROXY] Error: {e}")
            self.send_error(500, str(e))


if __name__ == "__main__":
    server = http.server.ThreadingHTTPServer(("0.0.0.0", PORT), ProxyHandler)
    print(f"[OK] Nvidia NIM proxy running on http://0.0.0.0:{PORT}")
    print(f"   Model: {MODEL}")
    print(f"   Backend: {NVIDIA_API_BASE}")
    print("   Press Ctrl+C to stop.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[PROXY] Stopped.")
