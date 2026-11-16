import * as THREE from 'three';
import { buildShapes, type ShapeSet } from './shapes';
import { particleFragment, particleVertex } from './shaders/particles';

/**
 * One GPU particle system that morphs between universe → tree → cloud → cube → waves.
 * All animation happens in the vertex shader; JS only updates a handful of uniforms.
 */
export class MorphParticles {
  readonly points: THREE.Points;
  readonly reflection: THREE.Points | null;
  readonly uniforms: Record<string, THREE.IUniform>;
  readonly shapes: ShapeSet;
  private geometry: THREE.BufferGeometry;
  private material: THREE.ShaderMaterial;
  private reflectionMaterial: THREE.ShaderMaterial | null = null;

  constructor(count: number, pixelRatio: number, withReflection: boolean, size: number) {
    this.shapes = buildShapes(count);
    const s = this.shapes;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(s.scatter, 3));
    g.setAttribute('aTree', new THREE.BufferAttribute(s.tree, 3));
    g.setAttribute('aDissolve', new THREE.BufferAttribute(s.dissolve, 3));
    g.setAttribute('aCube', new THREE.BufferAttribute(s.cube, 3));
    g.setAttribute('aWave', new THREE.BufferAttribute(s.wave, 3));
    g.setAttribute('aRand', new THREE.BufferAttribute(s.rand, 4));
    g.setAttribute('aMeta', new THREE.BufferAttribute(s.meta, 2));
    // Shader moves particles far from their scatter position; never cull.
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e4);
    this.geometry = g;

    this.uniforms = {
      uTime: { value: 0 },
      uMorph: { value: 0 },
      uSize: { value: size },
      uPixelRatio: { value: pixelRatio },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uMouseStrength: { value: 0 },
      uMotion: { value: 1 },
      uTrunkBase: { value: s.trunkBase },
      uTrunkH: { value: s.trunkHeight },
      uReflect: { value: 0 },
      uOpacity: { value: 0 },
    };

    this.material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: particleVertex,
      fragmentShader: particleFragment,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(g, this.material);
    this.points.frustumCulled = false;
    this.points.renderOrder = 2;

    if (withReflection) {
      // Shares every uniform except uReflect.
      const reflUniforms = { ...this.uniforms, uReflect: { value: 1 } };
      this.reflectionMaterial = new THREE.ShaderMaterial({
        uniforms: reflUniforms,
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      this.reflection = new THREE.Points(g, this.reflectionMaterial);
      this.reflection.frustumCulled = false;
      this.reflection.renderOrder = 0;
    } else {
      this.reflection = null;
    }
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.reflectionMaterial?.dispose();
  }
}
