import * as THREE from 'three';
import { mulberry32 } from './shapes';

const starVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
attribute vec2 aStar; // size, phase
varying float vAlpha;
varying float vTint;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.55 + 0.45 * sin(uTime * (0.6 + aStar.y * 1.6) + aStar.y * 40.0);
  vAlpha = tw * uOpacity;
  vTint = aStar.y;
  gl_PointSize = aStar.x * uPixelRatio;
}
`;

const starFragment = /* glsl */ `
varying float vAlpha;
varying float vTint;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  vec3 c = mix(vec3(0.62, 0.78, 1.0), vec3(1.0), vTint);
  gl_FragColor = vec4(c * g, vAlpha * g);
}
`;

const dustVertex = /* glsl */ `
uniform float uTime;
uniform float uPixelRatio;
uniform float uOpacity;
uniform float uMotion;
attribute vec4 aDust;
varying float vAlpha;
void main() {
  vec3 p = position;
  p.y = mod(p.y + uTime * aDust.x * uMotion + 8.0, 16.0) - 8.0;
  p.x += sin(uTime * 0.3 + aDust.y * 20.0) * 0.4;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float edge = smoothstep(8.0, 5.0, abs(p.y));
  vAlpha = (0.25 + 0.5 * aDust.z) * edge * uOpacity;
  gl_PointSize = (1.0 + aDust.w * 2.6) * uPixelRatio * (16.0 / -mv.z);
}
`;

const dustFragment = /* glsl */ `
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.5, 0.8, 1.0) * g * g, vAlpha * g);
}
`;

const glowVertex = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`;

const glowFragment = /* glsl */ `
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float g = pow(max(1.0 - d, 0.0), 2.6);
  gl_FragColor = vec4(uColor * g * uOpacity, g * uOpacity);
}
`;

/** Stars, floating dust and soft volumetric light behind the hero objects. */
export class Atmosphere {
  readonly group = new THREE.Group();
  private stars: THREE.Points;
  private dust: THREE.Points;
  private glow: THREE.Mesh;
  private starMat: THREE.ShaderMaterial;
  private dustMat: THREE.ShaderMaterial;
  private glowMat: THREE.ShaderMaterial;
  private disposables: THREE.BufferGeometry[] = [];

  constructor(starCount: number, pixelRatio: number) {
    const rand = mulberry32(4242);

    const sp = new Float32Array(starCount * 3);
    const sa = new Float32Array(starCount * 2);
    for (let i = 0; i < starCount; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const r = 45 + rand() * 50;
      sp[i * 3] = s * Math.cos(t) * r;
      sp[i * 3 + 1] = u * r;
      sp[i * 3 + 2] = s * Math.sin(t) * r;
      sa[i * 2] = 0.8 + Math.pow(rand(), 4) * 2.8;
      sa[i * 2 + 1] = rand();
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
    sg.setAttribute('aStar', new THREE.BufferAttribute(sa, 2));
    this.starMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 0 } },
      vertexShader: starVertex,
      fragmentShader: starFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.stars = new THREE.Points(sg, this.starMat);

    const dustCount = Math.round(starCount / 6);
    const dp = new Float32Array(dustCount * 3);
    const dd = new Float32Array(dustCount * 4);
    for (let i = 0; i < dustCount; i++) {
      dp[i * 3] = (rand() - 0.5) * 30;
      dp[i * 3 + 1] = (rand() - 0.5) * 16;
      dp[i * 3 + 2] = (rand() - 0.5) * 18 - 2;
      dd[i * 4] = 0.08 + rand() * 0.25;
      dd[i * 4 + 1] = rand();
      dd[i * 4 + 2] = rand();
      dd[i * 4 + 3] = rand();
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    dg.setAttribute('aDust', new THREE.BufferAttribute(dd, 4));
    dg.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    this.dustMat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: pixelRatio }, uOpacity: { value: 0 }, uMotion: { value: 1 } },
      vertexShader: dustVertex,
      fragmentShader: dustFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.dust = new THREE.Points(dg, this.dustMat);

    const gg = new THREE.PlaneGeometry(1, 1);
    this.glowMat = new THREE.ShaderMaterial({
      uniforms: { uOpacity: { value: 0 }, uColor: { value: new THREE.Color(0.08, 0.28, 0.95) } },
      vertexShader: glowVertex,
      fragmentShader: glowFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.glow = new THREE.Mesh(gg, this.glowMat);
    this.glow.scale.setScalar(22);
    this.glow.position.set(0, 0.4, -6);
    this.glow.renderOrder = -1;

    this.disposables.push(sg, dg, gg);
    this.group.add(this.glow, this.stars, this.dust);
  }

  update(time: number, opacity: number, glow: number, motion: number, camera: THREE.Camera) {
    this.starMat.uniforms.uTime.value = time;
    this.starMat.uniforms.uOpacity.value = opacity;
    this.dustMat.uniforms.uTime.value = time;
    this.dustMat.uniforms.uOpacity.value = opacity;
    this.dustMat.uniforms.uMotion.value = motion;
    this.glowMat.uniforms.uOpacity.value = glow * opacity;
    this.stars.rotation.y = time * 0.004 * motion;
    this.glow.quaternion.copy(camera.quaternion);
  }

  dispose() {
    this.disposables.forEach((g) => g.dispose());
    this.starMat.dispose();
    this.dustMat.dispose();
    this.glowMat.dispose();
  }
}
