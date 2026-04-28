import * as THREE from 'three';

export const initRenderer = () => {
    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    
    document.getElementById('experience').appendChild(renderer.domElement);
    
    return renderer;
};
