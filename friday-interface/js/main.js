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

    // Controls: Zoom + Rotation
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.0;
    controls.enableZoom = true;
    controls.minDistance = 2.5; // Closer "regional" zoom
    controls.maxDistance = 60.0; // Expanded zoom out range for macro view

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

        // Regional Zoom Effect: Scale labels based on camera distance
        const dist = camera.position.length();
        let scale = 1.0;
        if (!isNaN(dist) && dist > 0) {
            scale = Math.max(0.4, Math.min(1.2, 1.5 - (dist / 12)));
        }
        const overlay = document.querySelector('.ui-overlay');
        if (overlay) overlay.style.fontSize = `${scale * 100}%`;

        // Scene Components Update
        brainCore.update(time);
        particles.update(time);
        connections.update(time, delta);
        labels.update(time);

        renderer.render(scene, camera);
        } catch (e) {
            console.error("FRIDAY_ENGINE_ERROR:", e);
        }
    };

    console.log("FRIDAY_INTERFACE_INITIALIZED");
    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
};

document.addEventListener('DOMContentLoaded', startExperience);
