import * as THREE from 'three';

export class BrainCore {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.scene.add(this.group);
        this.pulseFactor = 0;
        this.init();
    }

    init() {
        const vertexShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vNoise;
            uniform float uTime;
            uniform float uPulse;

            // Simplex 3D Noise
            vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
            vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
            float snoise(vec3 v){ 
              const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
              const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
              vec3 i  = floor(v + dot(v, C.yyy) );
              vec3 x0 =   v - i + dot(i, C.xxx) ;
              vec3 g = step(x0.yzx, x0.xyz);
              vec3 l = 1.0 - g;
              vec3 i1 = min( g.xyz, l.zxy );
              vec3 i2 = max( g.xyz, l.zxy );
              vec3 x1 = x0 - i1 + C.xxx;
              vec3 x2 = x0 - i2 + C.yyy;
              vec3 x3 = x0 - D.yyy;
              vec4 p = permute( permute( permute( 
                         i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                       + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                       + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
              float n_ = 0.142857142857;
              vec3  ns = n_ * D.wyz - D.xzx;
              vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
              vec4 x_ = floor(j * ns.z);
              vec4 y_ = floor(j - 7.0 * x_ );
              vec4 x = x_ *ns.x + ns.yyyy;
              vec4 y = y_ *ns.x + ns.yyyy;
              vec4 h = 1.0 - abs(x) - abs(y);
              vec4 b0 = vec4( x.xy, y.xy );
              vec4 b1 = vec4( x.zw, y.zw );
              vec4 s0 = floor(b0)*2.0 + 1.0;
              vec4 s1 = floor(b1)*2.0 + 1.0;
              vec4 sh = -step(h, vec4(0.0));
              vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
              vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
              vec3 p0 = vec3(a0.xy,h.x);
              vec3 p1 = vec3(a0.zw,h.y);
              vec3 p2 = vec3(a1.xy,h.z);
              vec3 p3 = vec3(a1.zw,h.w);
              vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
              p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
              vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
              m = m * m;
              return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                            dot(p2,x2), dot(p3,x3) ) );
            }

            void main() {
                vNormal = normal;
                vPosition = position;
                
                // 1. Brain Silhouette Logic
                vec3 pos = position;
                
                // Hemispheres (Left/Right lobes)
                float lobe = smoothstep(0.0, 1.0, abs(pos.x)) * 0.4;
                pos.x *= 1.2; 
                pos.y *= 0.9;
                
                // Organic Noise Deformation (Cloud-like)
                float noise = snoise(pos * 0.6 + uTime * 0.15) * 0.5;
                float noiseFine = snoise(pos * 2.0 - uTime * 0.3) * 0.2;
                vNoise = noise + noiseFine;
                
                // Apply deformation
                pos += normal * (vNoise + lobe + uPulse * 0.5);
                
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `;

        const fragmentShader = `
            varying vec3 vNormal;
            varying vec3 vPosition;
            varying float vNoise;
            uniform float uTime;
            uniform float uPulse;
            uniform vec3 uColorCore;
            uniform vec3 uColorHighlight;
            uniform float uOpacity;

            void main() {
                // Fresnel for volumetric depth (soft edges)
                vec3 viewDir = normalize(cameraPosition - vPosition);
                float fresnel = pow(1.0 - dot(vNormal, viewDir), 3.0);
                
                // Internal cloud texture
                float dist = length(vPosition);
                float internalGlow = smoothstep(2.5, 0.0, dist);
                
                // Mixing colors for volumetric feel
                vec3 color = mix(uColorCore, uColorHighlight, clamp(vNoise * 0.5 + fresnel + uPulse, 0.0, 1.0));
                
                // Soft cloud fading (MANDATORY)
                float alpha = (uOpacity * internalGlow); 
                alpha *= (0.8 + vNoise * 0.4); // More density variation
                
                // Increase thickness toward center
                alpha = pow(alpha, 0.7) * 1.5;
                
                gl_FragColor = vec4(color, clamp(alpha, 0.0, 1.0));
            }
        `;

        // Create 3-Layer Volumetric System (REFINED SMOKE)
        const layers = [
            { scale: 0.8, opacity: 1.0, color: 0x00bfff, blend: THREE.NormalBlending }, // Occlusion Core
            { scale: 1.1, opacity: 0.8, color: 0x00eaff, blend: THREE.AdditiveBlending },
            { scale: 1.5, opacity: 0.6, color: 0x0077ff, blend: THREE.AdditiveBlending }
        ];

        this.layerMeshes = [];
        const geometry = new THREE.IcosahedronGeometry(2, 64);

        layers.forEach(layer => {
            const material = new THREE.ShaderMaterial({
                vertexShader,
                fragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uPulse: { value: 0 },
                    uColorCore: { value: new THREE.Color(layer.color) },
                    uColorHighlight: { value: new THREE.Color(0x00eaff) },
                    uOpacity: { value: layer.opacity }
                },
                transparent: true,
                blending: layer.blend,
                side: THREE.DoubleSide,
                depthWrite: layer.blend === THREE.NormalBlending
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.setScalar(layer.scale);
            this.group.add(mesh);
            this.layerMeshes.push(mesh);
        });
    }

    update(time) {
        this.pulseFactor *= 0.92;
        
        this.layerMeshes.forEach((mesh, i) => {
            mesh.material.uniforms.uTime.value = time;
            mesh.material.uniforms.uPulse.value = this.pulseFactor;
            
            // Individual morphing for each layer
            mesh.rotation.y = time * (0.05 + i * 0.02);
            mesh.rotation.z = Math.sin(time * 0.1) * 0.1;
        });

        // Subtle organic float
        this.group.position.y = Math.sin(time * 0.5) * 0.2;
    }

    triggerPulse() {
        this.pulseFactor = Math.min(1.5, this.pulseFactor + 0.3);
    }
}
