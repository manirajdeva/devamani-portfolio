import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { MorphParticles } from './MorphParticles';
import { EnergyRings } from './EnergyRings';
import { Atmosphere } from './Atmosphere';
import { Capsules } from './Capsules';
import { detectQuality, type Quality } from './quality';
import { currentMorph, sceneState } from '../state/scene';

export interface ExperienceLabels {
  capsules: HTMLElement[];
  brand: HTMLElement | null;
}

export interface ExperienceOptions {
  reducedMotion: boolean;
  lite?: boolean;
  onFailure?: (reason: string) => void;
  onCapsuleClick?: (index: number) => void;
}

interface CamPose {
  pos: THREE.Vector3;
  target: THREE.Vector3;
  shift: number; // horizontal framing shift, fraction of viewport width
}

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export class Experience {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private composer: EffectComposer | null = null;
  private bloom: UnrealBloomPass | null = null;
  private particles: MorphParticles;
  private rings: EnergyRings;
  private atmosphere: Atmosphere;
  private capsules: Capsules;
  private cubeLines: THREE.LineSegments;
  private quality: Quality;
  private labels: ExperienceLabels = { capsules: [], brand: null };
  private raf = 0;
  private time = 0;
  private last = performance.now();
  private width = 1;
  private height = 1;
  private disposed = false;

  private pointer = new THREE.Vector2(0, 0);
  private pointerSmooth = new THREE.Vector2(0, 0);
  private pointerActive = 0;
  private lastPointerMove = 0;
  private hovered = -1;
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  private mouseWorld = new THREE.Vector3(999, 999, 0);
  private camPos = new THREE.Vector3();
  private camTarget = new THREE.Vector3();
  private camShift = 0;
  private tmpV = new THREE.Vector3();
  private tmpA = new THREE.Vector3();
  private tmpB = new THREE.Vector3();
  private initialized = false;
  private perfFrames = 0;
  private perfAcc = 0;
  private perfSteps = 0;
  private dprScale = 1;

  constructor(private canvas: HTMLCanvasElement, private opts: ExperienceOptions) {
    this.quality = detectQuality(opts.lite);
    const q = this.quality;

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    this.renderer.setPixelRatio(q.dpr);
    this.renderer.setClearColor(new THREE.Color('#02030A'), 1);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 200);
    this.camera.position.set(0, 1.5, 20);

    const size = q.tier === 'low' ? 2.2 : q.tier === 'mid' ? 1.65 : 1.45;
    this.particles = new MorphParticles(q.particles, q.dpr, q.reflection, size);
    this.atmosphere = new Atmosphere(q.stars, q.dpr);
    this.rings = new EnergyRings(this.particles.shapes.trunkBase - 0.02, q.ringParticles, q.dpr);
    this.capsules = new Capsules();

    // Crisp cyan edges that ride along with the particle cube (same rotation as the shader).
    const box = new THREE.BoxGeometry(4.6, 4.6, 4.6);
    const edges = new THREE.EdgesGeometry(box);
    box.dispose();
    this.cubeLines = new THREE.LineSegments(
      edges,
      new THREE.LineBasicMaterial({ color: new THREE.Color(0.55, 0.95, 1.0), transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
    );
    this.cubeLines.renderOrder = 3;
    this.scene.add(this.cubeLines);

    this.scene.add(this.atmosphere.group, this.rings.group, this.particles.points, this.capsules.group);
    if (this.particles.reflection) this.scene.add(this.particles.reflection);

    if (q.bloom) {
      this.composer = new EffectComposer(this.renderer);
      this.composer.setPixelRatio(q.dpr);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.42, 0.16);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }

    this.particles.uniforms.uMotion.value = opts.reducedMotion ? 0.15 : 1;

    this.onResize();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('pointermove', this.onPointerMove, { passive: true });
    window.addEventListener('click', this.onClick);
    canvas.addEventListener('webglcontextlost', this.onContextLost, false);
  }

  setLabels(labels: ExperienceLabels) {
    this.labels = labels;
  }

  start() {
    this.last = performance.now();
    const loop = () => {
      if (this.disposed) return;
      this.raf = requestAnimationFrame(loop);
      this.frame();
    };
    this.raf = requestAnimationFrame(loop);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.raf);
    this.opts.onFailure?.('WebGL context lost');
  };

  private onResize = () => {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.renderer.setSize(this.width, this.height, false);
    this.composer?.setSize(this.width, this.height);
    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();
  };

  private onPointerMove = (e: PointerEvent) => {
    this.pointer.set((e.clientX / this.width) * 2 - 1, -(e.clientY / this.height) * 2 + 1);
    sceneState.pointerX = this.pointer.x;
    sceneState.pointerY = this.pointer.y;
    this.lastPointerMove = performance.now();
  };

  private onClick = (e: MouseEvent) => {
    if (this.hovered < 0) return;
    const t = e.target as HTMLElement | null;
    if (t?.closest('a,button,input,textarea,select,label,nav')) return;
    this.opts.onCapsuleClick?.(this.hovered);
  };

  private poses(narrow: boolean, tablet: boolean): CamPose[] {
    const shift = narrow ? 0 : tablet ? 0.1 : 0.19;
    return [
      { pos: this.tmpPose(0, 1.5, 21), target: this.tmpPose(0, 0.5, 0), shift: 0 },
      narrow
        ? { pos: this.tmpPose(0, 1.0, 24.5), target: this.tmpPose(0, -2.9, 0), shift: 0 }
        : { pos: this.tmpPose(0, 0.9, tablet ? 15 : 13.2), target: this.tmpPose(0, 0.55, 0), shift },
      { pos: this.tmpPose(0, 1.2, narrow ? 24 : 15.5), target: this.tmpPose(0, 0.8, 0), shift: shift * 0.3 },
      narrow
        ? { pos: this.tmpPose(0, 0.4, 28), target: this.tmpPose(0, -4.6, 0), shift: 0 }
        : { pos: this.tmpPose(0, 0.2, tablet ? 15 : 13.5), target: this.tmpPose(0, -0.1, 0), shift },
      { pos: this.tmpPose(0, 3.3, narrow ? 13 : 11), target: this.tmpPose(0, -1.4, -3), shift: 0 },
    ];
  }

  private poseCache: THREE.Vector3[] = [];
  private poseIdx = 0;
  private tmpPose(x: number, y: number, z: number) {
    if (!this.poseCache[this.poseIdx]) this.poseCache[this.poseIdx] = new THREE.Vector3();
    return this.poseCache[this.poseIdx++].set(x, y, z);
  }

  /** Keep it smooth on weaker GPUs: if frames run slow, render at a lower resolution, then drop bloom. */
  private adapt(frameMs: number) {
    if (this.perfSteps >= 5 || this.disposed) return;
    if (++this.perfFrames <= 90) return; // ignore the heavy first frames (shader compile, intro)
    this.perfAcc += Math.min(frameMs, 200);
    if (this.perfFrames < 90 + 45) return;
    const avg = this.perfAcc / 45;
    this.perfFrames = 90;
    this.perfAcc = 0;
    if (avg < 22) return;
    this.perfSteps++;
    if (avg > 34 && this.composer) {
      this.composer.dispose();
      this.composer = null;
      this.bloom = null;
    } else if (this.dprScale > 0.6) {
      this.dprScale = Math.max(0.6, this.dprScale * 0.8);
      this.renderer.setPixelRatio(this.quality.dpr * this.dprScale);
      this.composer?.setPixelRatio(this.quality.dpr * this.dprScale);
      this.onResize();
    }
  }

  private frame() {
    const now = performance.now();
    this.adapt(now - this.last);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;
    const t = this.time;
    const reduced = this.opts.reducedMotion;
    const motion = reduced ? 0.15 : 1;

    const m = currentMorph();
    const s = [0, 1, 2, 3].map((seg) => smooth(clamp01(m - seg)));
    const w = [1 - s[0], s[0] * (1 - s[1]), s[1] * (1 - s[2]), s[2] * (1 - s[3]), s[3]];
    const reveal = sceneState.reveal;

    // ---- uniforms
    const u = this.particles.uniforms;
    u.uTime.value = t;
    u.uMorph.value = m;
    u.uOpacity.value = reveal * (1 - s[3] * (1 - sceneState.ambient));

    // cube edge lines: mirror the vertex shader's rotation + disintegration
    const br = (() => {
      const v = Math.sin(t * 0.32 - 1.2) * 0.5 + 0.5;
      return smooth(clamp01((v - 0.8) / 0.2)) * motion;
    })();
    this.cubeLines.rotation.set(-(Math.sin(t * 0.17) * 0.3 * motion + 0.42), t * 0.22 * Math.max(motion, 0.2) + 0.6, 0, 'XYZ');
    this.cubeLines.scale.setScalar(1 + br * 0.25);
    const lineMat = this.cubeLines.material as THREE.LineBasicMaterial;
    lineMat.opacity = reveal * Math.pow(w[3], 3) * (1 - br) * 0.55;
    this.cubeLines.visible = lineMat.opacity > 0.002;

    const treeVis = Math.pow(w[1], 1.6);
    this.rings.update(t, reveal * treeVis, motion);
    this.atmosphere.update(t, reveal, w[1] * 0.28 + w[2] * 0.18 + w[3] * 0.22 + w[4] * 0.12 + w[0] * 0.1, motion, this.camera);

    const narrow = this.width < 768;
    const tablet = this.width < 1100;
    this.capsules.update(t, reveal * smooth(clamp01((w[1] - 0.25) / 0.75)), this.hovered, motion, narrow);

    // ---- camera: blend stage poses, then add pointer parallax
    this.poseIdx = 0;
    const poses = this.poses(narrow, tablet);
    this.tmpA.set(0, 0, 0);
    this.tmpB.set(0, 0, 0);
    let shift = 0;
    poses.forEach((p, i) => {
      this.tmpA.addScaledVector(p.pos, w[i]);
      this.tmpB.addScaledVector(p.target, w[i]);
      shift += p.shift * w[i];
    });
    const ease = this.initialized ? 1 - Math.pow(0.0015, dt) : 1;
    this.camPos.lerp(this.tmpA, ease);
    this.camTarget.lerp(this.tmpB, ease);
    this.camShift += (shift - this.camShift) * ease;
    this.initialized = true;

    this.pointerSmooth.lerp(this.pointer, 1 - Math.pow(0.02, dt));
    const par = reduced ? 0 : 1;
    this.camera.position.set(
      this.camPos.x + this.pointerSmooth.x * 1.1 * par + Math.sin(t * 0.12) * 0.35 * par,
      this.camPos.y + this.pointerSmooth.y * 0.6 * par,
      this.camPos.z,
    );
    this.camera.lookAt(this.camTarget);
    if (this.camShift > 0.001) {
      this.camera.setViewOffset(this.width, this.height, -this.camShift * this.width, 0, this.width, this.height);
    } else {
      this.camera.clearViewOffset();
    }

    // ---- pointer → world interaction
    const sincePointer = now - this.lastPointerMove;
    const active = sincePointer < 1200 ? 1 : 0;
    this.pointerActive += (active - this.pointerActive) * (1 - Math.pow(0.05, dt));
    this.raycaster.setFromCamera(this.pointer, this.camera);
    if (this.raycaster.ray.intersectPlane(this.plane, this.tmpV)) {
      this.mouseWorld.lerp(this.tmpV, 1 - Math.pow(0.001, dt));
    }
    u.uMouse.value.copy(this.mouseWorld);
    u.uMouseStrength.value = this.pointerActive * (reduced ? 0.3 : 1);

    // capsule hover
    let hovered = -1;
    if (this.capsules.group.visible && sincePointer < 4000) {
      const hits = this.raycaster.intersectObjects(this.capsules.meshes, false);
      if (hits.length) hovered = hits[0].object.userData.index as number;
    }
    if (hovered !== this.hovered) {
      this.hovered = hovered;
      document.documentElement.classList.toggle('capsule-hover', hovered >= 0);
    }

    // ---- DOM labels
    const capOpacity = reveal * smooth(clamp01((w[1] - 0.3) / 0.7));
    this.labels.capsules.forEach((el, i) => {
      if (i >= this.capsules.meshes.length) return;
      this.capsules.worldPosition(i, this.tmpV);
      this.tmpV.project(this.camera);
      const x = (this.tmpV.x * 0.5 + 0.5) * this.width;
      const y = (-this.tmpV.y * 0.5 + 0.5) * this.height;
      const h = this.capsules.hoverAmount(i);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(narrow ? 0.82 : 1) * (1 + h * 0.1)})`;
      el.style.opacity = capOpacity.toFixed(3);
      el.dataset.hover = h > 0.5 ? '1' : '0';
    });
    if (this.labels.brand) {
      this.tmpV.set(0, 0, 0).project(this.camera);
      const x = (this.tmpV.x * 0.5 + 0.5) * this.width;
      const y = (-this.tmpV.y * 0.5 + 0.5) * this.height;
      const v = smooth(clamp01((w[3] - 0.45) / 0.55)) * reveal;
      this.labels.brand.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      this.labels.brand.style.opacity = v.toFixed(3);
    }

    if (this.bloom) this.bloom.strength = 0.42 + w[1] * 0.18 + w[3] * 0.08 + w[4] * 0.15;

    if (this.composer) this.composer.render(dt);
    else this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    document.documentElement.classList.remove('capsule-hover');
    this.particles.dispose();
    this.rings.dispose();
    this.atmosphere.dispose();
    this.capsules.dispose();
    this.cubeLines.geometry.dispose();
    (this.cubeLines.material as THREE.Material).dispose();
    this.composer?.dispose();
    this.bloom?.dispose();
    this.renderer.dispose();
  }
}
