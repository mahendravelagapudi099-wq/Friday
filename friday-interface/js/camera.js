import * as THREE from 'three';

export const initCamera = () => {
    const camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 8, 35);
    return camera;
};
