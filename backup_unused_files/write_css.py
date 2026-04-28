import sys
css = open("E:/NeuroLinked-V1.3-SOURCE/friday-interface/style.css", "w", encoding="utf-8")
css.write(""".root {
    --bg-dark: #02040a;
    --glow-pink: #ff0055;
    --glow-orange: #ff8800;
    --glow-cyan: #00eaff;
    --glow-purple: #aa00ff;
    --glow-green: #00ff88;
    --glow-red: #ff0000;
    --glow-yellow: #ffff00;
    --text-muted: rgba(122, 162, 184, 0.6);
}

* { margin: 0; padding: 0; box-sizing: border-box; }

body {
    background: var(--bg-dark);
    color: white;
    font-family: \"JetBrains Mono\", monospace;
    overflow: hidden;
    height: 100vh;
    width: 100vw;
}

#experience {
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    z-index: 1;
}

body::after {
    content: \"\";
    position: fixed;
    top: 0; left: 0;
    width: 100%; height: 100%;
    background: radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.8) 100%);
    pointer-events: none;
    z-index: 2;
}

.ui-overlay {
    position: relative;
    width: 100%; height: 100%;
    z-index: 10;
    pointer-events: none;
}

.label, .label-primary {
    pointer-events: auto;
    position: absolute;
    padding: 6px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
}

.label-title { font-size: 11px; font-weight: 700; letter-spacing: 1px; margin-bottom: 2px; }
.label-stats { font-size: 9px; opacity: 0.8; }

.pink { border-color: var(--glow-pink); box-shadow: 0 0 15px var(--glow-pink); color: var(--glow-pink); }
.orange { border-color: var(--glow-orange); box-shadow: 0 0 15px var(--glow-orange); color: var(--glow-orange); }
.cyan { border-color: var(--glow-cyan); box-shadow: 0 0 15px var(--glow-cyan); color: var(--glow-cyan); }
.purple { border-color: var(--glow-purple); box-shadow: 0 0 15px var(--glow-purple); color: var(--glow-purple); }
.green { border-color: var(--glow-green); box-shadow: 0 0 15px var(--glow-green); color: var(--glow-green); }
.red { border-color: var(--glow-red); box-shadow: 0 0 15px var(--glow-red); color: var(--glow-red); }
.yellow { border-color: var(--glow-yellow); box-shadow: 0 0 15px var(--glow-yellow); color: var(--glow-yellow); }
.blue { border-color: var(--glow-cyan); box-shadow: 0 0 15px var(--glow-cyan); color: var(--glow-cyan); }

.label-primary {
    border-color: var(--glow-cyan);
    box-shadow: 0 0 30px var(--glow-cyan);
    color: var(--glow-cyan);
    padding: 10px 18px;
    border-width: 2px;
}
.label-primary .label-title { font-size: 14px; }

.chat-history {
    pointer-events: auto;
    position: absolute;
    bottom: 100px;
    left: 40px;
    width: 580px;
    height: 280px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-right: 8px;
    scrollbar-width: thin;
    scrollbar-color: var(--glow-cyan) transparent;
}
.chat-history::-webkit-scrollbar { width: 4px; }
.chat-history::-webkit-scrollbar-thumb { background: var(--glow-cyan); border-radius: 2px; }

.chat-message {
    display: flex;
    flex-direction: column;
    gap: 2px;
    animation: fadeInText 0.3s ease-out;
}

@keyframes fadeInText {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
}

.chat-role { font-size: 9px; letter-spacing: 2px; text-transform: uppercase; }
.chat-text { font-size: 12px; line-height: 1.5; }

.chat-message.user .chat-role { color: var(--glow-cyan); }
.chat-message.user .chat-text { color: rgba(200, 230, 255, 0.9); }

.chat-message.jarvis .chat-role { color: var(--glow-pink); text-shadow: 0 0 8px var(--glow-pink); }
.chat-message.jarvis .chat-text { color: #fff; text-shadow: 0 0 10px rgba(0,234,255,0.4); font-weight: 500; }

.chat-message.system .chat-role { color: var(--glow-yellow); }
.chat-message.system .chat-text { color: rgba(255,255,100,0.75); font-size: 11px; font-style: italic; }

.status-bar {
    pointer-events: auto;
    position: absolute;
    top: 15px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 10px;
    letter-spacing: 3px;
    color: var(--glow-cyan);
    text-transform: uppercase;
    background: rgba(0,0,0,0.5);
    padding: 6px 20px;
    border: 1px solid rgba(0,234,255,0.3);
    border-radius: 20px;
    backdrop-filter: blur(6px);
}

.status-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--glow-green);
    box-shadow: 0 0 8px var(--glow-green);
    animation: pulseDot 1.5s infinite;
}
@keyframes pulseDot {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
}

.status-text { color: var(--glow-cyan); text-shadow: 0 0 6px var(--glow-cyan); }
.status-sep { opacity: 0.4; }
.status-info { color: var(--glow-green); }

.controls-bar {
    pointer-events: auto;
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 20px;
    align-items: center;
}

.control-btn {
    background: rgba(0,0,0,0.6);
    border: 1.5px solid rgba(0,234,255,0.5);
    color: var(--glow-cyan);
    font-family: \"JetBrains Mono\", monospace;
    padding: 10px 22px;
    cursor: pointer;
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    min-width: 80px;
    border-radius: 8px;
}

.btn-icon { font-size: 11px; font-weight: 700; letter-spacing: 2px; }
.btn-label { font-size: 8px; letter-spacing: 1px; opacity: 0.8; }

.control-btn:hover {
    background: rgba(0,234,255,0.1);
    border-color: var(--glow-cyan);
    box-shadow: 0 0 20px rgba(0,234,255,0.5);
}

.control-btn.active {
    background: rgba(255,0,85,0.12);
    border-color: var(--glow-pink);
    color: var(--glow-pink);
    box-shadow: 0 0 20px rgba(255,0,85,0.5);
    animation: pulseControl 2s infinite;
}
@keyframes pulseControl {
    0% { box-shadow: 0 0 5px rgba(255,0,85,0.4); }
    50% { box-shadow: 0 0 25px rgba(255,0,85,0.8); }
    100% { box-shadow: 0 0 5px rgba(255,0,85,0.4); }
}

.control-btn.tts-on { border-color: rgba(0,255,136,0.6); color: var(--glow-green); }
.control-btn.tts-off { border-color: rgba(100,100,100,0.4); color: rgba(150,150,150,0.5); }

.vision-container {
    position: absolute;
    top: 50%;
    right: 50px;
    transform: translateY(-50%);
    width: 200px;
    height: 200px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--glow-cyan);
    box-shadow: 0 0 25px rgba(0,234,255,0.4), inset 0 0 20px rgba(0,234,255,0.15);
    transition: opacity 0.5s ease, transform 0.5s ease;
    background: rgba(0,0,0,0.5);
    z-index: 50;
}
.vision-container video { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
.vision-container.hidden { opacity: 0; pointer-events: none; transform: translateY(-50%) scale(0.8); }

.footer-text {
    position: absolute;
    bottom: 12px;
    right: 40px;
    color: var(--text-muted);
    font-size: 11px;
    letter-spacing: 4px;
    text-shadow: 0 0 5px var(--glow-cyan);
}
""")
css.close()
print("Done")
