# PLAN: Friday UI Vanilla Migration

## Objective
Convert the current React-based `Friday-UI` into a pure Vanilla HTML/CSS/JS implementation inside the existing `dashboard/` directory. This will directly integrate the raw `brain3d.js` Three.js visuals with the advanced voice (STT/TTS), webcam, and chat capabilities.

## Why Vanilla?
- **Performance:** Bypassing the React virtual DOM allows direct DOM manipulation, which works better alongside high-framerate `requestAnimationFrame` loops (Three.js).
- **Simplicity:** No build step (`npm run dev` or Vite). It serves directly from FastAPI (`http://localhost:8000/`).

## Architecture Changes
1. **`dashboard/index.html`**
   - Add the `<video id="webcam">` element for visual input.
   - Add the JARVIS chat interface (Status bar, text output, Mic/TTS buttons).
2. **`dashboard/css/style.css` (UI-UX-PRO-MAX)**
   - Apply the Cyberpunk / Glassmorphism theme (Oklch gradients, cyan/pink neon glows).
   - Style the draggable webcam frame.
   - Add pulsing animations for "Listening" and "Thinking" states.
3. **`dashboard/js/friday.js` (New)**
   - Port `useVoice.ts` logic: Web Speech API (SpeechRecognition + SpeechSynthesis).
   - Port `JarvisChat.tsx` logic: Handling transcripts, typing effects, and API calls to `/api/assistant/chat`.
   - Port `WebcamFrame.tsx` logic: `navigator.mediaDevices.getUserMedia`, drag/resize mouse events.

## Execution Steps
1. **CSS Enhancement:** Overhaul `style.css` to match the Friday UI premium aesthetic.
2. **HTML Layout:** Update `index.html` to insert the Chat Panel and Webcam Frame over the 3D scene.
3. **Voice Engine:** Create a Vanilla JS class for STT/TTS.
4. **Integration:** Hook up the chat input, voice buttons, and webcam toggle to the existing `BrainWebSocket` and `/api/assistant/chat` HTTP endpoint.
