# 🧠 NeuroLinked V1.3: The DeepSeek Neural Interface

NeuroLinked is a high-fidelity, hybrid neuromorphic assistant that blends a **Biological Brain Simulation** (10,000 LIF neurons) with **Cognitive Intelligence** (NVIDIA NIM / DeepSeek-V4). This project transforms your desktop into a futuristic HUD for interacting with an evolving neural entity named **Friday/JARVIS**.

---

## 🛠️ System Map & Audit

| Directory / File | Technology | Role | Status |
| :--- | :--- | :--- | :--- |
| **`server.py`** | FastAPI, WebSockets | **The Central Hub**. Orchestrates the Voice Pipeline, NVIDIA NIM link, and UI events. | **ONLINE** |
| **`run.py`** | Python | **Entry Point**. Starts the brain simulation and initializes the web server. | **ONLINE** |
| **`fact_extractor.py`** | Regex / NLP | **Identity Parser**. Translates speech into structured facts (Name, Color, etc.). | **ONLINE** |
| **`memory_manager.py`** | JSON / NumPy | **Memory Store**. Handles structured JSON storage and semantic search. | **ONLINE** |
| **`brain/brain.py`** | NumPy | **Orchestrator**. Manages 10,000 neurons and their regional clusters. | **ONLINE** |
| **`brain/synapses.py`** | SciPy Sparse | **Learning Engine**. Implements STDP (Biological Learning) and Dopamine. | **ONLINE** |
| **`friday-interface/`** | Three.js / JS | **HUD / UI**. The cyberpunk interface you see in the browser. | **ONLINE** |

---

## 🧬 Neural Data Flow

1.  **Sensory Capture:** Browser-based Audio/Vision is streamed to the backend via WebSockets.
2.  **Fact Extraction:** `fact_extractor.py` parses speech for identity tokens (Name, Preferences).
3.  **Neural Indexing:** `memory_manager.py` stores facts in a structured JSON schema, avoiding "query echoing."
4.  **Cognitive Reasoning:** `server.py` sends user text + **Biological Firing Rates** to **DeepSeek-V4 (NVIDIA NIM)**.
5.  **Biometric Feedback:** DeepSeek replies via TTS, and a **Dopamine Pulse** is sent to the brain simulation to reinforce synaptic connections.
6.  **Real-time Visualization:** Neural spikes are rendered as 3D particles in the **Three.js HUD**.

---

## 🌐 Networking & HUD Access

The system runs a FastAPI server on **Port 8000**. Here is how to navigate it:

| URL | Purpose |
| :--- | :--- |
| `http://localhost:8000/` | **Main Dashboard**: Global overview, plugin status, and brain stats. |
| `http://localhost:8000/friday-pro/` | **Neural HUD**: The high-fidelity cyberpunk voice interface. |

### 📊 Dashboard Elements (localhost:8000)
*   **Neural Activity Graph**: Visualizes global spikes over time using Chart.js.
*   **Regional Metabolism**: Shows which parts of the brain (Visual, Auditory) are most active.
*   **Plugin Status**: Live indicators for Gmail, Shopify, and Database connections.
*   **Synaptic Load**: Real-time count of active memory pathways.

### 🛠️ How it Works (Under the Hood)
1.  **FastAPI** serves the static HUD files from `/friday-interface/` and `/dashboard/`.
2.  **Uvicorn** handles the high-speed WebSocket connections.
3.  **Live Sync**: The page connects to `ws://localhost:8000/ws` to receive real-time neural data.

---

## 🤖 Current Operational Status

*   **✅ WORKING:** Voice Link, Factual Recall, Dopamine Feedback, Biological Simulation, Multi-Tenant Persistence.
*   **⚠️ PARTIAL:** Vision Link (Region excitation works, but visual-description requires a Vision-LLM update).
*   **🛠️ IN-PROGRESS:** Tool Execution (Invoking Gmail/Shopify plugins via DeepSeek prompts).

---

> **Note:** All neural states are persisted in `brain_state/`. This folder contains the "soul" of your assistant—do not delete it unless you wish to reset JARVIS's memory.
