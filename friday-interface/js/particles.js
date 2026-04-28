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
        
        // Define 9 Distinct Regions with unique colors
        const regions = [
            { color: 0x00ffff, center: new THREE.Vector3(15, 8, 4) },     // 0. Auditory/Language (Cyan)
            { color: 0xff00ff, center: new THREE.Vector3(-15, 8, -4) },   // 1. Magenta
            { color: 0xffff00, center: new THREE.Vector3(12, -10, -6) },  // 2. Yellow
            { color: 0x00ff88, center: new THREE.Vector3(-12, -10, 6) },  // 3. Visual Cortex (Emerald)
            { color: 0xff8800, center: new THREE.Vector3(0, 15, 10) },    // 4. Motor Cortex (Orange)
            { color: 0x8800ff, center: new THREE.Vector3(0, -15, -10) },  // 5. Purple
            { color: 0xff0044, center: new THREE.Vector3(-10, 0, 14) },   // 6. Crimson Red
            { color: 0xccff00, center: new THREE.Vector3(10, 0, -14) },   // 7. Lime
            { color: 0xff00aa, center: new THREE.Vector3(-16, -4, 0) }    // 8. Hot Pink
        ];

        this.nodesPerRegion = 70; // 630 total nodes
        this.microPerRegion = 250; // 2250 total micro particles
        this.excitations = new Array(9).fill(0); // Holds excitation multiplier per region

        regions.forEach((reg) => {
            const c = new THREE.Color(reg.color);
            const regionNodes = [];
            const regionMicros = [];

            // 1. Generate Primary Nodes for this region
            for (let i = 0; i < this.nodesPerRegion; i++) {
                const offset = new THREE.Vector3(
                    randomRange(-4, 4),
                    randomRange(-4, 4),
                    randomRange(-4, 4)
                );
                const pos = reg.center.clone().add(offset);
                nodePos.push(pos.x, pos.y, pos.z);
                nodeColors.push(c.r, c.g, c.b);
                regionNodes.push(pos);
            }

            // 2. Generate Sub-Particles (Micro) for this region
            for (let i = 0; i < this.microPerRegion; i++) {
                const offset = new THREE.Vector3(
                    randomRange(-7, 7),
                    randomRange(-7, 7),
                    randomRange(-7, 7)
                );
                const pos = reg.center.clone().add(offset);
                microPos.push(pos.x, pos.y, pos.z);
                microColors.push(c.r, c.g, c.b);
                regionMicros.push(pos);
            }

            // 3. Hierarchical Zigzag Sub-lines (Node -> Micro -> Micro)
            // Connect primary nodes to their surrounding sub-particles
            for (let i = 0; i < regionNodes.length; i++) {
                const node = regionNodes[i];
                
                // Find 2 random micro particles to connect to in a zigzag
                const m1 = regionMicros[Math.floor(Math.random() * regionMicros.length)];
                const m2 = regionMicros[Math.floor(Math.random() * regionMicros.length)];
                
                // Node -> M1
                linePos.push(node.x, node.y, node.z, m1.x, m1.y, m1.z);
                lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
                
                // M1 -> M2 (Zigzag extension)
                linePos.push(m1.x, m1.y, m1.z, m2.x, m2.y, m2.z);
                lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
                
                // Occasionally connect Node to Node for core structure
                if (i < regionNodes.length - 1 && Math.random() > 0.5) {
                    const nextNode = regionNodes[i+1];
                    linePos.push(node.x, node.y, node.z, nextNode.x, nextNode.y, nextNode.z);
                    lineColors.push(c.r, c.g, c.b, c.r, c.g, c.b);
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
