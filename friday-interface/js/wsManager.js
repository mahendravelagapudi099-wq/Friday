/**
 * WebSocketManager - Handles real-time communication with the NeuroLinked backend.
 */
export class WebSocketManager {
    constructor() {
        this.socket = null;
        this.reconnectInterval = 3000;
        this.connect();
    }

    connect() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.socket = new WebSocket(`${protocol}//${host}/ws`);

        this.socket.onopen = () => {
            console.log("[WS] Connected to NeuroLinked Backend");
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.handleMessage(data);
            } catch (err) {
                console.error("[WS] Message error:", err);
            }
        };

        this.socket.onclose = () => {
            console.warn("[WS] Disconnected. Reconnecting...");
            setTimeout(() => this.connect(), this.reconnectInterval);
        };

        this.socket.onerror = (err) => {
            console.error("[WS] Socket error:", err);
            this.socket.close();
        };
    }

    handleMessage(data) {
        if (!data.type) return;

        switch (data.type) {
            case 'init':
                console.log("[WS] Brain Init Received");
                break;
            case 'state':
                window.dispatchEvent(new CustomEvent('neural-state-update', { detail: data.state }));
                break;
            case 'voice_input':
                console.log("[WS] Voice Input:", data.text);
                window.dispatchEvent(new CustomEvent('neural-voice-input', { detail: { text: data.text } }));
                break;
            case 'voice_response':
                console.log("[WS] JARVIS Response:", data.text);
                window.dispatchEvent(new CustomEvent('neural-voice-response', { detail: { text: data.text } }));
                break;
        }
    }
}
