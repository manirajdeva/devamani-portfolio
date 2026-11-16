export const particleVertex = /* glsl */ `
uniform float uTime;
uniform float uMorph;
uniform float uSize;
uniform float uPixelRatio;
uniform vec3  uMouse;
uniform float uMouseStrength;
uniform float uMotion;
uniform float uTrunkBase;
uniform float uTrunkH;
uniform float uReflect;
uniform float uOpacity;

attribute vec3 aTree;
attribute vec3 aDissolve;
attribute vec3 aCube;
attribute vec3 aWave;
attribute vec4 aRand;
attribute vec2 aMeta;

varying vec3 vColor;
varying float vAlpha;

mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }

// Per-particle staggered progress through one morph segment.
float stage(float m, float seg) {
  float t = clamp(m - seg, 0.0, 1.0);
  float d = aRand.x * 0.4;
  t = clamp((t - d) / 0.6, 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

void main() {
  float T = uTime;
  float M = uMotion;
  float kind = aMeta.x;
  float edge = aMeta.y;
  const float PI = 3.14159265;

  // ---- 0: scattered universe
  vec3 sc = position;
  sc.xz = rot(T * 0.015) * sc.xz;
  sc += vec3(sin(T * 0.3 + aRand.y * 20.0), cos(T * 0.25 + aRand.z * 20.0), sin(T * 0.2 + aRand.w * 20.0)) * 0.25 * M;

  // ---- 1: tree
  vec3 tr = aTree;
  if (kind < 0.5) {
    // energy rising through the trunk
    tr.y = mod(tr.y - uTrunkBase + T * 0.55 * M * (0.6 + aRand.y * 0.8), uTrunkH) + uTrunkBase;
  }
  float canopy = step(1.5, kind);
  float breath = sin(T * 0.9);
  tr.xz *= 1.0 + breath * 0.014 * M;
  tr.y = (tr.y - uTrunkBase) * (1.0 + breath * 0.006 * M) + uTrunkBase;
  tr.x += sin(tr.y * 1.4 + T * 0.9 + tr.z * 0.6) * 0.07 * canopy * M;
  tr.z += cos(tr.x * 1.2 + T * 0.75) * 0.06 * canopy * M;
  tr.y += sin(tr.x * 0.9 + T * 1.1 + aRand.z * 2.0) * 0.045 * canopy * M;
  tr += (aRand.xyz - 0.5) * 0.025 * sin(T * 2.0 + aRand.w * 40.0) * M;
  // escaping particles that drift out and return
  float esc = step(0.962, aRand.w) * canopy;
  float cyc = fract(T * 0.06 * (0.6 + aRand.y) + aRand.z);
  float o = sin(cyc * PI); o *= o;
  vec3 outDir = normalize(aTree - vec3(0.0, 0.6, 0.0));
  tr += (outDir * (1.8 + aRand.y * 1.6) + vec3(0.0, 1.0 + aRand.z, 0.0)) * o * esc * M;
  tr.xz = rot(T * 0.05 * M) * tr.xz;

  // ---- 2: dissolved cloud
  vec3 di = aDissolve;
  di += vec3(sin(T * 0.4 + aRand.y * 30.0), cos(T * 0.35 + aRand.z * 30.0), sin(T * 0.3 + aRand.x * 30.0)) * 0.35 * M;
  di.xz = rot(T * 0.04) * di.xz;

  // ---- 3: cube (with periodic disintegration / reconstruction)
  vec3 cu = aCube;
  float br = smoothstep(0.8, 1.0, sin(T * 0.32 - 1.2) * 0.5 + 0.5) * M;
  vec3 cn = normalize(aCube + 0.0001);
  cu += (cn * (0.5 + aRand.y * 2.2) + (aRand.xyz - 0.5) * 1.2) * br * (0.3 + aRand.z);
  cu.xz = rot(T * 0.22 * max(M, 0.2) + 0.6) * cu.xz;
  cu.yz = rot(sin(T * 0.17) * 0.3 * M + 0.42) * cu.yz;

  // ---- 4: energy waves
  vec3 wv = aWave;
  float dist = length(wv.xz - vec2(0.0, -3.0));
  wv.y += sin(dist * 0.9 - T * 1.6 * max(M, 0.2)) * 0.42 * exp(-dist * 0.06)
        + sin(wv.x * 0.35 + T * 0.7) * 0.28
        + cos(wv.z * 0.5 + T * 0.5) * 0.18;

  float s1 = stage(uMorph, 0.0);
  float s2 = stage(uMorph, 1.0);
  float s3 = stage(uMorph, 2.0);
  float s4 = stage(uMorph, 3.0);

  vec3 p = sc;
  p = mix(p, tr, s1);
  p = mix(p, di, s2);
  p = mix(p, cu, s3);
  p = mix(p, wv, s4);

  // arcing flight paths mid-transition
  vec3 swirl = vec3(sin(aRand.y * 6.283 + T * 0.5), cos(aRand.z * 6.283 + T * 0.4), sin(aRand.w * 6.283)) * 1.4;
  p += swirl * (sin(s1 * PI) + sin(s2 * PI) * 0.6 + sin(s3 * PI) + sin(s4 * PI) * 0.8);

  float wSc = 1.0 - s1;
  float wTree = s1 * (1.0 - s2);
  float wDis = s2 * (1.0 - s3);
  float wCube = s3 * (1.0 - s4);
  float wWave = s4;

  // pointer interaction: particles part around the cursor
  vec3 dm = p - uMouse;
  float md = length(dm.xy);
  float push = (1.0 - smoothstep(0.0, 1.8, md)) * uMouseStrength;
  p.xy += normalize(dm.xy + 0.0001) * push * 0.7;
  p.z += push * 0.4;

  if (uReflect > 0.5) p.y = 2.0 * (uTrunkBase - 0.08) - p.y;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  vec3 deep = vec3(0.06, 0.2, 0.95);
  vec3 blue = vec3(0.16, 0.48, 1.0);
  vec3 cyan = vec3(0.45, 0.93, 1.0);
  vec3 ice  = vec3(0.82, 0.97, 1.0);
  float shimmer = 0.65 + 0.35 * sin(T * 2.2 + aRand.w * 60.0);

  vec3 cTr = kind < 0.5 ? mix(cyan, ice, aRand.y * 0.3)
           : (kind < 1.5 ? mix(blue, cyan, 0.45 + aRand.y * 0.5)
           : mix(deep, blue, aRand.y) + cyan * 0.3 * step(0.9, aRand.z));
  float aTr = kind < 0.5 ? 0.62 : (kind < 1.5 ? 0.9 : 0.6 + 0.4 * shimmer);
  vec3 cCu = edge > 0.5 ? mix(cyan, ice, 0.4) : mix(deep, blue, aRand.y);
  float aCu = edge > 0.5 ? 1.0 : 0.22 + 0.2 * shimmer;
  float wh = clamp((wv.y + 2.7) / 1.1, 0.0, 1.0);
  vec3 cWa = mix(blue, mix(cyan, ice, 0.3), wh);
  float aWa = 0.45 + wh * 0.55;
  vec3 cSc = mix(blue, ice, aRand.z);
  float aSc = 0.35 + 0.4 * shimmer;

  vColor = cTr * wTree + mix(blue, cyan, aRand.y) * wDis + cCu * wCube + cWa * wWave + cSc * wSc;
  vColor += push * 0.6;
  vAlpha = (aTr * wTree + (0.5 + 0.4 * shimmer) * wDis + aCu * wCube + aWa * wWave + aSc * wSc) * uOpacity;

  float sizeK = (kind < 0.5 ? 1.0 : 1.0) * wTree + 0.9 * wDis + (edge > 0.5 ? 1.5 : 0.8) * wCube + 1.15 * wWave + 0.75 * wSc;
  if (uReflect > 0.5) vAlpha *= 0.13 * wTree;
  gl_PointSize = uSize * (0.55 + aRand.x * 0.9) * sizeK * uPixelRatio * (24.0 / -mv.z);
}
`;

export const particleFragment = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float core = smoothstep(0.5, 0.0, d);
  float glow = core * core;
  float hot = smoothstep(0.16, 0.0, d);
  vec3 col = vColor * glow + vec3(1.0) * hot * 0.3;
  gl_FragColor = vec4(col, vAlpha * glow);
}
`;
