document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const micBtn = document.getElementById('mic-btn');
    const ttsBtn = document.getElementById('tts-btn');
    const visionBtn = document.getElementById('vision-btn');
    const visionContainer = document.getElementById('vision-container');
    const visionVideo = document.getElementById('vision-video');
    const statusText = document.getElementById('status-text');
    const statusInfo = document.getElementById('status-info');

    let isRecording = false;
    let isVisionActive = false;
    let ttsEnabled = true;
    let videoStream = null;
    let isProcessing = false;
    let msgId = 1;

    // --- SPEECH SYNTHESIS (TTS) ---
    function speak(text) {
        if (!ttsEnabled) return;
        window.speechSynthesis.cancel();
        const clean = text.replace(/\*\*([^*]+)\*\*/g, "$1");
        const u = new SpeechSynthesisUtterance(clean);
        u.rate = 0.92;
        u.pitch = 0.78;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(v => v.name.includes("Google UK English Male"))
            || voices.find(v => /david/i.test(v.name))
            || voices.find(v => v.lang.startsWith("en") && !v.localService)
            || voices.find(v => v.lang.startsWith("en"));
        if (preferred) u.voice = preferred;
        u.onstart = () => { setStatus("SPEAKING"); };
        u.onend = () => { setStatus("READY"); };
        u.onerror = () => { setStatus("READY"); };
        window.speechSynthesis.speak(u);
        setStatus("SPEAKING");
    }

    // --- SPEECH RECOGNITION (STT) ---
    let recognition = null;
    const SpeechRecog = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecog) {
        recognition = new SpeechRecog();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript.trim();
            if (!transcript) return;
            await handleUserInput(transcript);
        };
        recognition.onerror = () => { setStatus("READY"); isRecording = false; updateMicBtn(); };
        recognition.onend = () => { if (isRecording) { isRecording = false; updateMicBtn(); } };
    }

    // --- CHAT HISTORY ---
    function addMessage(role, text) {
        const div = document.createElement("div");
        div.className = "chat-message " + role;
        div.innerHTML = `<span class="chat-role">${role === "user" ? "YOU" : "JARVIS"}</span><span class="chat-text">${escapeHtml(text)}</span>`;
        chatHistory.appendChild(div);
        chatHistory.scrollTop = chatHistory.scrollHeight;
        // limit history
        while (chatHistory.children.length > 50) {
            chatHistory.removeChild(chatHistory.firstChild);
        }
    }

    function escapeHtml(text) {
        const d = document.createElement("div");
        d.textContent = text;
        return d.innerHTML;
    }

    function setStatus(info) {
        if (statusInfo) statusInfo.textContent = info;
    }

    // --- ANALYZE VISION FRAME ---
    async function analyzeVision() {
        try {
            const resp = await fetch("/api/vision/analyze", { method: "POST" });
            const data = await resp.json();
            return data.analysis || null;
        } catch {
            return null;
        }
    }

    // --- HANDLE USER INPUT ---
    async function handleUserInput(text) {
        if (isProcessing) return;
        isProcessing = true;
        addMessage("user", text);
        setStatus("PROCESSING");

        const visionKeywords = ["see", "look", "what", "camera", "optic", "vision", "around", "watching", "describe"];
        const isVisionQuery = visionKeywords.some(kw => text.toLowerCase().includes(kw));

        let fullText = text;
        if (isVisionQuery && isVisionActive) {
            setStatus("ANALYZING VISION");
            addMessage("system", "Initiating visual analysis...");
            const analysis = await analyzeVision();
            if (analysis) {
                fullText = text + ". The camera shows: " + analysis;
                addMessage("system", "Optic: " + analysis);
            }
        }

        try {
            const resp = await fetch("/api/assistant/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: fullText })
            });
            const data = await resp.json();
            if (data.ok && data.response) {
                addMessage("jarvis", data.response);
                if (ttsEnabled) speak(data.response);
                if (window.brainCore) window.brainCore.triggerPulse();
            } else {
                addMessage("jarvis", "Neural processing error, sir. Please try again.");
            }
        } catch {
            addMessage("jarvis", "Connection lost to the brain server.");
        }

        setStatus("READY");
        isProcessing = false;
    }

    function updateMicBtn() {
        if (!micBtn) return;
        if (isRecording) {
            micBtn.classList.add("active");
            micBtn.querySelector(".btn-label").textContent = "STOP";
            setStatus("LISTENING");
        } else {
            micBtn.classList.remove("active");
            micBtn.querySelector(".btn-label").textContent = "VOICE";
        }
    }

    // --- MIC BUTTON ---
    if (micBtn) {
        micBtn.addEventListener("click", async () => {
            if (!recognition) {
                alert("Speech recognition not supported in this browser.");
                return;
            }
            if (isRecording) {
                recognition.stop();
                window.speechSynthesis.cancel();
                isRecording = false;
                updateMicBtn();
            } else {
                window.speechSynthesis.cancel();
                try {
                    recognition.start();
                    isRecording = true;
                    updateMicBtn();
                } catch(e) {
                    console.error("STT error", e);
                    setStatus("STT ERROR");
                }
            }
        });
    }

    // --- TTS TOGGLE ---
    if (ttsBtn) {
        ttsBtn.addEventListener("click", () => {
            ttsEnabled = !ttsEnabled;
            if (!ttsEnabled) window.speechSynthesis.cancel();
            ttsBtn.classList.toggle("tts-on", ttsEnabled);
            ttsBtn.classList.toggle("tts-off", !ttsEnabled);
            ttsBtn.querySelector(".btn-label").textContent = ttsEnabled ? "TTS ON" : "TTS OFF";
        });
    }

    // --- VISION TOGGLE ---
    if (visionBtn) {
        visionBtn.addEventListener("click", async () => {
            isVisionActive = !isVisionActive;
            try {
                if (isVisionActive) {
                    await fetch("/api/input/vision/start", { method: "POST" });
                    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                        videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
                        if (visionVideo) visionVideo.srcObject = videoStream;
                    }
                    visionBtn.classList.add("active");
                    visionBtn.querySelector(".btn-label").textContent = "VISION ON";
                    if (visionContainer) visionContainer.classList.remove("hidden");
                    addMessage("system", "Optic feed activated. I can now see what you see.");
                } else {
                    await fetch("/api/input/vision/stop", { method: "POST" });
                    if (videoStream) { videoStream.getTracks().forEach(t => t.stop()); videoStream = null; }
                    if (visionVideo) visionVideo.srcObject = null;
                    visionBtn.classList.remove("active");
                    visionBtn.querySelector(".btn-label").textContent = "VISION";
                    if (visionContainer) visionContainer.classList.add("hidden");
                    addMessage("system", "Optic feed deactivated.");
                }
            } catch(e) {
                console.error("Vision error", e);
                addMessage("system", "Vision error: check camera access.");
                isVisionActive = false;
                visionBtn.classList.remove("active");
            }
        });
    }

    // --- VOICE EVENTS FROM SERVER ---
    window.addEventListener("neural-voice-input", (e) => {
        addMessage("user", e.detail.text);
    });
    window.addEventListener("neural-voice-response", (e) => {
        addMessage("jarvis", e.detail.text);
        if (ttsEnabled) speak(e.detail.text);
    });

    setStatus("READY");
});