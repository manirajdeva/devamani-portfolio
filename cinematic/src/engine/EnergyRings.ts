import * as THREE from 'three';
import { mulberry32 } from './shapes';

const ringVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const ringFragment = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uMotion;
varying vec2 vUv;

float ringLine(float r, float rad, float w) {
  float d = abs(r - rad);
  return smoothstep(w, 0.0, d) + smoothstep(w * 6.0, 0.0, d) * 0.35;
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float r = length(uv) * 9.0;       // world-space radius
  float ang = atan(uv.y, uv.x);
  float T = uTime * uMotion;

  // ripple distortion
  float n = sin(ang * 6.0 + T * 0.6) * 0.05 + sin(ang * 13.0 - T * 1.1) * 0.025 + sin(r * 3.0 - T * 2.0) * 0.02;
  float rr = r + n;

  float rings = 0.0;
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float rad = 0.9 + fi * 1.05 + sin(T * 0.8 + fi * 1.7) * 0.07;   // breathing radii
    float w = 0.018 + fi * 0.004;
    float line = ringLine(rr, rad, w);
    // some rings are segmented and spin in alternate directions
    float dir = mod(fi, 2.0) < 1.0 ? 1.0 : -1.0;
    float segs = 6.0 + fi * 6.0;
    float dash = step(0.35, fract(ang / 6.2831 * segs + T * 0.05 * dir * (1.0 + fi * 0.3)));
    float dashed = mod(fi, 3.0) == 1.0 ? dash : 1.0;
    rings += line * dashed * (1.0 - fi * 0.1);
  }

  // expanding energy pulses
  float pulse = 0.0;
  for (int k = 0; k < 2; k++) {
    float ph = fract(T * 0.16 + float(k) * 0.5);
    float pr = ph * 7.5;
    pulse += smoothstep(0.35, 0.0, abs(rr - pr)) * (1.0 - ph);
  }

  // fine radial grid
  float spokes = smoothstep(0.985, 1.0, cos(ang * 48.0)) * smoothstep(1.0, 3.0, r) * smoothstep(7.0, 4.0, r) * 0.18;

  float core = exp(-r * 0.75) * 1.1;
  float falloff = smoothstep(8.6, 2.5, r);

  vec3 deep = vec3(0.05, 0.22, 1.0);
  vec3 cyan = vec3(0.45, 0.92, 1.0);
  vec3 col = mix(deep, cyan, clamp(rings * 0.6 + core * 0.5, 0.0, 1.0));
  float a = (rings * 0.9 + pulse * 0.55 + spokes + core * 0.55) * falloff * uOpacity;
  gl_FragColor = vec4(col * a, a);
}
`;

const streamVertex = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uPixelRatio;
uniform float uMotion;
attribute vec4 aData; // radius, angle, speed, rand
varying float vAlpha;
void main() {
  float a = aData.y + uTime * aData.z * uMotion;
  float r = aData.x + sin(uTime * 0.8 + aData.w * 10.0) * 0.04;
  vec3 p = vec3(cos(a) * r, position.y + sin(uTime * 2.0 + aData.w * 30.0) * 0.03, sin(a) * r);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  vAlpha = (0.45 + 0.55 * sin(uTime * 3.0 + aData.w * 50.0)) * uOpacity;
  gl_PointSize = (1.4 + aData.w * 2.0) * uPixelRatio * (14.0 / -mv.z);
}
`;

const streamFragment = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.55, 0.95, 1.0) * g * g, vAlpha * g);
}
`;

/** Holographic energy platform under the tree. */
export class EnergyRings {
  readonly group = new THREE.Group();
  private disc: THREE.Mesh;
  private stream: THREE.Points;
  private discMat: THREE.ShaderMaterial;
  private streamMat: THREE.ShaderMaterial;
  private streamGeo: THREE.BufferGeometry;

  constructor(y: number, particleCount: number, pixelRatio: number) {
    this.discMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uMotion: { value: 1 } },
      vertexShader: ringVertex,
      fragmentShader: ringFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    this.disc = new THREE.Mesh(new THREE.PlaneGeometry(18, 18, 1, 1), this.discMat);
    this.disc.rotation.x = -Math.PI / 2;
    this.disc.renderOrder = 1;

    const rand = mulberry32(99);
    const data = new Float32Array(particleCount * 4);
    const pos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const ring = Math.floor(rand() * 6);
      const radius = 0.9 + ring * 1.05 + (rand() - 0.5) * 0.08;
      data[i * 4] = radius;
      data[i * 4 + 1] = rand() * Math.PI * 2;
      data[i * 4 + 2] = (ring % 2 === 0 ? 1 : -1) * (0.12 + rand() * 0.2) / (1 + ring * 0.25);
      data[i * 4 + 3] = rand();
      pos[i * 3 + 1] = 0.02 + rand() * 0.05;
    }
    this.streamGeo = new THREE.BufferGeometry();
    this.streamGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.streamGeo.setAttribute('aData', new THREE.BufferAttribute(data, 4));
    this.streamGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
    this.streamMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uOpacity: { value: 0 }, uPixelRatio: { value: pixelRatio }, uMotion: { value: 1 } },
      vertexShader: streamVertex,
      fragmentShader: streamFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stream = new THREE.Points(this.streamGeo, this.streamMat);
    this.stream.renderOrder = 1;

    this.group.add(this.disc, this.stream);
    this.group.position.y = y;
  }

  update(time: number, opacity: number, motion: number) {
    this.discMat.uniforms.uTime.value = time;
    this.discMat.uniforms.uOpacity.value = opacity;
    this.discMat.uniforms.uMotion.value = motion;
    this.streamMat.uniforms.uTime.value = time;
    this.streamMat.uniforms.uOpacity.value = opacity;
    this.streamMat.uniforms.uMotion.value = motion;
    this.group.visible = opacity > 0.002;
  }

  dispose() {
    (this.disc.geometry as THREE.BufferGeometry).dispose();
    this.discMat.dispose();
    this.streamGeo.dispose();
    this.streamMat.dispose();
  }
}
