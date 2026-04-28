import * as THREE from 'three';
import { initScene } from './scene.js';
import { initCamera } from './camera.js';
import { initRenderer } from './renderer.js';
import { BrainCore } from './brainCore.js';
import { ParticleSystem } from './particles.js';
import { ConnectionSystem } from './connections.js';
import { LabelSystem } from './labels.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { WebSocketManager } from './wsManager.js';

const startExperience = () => {
    // Initialize WebSocket first to start receiving data
    const wsManager = new WebSocketManager();
    window.wsManager = wsManager;
    const scene = initScene();
    const camera = initCamera();
    const renderer = initRenderer();
    const container = document.getElementById('experience');

    // Controls: Locked for extreme stability
    const controls = new OrbitControls(camera, container || renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = false; // Disabled for deterministic framing
    controls.enableZoom = false; // Disable dynamic zoom as requested
    controls.minDistance = 30.0; // Locked to new camera distance for 40-55% framing
    controls.maxDistance = 30.0; 
    controls.enablePan = false; 
    controls.rotateSpeed = 0.3; // Allow slow user rotation if they desire, but no random movement
    const brainCore = new BrainCore(scene);
    const particles = new ParticleSystem(scene);
    const connections = new ConnectionSystem(scene, particles, brainCore);
    const labels = new LabelSystem();

    // Expose systems globally for the UI to trigger them
    window.brainCore = brainCore;
    window.particles = particles;

    let lastTime = performance.now() * 0.001;

    const animate = () => {
        try {
            requestAnimationFrame(animate);
            
            const currentTime = performance.now() * 0.001;
            let delta = currentTime - lastTime;
            lastTime = currentTime;
            
            // Guard against extreme delta values (e.g., tab was backgrounded)
            if (delta > 0.1 || isNaN(delta)) delta = 0.016;
            
            const time = currentTime;

            // Update Controls
            controls.update();

        // Scene Components Update
        brainCore.update(time);
        particles.update(time);
        connections.update(time, delta);
        labels.update(time, camera.position.length());

        renderer.render(scene, camera);
        } catch (e) {
            console.error("FRIDAY_ENGINE_ERROR:", e);
        }
    };

    console.log("FRIDAY_INTERFACE_INITIALIZED");

    // Add a system notification on boot to confirm everything is loaded
    setTimeout(() => {
        const event = new CustomEvent('neural-voice-response', { 
            detail: { text: "Neural link established. All systems nominal, sir." } 
        });
        window.dispatchEvent(event);
    }, 1200);

    animate();

    // OrbitControls handles zoom naturally. 
    // We removed the manual wheel override to prevent conflicts and layout jumping.

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

document.addEventListener('DOMContentLoaded', startExperience);
