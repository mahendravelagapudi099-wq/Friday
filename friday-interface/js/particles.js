import * as THREE from 'three';
import { randomRange, getSpherePoint } from './utils.js';

export class ParticleSystem {
    constructor(scene) {
        this.scene = scene;
        this.nodes = null;
        this.micro = null;
        this.init();
    }

    init() {
        const nodeGeo = new THREE.BufferGeometry();
        const microGeo = new THREE.BufferGeometry();
        const lineGeo = new THREE.BufferGeometry();
        
        const nodePos = [];
        const nodeColors = [];
        const microPos = [];
        const microColors = [];
        const linePos = [];
        const lineColors = [];
        
        // Define 9 Distinct Regions with unique colors to match UI labels
        const regions = [
            { color: 0x00d4ff, center: new THREE.Vector3(15, 8, 4) },     // 0. Auditory/Language (Cyan)
            { color: 0xff2d6f, center: new THREE.Vector3(-15, 8, -4) },   // 1. Prefrontal (Pink)
            { color: 0+ffd60a, center: new THREE.Vector3(12, -10, -6) },  // 2. Feature Layer (Yellow)
            { color: 0x00c896, center: new THREE.Vector3(-12, -10, 6) },  // 3. Hippocampus (Green)
            { color: 0xff9f1c, center: new THREE.Vector3(0, 15, 10) },    // 4. Motor Cortex (Orange)
            { color: 0x9d4edd, center: new THREE.Vector3(0, -15, -10) },  // 5. Visual Processing (Purple)
            { color: 0xff3b3b, center: new THREE.Vector3(-10, 0, 14) },   // 6. Amygdala (Red)
            { color: 0xffd60a, center: new THREE.Vector3(10, 0, -14) },   // 7. Secondary Feature
            { color: 0xff2d6f, center: new THREE.Vector3(-16, -4, 0) }    // 8. Lateral Prefrontal
        ];

        this.nodesPerRegion = 100;
        this.microPerRegion = 400;
        this.excitations = new Array(9).fill(0);
        
        const SAFE_ZONE_RADIUS = 12; // Core area must remain clear

        regions.forEach((reg) => {
            const c = new THREE.Color(reg.color);
            const regionNodes = [];
            const regionMicros = [];

            // 1. Generate Primary Nodes for this region
            for (let i = 0; i < this.nodesPerRegion; i++) {
                let pos;
                let attempts = 0;
                do {
                    const offset = new THREE.Vector3(
                        randomRange(-8, 8),
                        randomRange(-8, 8),
                        randomRange(-8, 8)
                    );
                    pos = reg.center.clone().add(offset);
                    attempts++;
                } while (pos.length() < SAFE_ZONE_RADIUS && attempts < 10);

                nodePos.push(pos.x, pos.y, pos.z);
                nodeColors.push(c.r, c.g, c.b);
                regionNodes.push(pos);
            }

            // 2. Generate Sub-Particles (Micro) for this region
            for (let i = 0; i < this.microPerRegion; i++) {
                let pos;
                let attempts = 0;
                do {
                    const offset = new THREE.Vector3(
                        randomRange(-12, 12),
                        randomRange(-12, 12),
                        randomRange(-12, 12)
                    );
                    pos = reg.center.clone().add(offset);
                    attempts++;
                } while (pos.length() < SAFE_ZONE_RADIUS && attempts < 10);

                microPos.push(pos.x, pos.y, pos.z);
                microColors.push(c.r, c.g, c.b);
                regionMicros.push(pos);
            }

            // 3. Hierarchical Zigzag Sub-lines (Node -> Micro -> Micro)
            for (let i = 0; i < regionNodes.length; i++) {
                const node = regionNodes[i];
                
                const m1 = regionMicros[Math.floor(seededRandom() * regionMicros.length)];
                const m2 = regionMicros[Math.floor(seededRandom() * regionMicros.length)];
                
                // Node -> M1 (Fading toward M1)
                linePos.push(node.x, node.y, node.z, m1.x, m1.y, m1.z);
                lineColors.push(c.r, c.g, c.b, c.r * 0.3, c.g * 0.3, c.b * 0.3);
                
                // M1 -> M2 (Fading toward M2)
                linePos.push(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z);
                lineColors.push(c.r * 0.3, c.g * 0.3, c.b * 0.3, c.r * 0.1, c.g * 0.1, c.b * 0.1);
                
                if (i < regionNodes.length - 1 && seededRandom() > 0.5) {
                    const nextNode = regionNodes[i+1];
                    // Node -> NextNode (Stable core lines, slight fade)
                    linePos.push(node.x, node.y, node.z, nextNode.x, nextNode.y, nextNode.z);
                    lineColors.push(c.r, c.g, c.b, c.r * 0.6, c.g * 0.6, c.b * 0.6);
                }
            }
        });

        // Build Geometry
        nodeGeo.setAttribute('position', new THREE.Float32BufferAttribute(nodePos, 3));
        nodeGeo.setAttribute('color', new THREE.Float32BufferAttribute(nodeColors, 3));
        
        microGeo.setAttribute('position', new THREE.Float32BufferAttribute(microPos, 3));
        microGeo.setAttribute('color', new THREE.Float32BufferAttribute(microColors, 3));
        
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3));

        // Materials
        const nodeMat = new THREE.PointsMaterial({
            size: 0.18,
            vertexColors: true,
            transparent: true,
            opacity: 0.9,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const microMat = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const lineMat = new THREE.LineBasicMaterial({
            vertexColors: true,
            transparent: true,
            opacity: 0.15,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        // Add to Scene
        this.nodes = new THREE.Points(nodeGeo, nodeMat);
        this.micro = new THREE.Points(microGeo, microMat);
        this.internalLines = new THREE.LineSegments(lineGeo, lineMat);
        
        this.scene.add(this.nodes);
        this.scene.add(this.micro);
        this.scene.add(this.internalLines);
    }

    setRegionExcitation(regionIndex, level) {
        if (regionIndex >= 0 && regionIndex < 9) {
            this.excitations[regionIndex] = level;
        }
    }

    update(time) {
        // Node pulse
        this.nodes.material.opacity = 0.6 + Math.sin(time * 3) * 0.2;
        
        // Micro drift with regional excitation
        const microPos = this.micro.geometry.attributes.position.array;
        
        for (let i = 0; i < microPos.length; i += 3) {
            const particleIndex = i / 3;
            const regionIndex = Math.floor(particleIndex / this.microPerRegion);
            const excitation = this.excitations[regionIndex] || 0;
            
            // Base drift + excitation drift (faster erratic movement)
            const speedMult = 1.0 + (excitation * 15.0);
            
            microPos[i] += Math.sin(time * 0.1 * speedMult + i) * 0.001 * speedMult;
            microPos[i+1] += Math.cos(time * 0.1 * speedMult + i) * 0.001 * speedMult;
        }
        this.micro.geometry.attributes.position.needsUpdate = true;
    }
}
