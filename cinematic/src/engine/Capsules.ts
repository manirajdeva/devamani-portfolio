import * as THREE from 'three';
import { CAPSULES } from './capsuleData';

const capVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;
void main() {
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vN = normalize(mat3(modelMatrix) * normal);
  vV = normalize(cameraPosition - wp.xyz);
  vLocal = position;
  gl_Position = projectionMatrix * viewMatrix * wp;
}
`;

const capFragment = /* glsl */ `
uniform float uHover;
uniform float uOpacity;
uniform float uTime;
varying vec3 vN;
varying vec3 vV;
varying vec3 vLocal;
void main() {
  vec3 n = normalize(vN);
  float f = 1.0 - max(dot(n, normalize(vV)), 0.0);
  float rim = pow(f, 2.1);
  vec3 L = normalize(vec3(-0.4, 0.8, 0.6));
  float spec = pow(max(dot(reflect(-normalize(vV), n), L), 0.0), 28.0);
  // a light sweep travelling across the glass
  float sweep = smoothstep(0.12, 0.0, abs(vLocal.x - (fract(uTime * 0.18) * 2.6 - 1.3))) * 0.35;
  vec3 fill = vec3(0.04, 0.16, 0.5);
  vec3 neon = vec3(0.38, 0.88, 1.0);
  vec3 col = fill * 0.7 + neon * rim * (1.15 + uHover * 1.4) + vec3(1.0) * (spec * 0.7 + sweep * (0.4 + uHover));
  float a = (0.14 + uHover * 0.1 + rim * 0.85 + spec * 0.5 + sweep * 0.4) * uOpacity;
  gl_FragColor = vec4(col, a);
}
`;


/** Floating glass capsules orbiting the tree; labels are DOM elements positioned by projection. */
export class Capsules {
  readonly group = new THREE.Group();
  readonly meshes: THREE.Mesh[] = [];
  private materials: THREE.ShaderMaterial[] = [];
  private geometry: THREE.CapsuleGeometry;
  private hover: number[] = [];
  private base: THREE.Vector3[] = [];
  private tmp = new THREE.Vector3();

  constructor() {
    this.geometry = new THREE.CapsuleGeometry(0.26, 1.2, 8, 28);
    this.geometry.rotateZ(Math.PI / 2);
    CAPSULES.forEach((c, i) => {
      const m = new THREE.ShaderMaterial({
        uniforms: { uHover: { value: 0 }, uOpacity: { value: 0 }, uTime: { value: i * 1.7 } },
        vertexShader: capVertex,
        fragmentShader: capFragment,
        transparent: true,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(this.geometry, m);
      mesh.userData.index = i;
      mesh.renderOrder = 3;
      this.group.add(mesh);
      this.meshes.push(mesh);
      this.materials.push(m);
      this.hover.push(0);
      this.base.push(new THREE.Vector3(...c.position));
    });
  }

  /** narrow: pull capsules in for small screens */
  update(time: number, opacity: number, hovered: number, motion: number, narrow: boolean) {
    this.group.visible = opacity > 0.002;
    const spread = narrow ? 0.47 : 1;
    this.meshes.forEach((mesh, i) => {
      const b = this.base[i];
      const t = time * motion;
      mesh.position.set(
        (b.x < 0 && !narrow ? b.x * 0.62 : b.x * spread) + Math.sin(t * 0.4 + i) * 0.18,
        b.y * (narrow ? 0.85 : 1) + (narrow ? 0.4 : 0) + Math.sin(t * 0.55 + i * 2.1) * 0.25,
        b.z + Math.cos(t * 0.35 + i) * 0.2,
      );
      mesh.rotation.z = Math.sin(t * 0.3 + i) * 0.12;
      mesh.rotation.y = Math.sin(t * 0.25 + i * 1.3) * 0.35;
      const target = hovered === i ? 1 : 0;
      this.hover[i] += (target - this.hover[i]) * 0.12;
      const s = (narrow ? 0.72 : 1) * (1 + this.hover[i] * 0.12);
      mesh.scale.setScalar(s);
      const u = this.materials[i].uniforms;
      u.uHover.value = this.hover[i];
      u.uOpacity.value = opacity;
      u.uTime.value = time + i * 1.7;
    });
  }

  hoverAmount(i: number) {
    return this.hover[i];
  }

  worldPosition(i: number, out: THREE.Vector3) {
    return this.meshes[i].getWorldPosition(out ?? this.tmp);
  }

  dispose() {
    this.geometry.dispose();
    this.materials.forEach((m) => m.dispose());
  }
}
