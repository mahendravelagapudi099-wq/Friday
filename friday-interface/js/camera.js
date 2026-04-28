import * as THREE from 'three';

export const initCamera = () => {
    const camera = new THREE.PerspectiveCamera(
        65, // Standardized for professional cinematic framing
        window.innerWidth / window.innerHeight,
        0.1,
        2000
    );

    // Hero position: Locked for deterministic 40-55% width framing
    camera.position.set(0, 5, 30);
    camera.lookAt(0, 0, 0);

    // Zoom functionality helper
    camera.zoomTo = (targetZ, duration = 1000) => {
        // This could be used for scripted zooms
        console.log(`[CAMERA] Zooming to ${targetZ}`);
    };

    return camera;
};
