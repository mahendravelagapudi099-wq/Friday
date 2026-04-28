import * as THREE from 'three';
import { randomRange, getSpherePoint } from './utils.js';

export class ConnectionSystem {
  constructor(scene, particles, brainCore) {
    this.scene = scene;
    this.particles = particles;
    this.brainCore = brainCore;
    this.curves = [];
    this.dataPackets = [];
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.packetCount = 80; // Exactly 1 packet per pipe
    this.init();
  }

  init() {
    // 1. Neural Path Curves (All Light Blue)
    const pipeColor = 0x44aaff; // Light blue

    for (let i = 0; i < 80; i++) {
      // Start at a distant regional point
      const { x, y, z } = getSpherePoint(randomRange(10, 15));
      const start = new THREE.Vector3(x, y, z);

      // End at brain "cloud horizon" (stop before center to hide inside smoke)
      const endDir = start.clone().normalize().negate();
      const end = endDir.multiplyScalar(1.5);

      // Curved intermediate points
      const mid1 = new THREE.Vector3(
        start.x * 0.7 + randomRange(-3, 3),
        start.y * 0.7 + randomRange(-3, 3),
        start.z * 0.7 + randomRange(-3, 3)
      );
      const mid2 = new THREE.Vector3(
        start.x * 0.3 + randomRange(-1, 1),
        start.y * 0.3 + randomRange(-1, 1),
        start.z * 0.3 + randomRange(-1, 1)
      );

      const curve = new THREE.CatmullRomCurve3([start, mid1, mid2, end]);

      // 3D Pipe Geometry (Thick Neural Trunk)
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.04, 8, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: pipeColor,
        transparent: true,
        opacity: 0.08, // Subtle light blue transparency
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide
      });

      const tube = new THREE.Mesh(tubeGeo, tubeMat);
      this.group.add(tube);

      this.curves.push({ curve, tube });
    }

    // 2. 3D Data Packets (White Cloud Dots)
    const packetGeo = new THREE.SphereGeometry(0.15, 16, 16); // Significantly larger
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Pure white
      transparent: true,
      opacity: 1.0, // Full opacity for maximum visibility
      blending: THREE.AdditiveBlending
    });
    
    this.packetMesh = new THREE.InstancedMesh(packetGeo, packetMat, this.packetCount);
    this.scene.add(this.packetMesh);

    // Initialize packet data (Exactly 1 packet per curve)
    for (let i = 0; i < this.packetCount; i++) {
      this.dataPackets.push({
        curveIndex: i, // 1:1 mapping to curve
        instanceIdx: i,
        progress: Math.random(),
        speed: randomRange(0.2, 0.5) // Faster travel
      });
    }
  }

  update(time, delta) {
    const dummy = new THREE.Object3D();

    this.dataPackets.forEach((p, i) => {
      // Move toward center
      if (p.progress < 0) p.progress = 0;

      p.progress += p.speed * delta;

      // Absorption Logic triggers pulse
      if (p.progress >= 1) {
        p.progress = 0;
        this.brainCore.triggerPulse();
      }

      // Update 3D Position along curve
      const curve = this.curves[p.curveIndex].curve;
      const pos = curve.getPoint(Math.min(0.99, p.progress));

      dummy.position.copy(pos);

      // Scale based on distance
      const dist = pos.length();
      let scale = Math.min(1.0, dist * 0.4);

      // "Small white cloud" scaling - drastically increased so they bulge out of the pipes
      dummy.scale.setScalar(Math.max(0.2, scale * 1.8)); 

      dummy.updateMatrix();

      // Update the unified InstancedMesh
      this.packetMesh.setMatrixAt(p.instanceIdx, dummy.matrix);

      // Pulse Pipes at the origin of this packet's curve
      const curveData = this.curves[p.curveIndex];
      const pipePulse = 0.5 + Math.sin(time * 3 + i) * 0.2;
      if (curveData.tube) curveData.tube.material.opacity = 0.08 + pipePulse * 0.05;
    });

    // Notify mesh of update
    this.packetMesh.instanceMatrix.needsUpdate = true;

    this.group.rotation.y = time * 0.05;
  }
}