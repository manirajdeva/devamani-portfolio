/**
 * Procedural target shapes for the morphing particle system.
 * Every particle owns one position in every shape; the vertex shader
 * blends between them on the GPU.
 */

type V3 = [number, number, number];

export interface ShapeSet {
  count: number;
  scatter: Float32Array;
  tree: Float32Array;
  dissolve: Float32Array;
  cube: Float32Array;
  wave: Float32Array;
  rand: Float32Array; // vec4
  meta: Float32Array; // vec2: kind (0 trunk, 1 branch, 2 canopy), cube edge flag
  trunkBase: number;
  trunkHeight: number;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const scale = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const norm = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];

function basis(d: V3): [V3, V3] {
  const ref: V3 = Math.abs(d[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  const u = norm(cross(d, ref));
  const v = norm(cross(d, u));
  return [u, v];
}

interface Seg {
  a: V3;
  b: V3;
  r0: number;
  r1: number;
  depth: number;
  len: number;
}

const TRUNK_BASE = -2.6;
const TRUNK_LEN = 2.25;
const MAX_DEPTH = 5;

function buildSkeleton(rand: () => number) {
  const segs: Seg[] = [];
  const tips: V3[] = [];

  const grow = (a: V3, dir: V3, len: number, r: number, depth: number) => {
    const b = add(a, scale(dir, len));
    segs.push({ a, b, r0: r, r1: r * 0.68, depth, len });
    if (depth >= MAX_DEPTH) {
      tips.push(b);
      return;
    }
    const children = depth === 0 ? 4 : rand() < 0.38 ? 3 : 2;
    const [u, v] = basis(dir);
    const baseAz = rand() * Math.PI * 2;
    for (let i = 0; i < children; i++) {
      const az = baseAz + (i / children) * Math.PI * 2 + (rand() - 0.5) * 0.9;
      const tilt = depth === 0 ? 0.62 + rand() * 0.28 : 0.32 + rand() * 0.45;
      const side = add(scale(u, Math.cos(az)), scale(v, Math.sin(az)));
      let nd = add(scale(dir, Math.cos(tilt)), scale(side, Math.sin(tilt)));
      // Keep the crown broad and slightly domed.
      const outward = norm([nd[0], 0.0001, nd[2]]);
      nd = norm(add(add(nd, scale([0, 1, 0], depth < 3 ? 0.18 : -0.02)), scale(outward, 0.16)));
      const cl = len * (0.7 + rand() * 0.14);
      grow(b, nd, cl, r * 0.62, depth + 1);
    }
    // Occasional short twig for organic irregularity.
    if (depth >= 2 && depth < MAX_DEPTH - 1 && rand() < 0.3) {
      const t = 0.4 + rand() * 0.4;
      const p = lerp(a, b, t);
      const az = rand() * Math.PI * 2;
      const nd = norm(add(scale(dir, 0.6), scale(add(scale(u, Math.cos(az)), scale(v, Math.sin(az))), 0.8)));
      const tb = add(p, scale(nd, len * 0.45));
      segs.push({ a: p, b: tb, r0: r * 0.4, r1: r * 0.25, depth: depth + 1, len: len * 0.45 });
      tips.push(tb);
    }
  };

  grow([0, TRUNK_BASE, 0], [0, 1, 0], TRUNK_LEN, 0.36, 0);

  // Roots flaring out over the energy platform.
  const roots = 6;
  for (let i = 0; i < roots; i++) {
    const az = (i / roots) * Math.PI * 2 + rand() * 0.4;
    const a: V3 = [0, TRUNK_BASE + 0.35, 0];
    const b: V3 = [Math.cos(az) * (1.0 + rand() * 0.5), TRUNK_BASE - 0.05, Math.sin(az) * (1.0 + rand() * 0.5)];
    segs.push({ a, b, r0: 0.2, r1: 0.04, depth: 1, len: 1.2 });
  }

  return { segs, tips };
}

function randomUnit(rand: () => number): V3 {
  const u = rand() * 2 - 1;
  const t = rand() * Math.PI * 2;
  const s = Math.sqrt(1 - u * u);
  return [s * Math.cos(t), u, s * Math.sin(t)];
}

export function buildShapes(count: number, seed = 7): ShapeSet {
  const rand = mulberry32(seed);
  const { segs, tips } = buildSkeleton(rand);
  const trunk = segs[0];
  const branchSegs = segs.slice(1);
  const weights = branchSegs.map((s) => s.len * (s.r0 + s.r1) + 0.02);
  const total = weights.reduce((a, b) => a + b, 0);
  const cumulative: number[] = [];
  weights.reduce((acc, w, i) => (cumulative[i] = acc + w / total), 0);
  const pickSeg = () => {
    const r = rand();
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < r) lo = mid + 1;
      else hi = mid;
    }
    return branchSegs[lo];
  };

  const scatter = new Float32Array(count * 3);
  const tree = new Float32Array(count * 3);
  const dissolve = new Float32Array(count * 3);
  const cube = new Float32Array(count * 3);
  const wave = new Float32Array(count * 3);
  const rnd = new Float32Array(count * 4);
  const meta = new Float32Array(count * 2);

  const nTrunk = Math.floor(count * 0.1);
  const nBranch = Math.floor(count * 0.3);

  // Wave grid dimensions
  const cols = Math.round(Math.sqrt(count * 2.4));
  const rows = Math.ceil(count / cols);

  const H = 2.3;
  for (let i = 0; i < count; i++) {
    const i3 = i * 3;
    let p: V3;
    let kind: number;

    if (i < nTrunk) {
      kind = 0;
      const t = rand();
      const r = (trunk.r0 + (trunk.r1 - trunk.r0) * t) * (0.5 + 0.5 * Math.sqrt(rand()));
      const az = rand() * Math.PI * 2;
      p = [Math.cos(az) * r, TRUNK_BASE + t * trunk.len, Math.sin(az) * r];
    } else if (i < nTrunk + nBranch) {
      kind = 1;
      const s = pickSeg();
      const t = rand();
      const c = lerp(s.a, s.b, t);
      const dir = norm([s.b[0] - s.a[0], s.b[1] - s.a[1], s.b[2] - s.a[2]]);
      const [u, v] = basis(dir);
      const r = (s.r0 + (s.r1 - s.r0) * t) * Math.sqrt(rand());
      const az = rand() * Math.PI * 2;
      p = add(c, add(scale(u, Math.cos(az) * r), scale(v, Math.sin(az) * r)));
    } else {
      kind = 2;
      const tip = tips[Math.floor(rand() * tips.length)];
      const d = randomUnit(rand);
      const R = 0.38 + rand() * 0.36;
      const r = R * (rand() < 0.55 ? Math.cbrt(rand()) : Math.pow(rand(), 0.3));
      p = [tip[0] + d[0] * r, tip[1] + d[1] * r * 0.72 + 0.12, tip[2] + d[2] * r];
    }

    tree[i3] = p[0];
    tree[i3 + 1] = p[1];
    tree[i3 + 2] = p[2];

    // Scattered universe
    const sd = randomUnit(rand);
    const sr = 7 + Math.pow(rand(), 0.7) * 17;
    scatter[i3] = sd[0] * sr;
    scatter[i3 + 1] = sd[1] * sr * 0.62;
    scatter[i3 + 2] = sd[2] * sr - 3;

    // Dissolved cloud: the tree expands and drifts apart
    const dd = randomUnit(rand);
    const dr = 1.4 + rand() * 3.6;
    dissolve[i3] = p[0] * 1.35 + dd[0] * dr;
    dissolve[i3 + 1] = p[1] * 1.2 + dd[1] * dr * 0.8 + 0.7;
    dissolve[i3 + 2] = p[2] * 1.35 + dd[2] * dr;

    // Cube: edges + transparent faces
    const h = H;
    let edge = 0;
    if (rand() < 0.34) {
      edge = 1;
      const e = Math.floor(rand() * 12);
      const t = rand() * 2 - 1;
      const axis = Math.floor(e / 4);
      const s1 = e & 1 ? 1 : -1;
      const s2 = e & 2 ? 1 : -1;
      const j = () => (rand() - 0.5) * 0.035;
      if (axis === 0) {
        cube[i3] = t * h; cube[i3 + 1] = s1 * h + j(); cube[i3 + 2] = s2 * h + j();
      } else if (axis === 1) {
        cube[i3] = s1 * h + j(); cube[i3 + 1] = t * h; cube[i3 + 2] = s2 * h + j();
      } else {
        cube[i3] = s1 * h + j(); cube[i3 + 1] = s2 * h + j(); cube[i3 + 2] = t * h;
      }
    } else {
      const f = Math.floor(rand() * 6);
      let a = (rand() * 2 - 1) * h;
      let b = (rand() * 2 - 1) * h;
      // ~35% of face particles sit on a holographic 4×4 grid
      if (rand() < 0.35) {
        const snap = (v: number) => Math.round((v / h) * 2) * (h / 2);
        if (rand() < 0.5) a = snap(a);
        else b = snap(b);
      }
      const s = f & 1 ? h : -h;
      const depth = (rand() - 0.5) * 0.06;
      const ax = f >> 1;
      if (ax === 0) { cube[i3] = s + depth; cube[i3 + 1] = a; cube[i3 + 2] = b; }
      else if (ax === 1) { cube[i3] = a; cube[i3 + 1] = s + depth; cube[i3 + 2] = b; }
      else { cube[i3] = a; cube[i3 + 1] = b; cube[i3 + 2] = s + depth; }
    }

    // Energy wave field
    const col = i % cols;
    const row = Math.floor(i / cols);
    wave[i3] = (col / (cols - 1) - 0.5) * 28 + (rand() - 0.5) * 0.08;
    wave[i3 + 1] = -2.2;
    wave[i3 + 2] = (row / Math.max(1, rows - 1) - 0.5) * 15 - 3 + (rand() - 0.5) * 0.08;

    rnd[i * 4] = rand();
    rnd[i * 4 + 1] = rand();
    rnd[i * 4 + 2] = rand();
    rnd[i * 4 + 3] = rand();

    meta[i * 2] = kind;
    meta[i * 2 + 1] = edge;
  }

  return {
    count,
    scatter,
    tree,
    dissolve,
    cube,
    wave,
    rand: rnd,
    meta,
    trunkBase: TRUNK_BASE,
    trunkHeight: TRUNK_LEN,
  };
}
