/**
 * Main animation loop and render management.
 */

export class AnimationLoop {
    constructor(renderer, scene, camera, components) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;
        this.components = components; // { brainCore, particles, connections, labels }
        this.time = 0;
        
        this.animate = this.animate.bind(this);
    }

    start() {
        this.animate();
    }

    animate() {
        requestAnimationFrame(this.animate);
        this.time += 0.01;

        // Global scene rotation
        this.scene.rotation.y += 0.002;

        // Update components
        if (this.components.brainCore) this.components.brainCore.update(this.time);
        if (this.components.particles) this.components.particles.update();
        if (this.components.connections) this.components.connections.update();
        if (this.components.labels) this.components.labels.update(this.time);

        this.renderer.render(this.scene, this.camera);
    }
}
