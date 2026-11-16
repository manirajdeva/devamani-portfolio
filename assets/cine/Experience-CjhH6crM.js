import{B as Y,a as R,S as st,V as z,b as W,A as E,P as $,G as it,D as gt,M as at,c as ut,C as et,d as wt,e as Mt,f as J,R as yt,g as xt,W as bt,h as Pt,i as Tt,j as St,E as zt,L as At,k as Rt,l as Ct,m as kt,U as Ft,O as Ot}from"./three-BzXGZFky.js";import{C as Lt,s as X,d as Vt,c as Dt}from"./shared-CC4GEbCz.js";function ot(s){let e=s>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}const L=(s,e)=>[s[0]+e[0],s[1]+e[1],s[2]+e[2]],S=(s,e)=>[s[0]*e,s[1]*e,s[2]*e],pt=(s,e,t)=>[s[0]+(e[0]-s[0])*t,s[1]+(e[1]-s[1])*t,s[2]+(e[2]-s[2])*t],I=s=>{const e=Math.hypot(s[0],s[1],s[2])||1;return[s[0]/e,s[1]/e,s[2]/e]},nt=(s,e)=>[s[1]*e[2]-s[2]*e[1],s[2]*e[0]-s[0]*e[2],s[0]*e[1]-s[1]*e[0]];function dt(s){const e=Math.abs(s[1])<.9?[0,1,0]:[1,0,0],t=I(nt(s,e)),i=I(nt(s,t));return[t,i]}const N=-2.6,mt=2.25,ht=5;function Wt(s){const e=[],t=[],i=(o,h,n,r,l)=>{const v=L(o,S(h,n));if(e.push({a:o,b:v,r0:r,r1:r*.68,depth:l,len:n}),l>=ht){t.push(v);return}const y=l===0?4:s()<.38?3:2,[u,w]=dt(h),p=s()*Math.PI*2;for(let x=0;x<y;x++){const M=p+x/y*Math.PI*2+(s()-.5)*.9,C=l===0?.62+s()*.28:.32+s()*.45,O=L(S(u,Math.cos(M)),S(w,Math.sin(M)));let P=L(S(h,Math.cos(C)),S(O,Math.sin(C)));const V=I([P[0],1e-4,P[2]]);P=I(L(L(P,S([0,1,0],l<3?.18:-.02)),S(V,.16)));const G=n*(.7+s()*.14);i(v,P,G,r*.62,l+1)}if(l>=2&&l<ht-1&&s()<.3){const x=.4+s()*.4,M=pt(o,v,x),C=s()*Math.PI*2,O=I(L(S(h,.6),S(L(S(u,Math.cos(C)),S(w,Math.sin(C))),.8))),P=L(M,S(O,n*.45));e.push({a:M,b:P,r0:r*.4,r1:r*.25,depth:l+1,len:n*.45}),t.push(P)}};i([0,N,0],[0,1,0],mt,.36,0);const c=6;for(let o=0;o<c;o++){const h=o/c*Math.PI*2+s()*.4,n=[0,N+.35,0],r=[Math.cos(h)*(1+s()*.5),N-.05,Math.sin(h)*(1+s()*.5)];e.push({a:n,b:r,r0:.2,r1:.04,depth:1,len:1.2})}return{segs:e,tips:t}}function tt(s){const e=s()*2-1,t=s()*Math.PI*2,i=Math.sqrt(1-e*e);return[i*Math.cos(t),e,i*Math.sin(t)]}function Et(s,e=7){const t=ot(e),{segs:i,tips:c}=Wt(t),o=i[0],h=i.slice(1),n=h.map(d=>d.len*(d.r0+d.r1)+.02),r=n.reduce((d,a)=>d+a,0),l=[];n.reduce((d,a,m)=>l[m]=d+a/r,0);const v=()=>{const d=t();let a=0,m=l.length-1;for(;a<m;){const k=a+m>>1;l[k]<d?a=k+1:m=k}return h[a]},y=new Float32Array(s*3),u=new Float32Array(s*3),w=new Float32Array(s*3),p=new Float32Array(s*3),x=new Float32Array(s*3),M=new Float32Array(s*4),C=new Float32Array(s*2),O=Math.floor(s*.1),P=Math.floor(s*.3),V=Math.round(Math.sqrt(s*2.4)),G=Math.ceil(s/V),_=2.3;for(let d=0;d<s;d++){const a=d*3;let m,k;if(d<O){k=0;const f=t(),g=(o.r0+(o.r1-o.r0)*f)*(.5+.5*Math.sqrt(t())),T=t()*Math.PI*2;m=[Math.cos(T)*g,N+f*o.len,Math.sin(T)*g]}else if(d<O+P){k=1;const f=v(),g=t(),T=pt(f.a,f.b,g),A=I([f.b[0]-f.a[0],f.b[1]-f.a[1],f.b[2]-f.a[2]]),[D,F]=dt(A),j=(f.r0+(f.r1-f.r0)*g)*Math.sqrt(t()),K=t()*Math.PI*2;m=L(T,L(S(D,Math.cos(K)*j),S(F,Math.sin(K)*j)))}else{k=2;const f=c[Math.floor(t()*c.length)],g=tt(t),A=(.38+t()*.36)*(t()<.55?Math.cbrt(t()):Math.pow(t(),.3));m=[f[0]+g[0]*A,f[1]+g[1]*A*.72+.12,f[2]+g[2]*A]}u[a]=m[0],u[a+1]=m[1],u[a+2]=m[2];const U=tt(t),B=7+Math.pow(t(),.7)*17;y[a]=U[0]*B,y[a+1]=U[1]*B*.62,y[a+2]=U[2]*B-3;const Z=tt(t),Q=1.4+t()*3.6;w[a]=m[0]*1.35+Z[0]*Q,w[a+1]=m[1]*1.2+Z[1]*Q*.8+.7,w[a+2]=m[2]*1.35+Z[2]*Q;const b=_;let rt=0;if(t()<.34){rt=1;const f=Math.floor(t()*12),g=t()*2-1,T=Math.floor(f/4),A=f&1?1:-1,D=f&2?1:-1,F=()=>(t()-.5)*.035;T===0?(p[a]=g*b,p[a+1]=A*b+F(),p[a+2]=D*b+F()):T===1?(p[a]=A*b+F(),p[a+1]=g*b,p[a+2]=D*b+F()):(p[a]=A*b+F(),p[a+1]=D*b+F(),p[a+2]=g*b)}else{const f=Math.floor(t()*6);let g=(t()*2-1)*b,T=(t()*2-1)*b;if(t()<.35){const j=K=>Math.round(K/b*2)*(b/2);t()<.5?g=j(g):T=j(T)}const A=f&1?b:-b,D=(t()-.5)*.06,F=f>>1;F===0?(p[a]=A+D,p[a+1]=g,p[a+2]=T):F===1?(p[a]=g,p[a+1]=A+D,p[a+2]=T):(p[a]=g,p[a+1]=T,p[a+2]=A+D)}const ft=d%V,vt=Math.floor(d/V);x[a]=(ft/(V-1)-.5)*28+(t()-.5)*.08,x[a+1]=-2.2,x[a+2]=(vt/Math.max(1,G-1)-.5)*15-3+(t()-.5)*.08,M[d*4]=t(),M[d*4+1]=t(),M[d*4+2]=t(),M[d*4+3]=t(),C[d*2]=k,C[d*2+1]=rt}return{count:s,scatter:y,tree:u,dissolve:w,cube:p,wave:x,rand:M,meta:C,trunkBase:N,trunkHeight:mt}}const ct=`
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
`,lt=`
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
`;class _t{constructor(e,t,i,c){this.reflectionMaterial=null,this.shapes=Et(e);const o=this.shapes,h=new Y;if(h.setAttribute("position",new R(o.scatter,3)),h.setAttribute("aTree",new R(o.tree,3)),h.setAttribute("aDissolve",new R(o.dissolve,3)),h.setAttribute("aCube",new R(o.cube,3)),h.setAttribute("aWave",new R(o.wave,3)),h.setAttribute("aRand",new R(o.rand,4)),h.setAttribute("aMeta",new R(o.meta,2)),h.boundingSphere=new st(new z,1e4),this.geometry=h,this.uniforms={uTime:{value:0},uMorph:{value:0},uSize:{value:c},uPixelRatio:{value:t},uMouse:{value:new z(999,999,0)},uMouseStrength:{value:0},uMotion:{value:1},uTrunkBase:{value:o.trunkBase},uTrunkH:{value:o.trunkHeight},uReflect:{value:0},uOpacity:{value:0}},this.material=new W({uniforms:this.uniforms,vertexShader:ct,fragmentShader:lt,transparent:!0,depthWrite:!1,blending:E}),this.points=new $(h,this.material),this.points.frustumCulled=!1,this.points.renderOrder=2,i){const n={...this.uniforms,uReflect:{value:1}};this.reflectionMaterial=new W({uniforms:n,vertexShader:ct,fragmentShader:lt,transparent:!0,depthWrite:!1,blending:E}),this.reflection=new $(h,this.reflectionMaterial),this.reflection.frustumCulled=!1,this.reflection.renderOrder=0}else this.reflection=null}dispose(){this.geometry.dispose(),this.material.dispose(),this.reflectionMaterial?.dispose()}}const Bt=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,It=`
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
`,Gt=`
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
`,Ut=`
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.55, 0.95, 1.0) * g * g, vAlpha * g);
}
`;class jt{constructor(e,t,i){this.group=new it,this.discMat=new W({uniforms:{uTime:{value:0},uOpacity:{value:0},uMotion:{value:1}},vertexShader:Bt,fragmentShader:It,transparent:!0,depthWrite:!1,blending:E,side:gt}),this.disc=new at(new ut(18,18,1,1),this.discMat),this.disc.rotation.x=-Math.PI/2,this.disc.renderOrder=1;const c=ot(99),o=new Float32Array(t*4),h=new Float32Array(t*3);for(let n=0;n<t;n++){const r=Math.floor(c()*6),l=.9+r*1.05+(c()-.5)*.08;o[n*4]=l,o[n*4+1]=c()*Math.PI*2,o[n*4+2]=(r%2===0?1:-1)*(.12+c()*.2)/(1+r*.25),o[n*4+3]=c(),h[n*3+1]=.02+c()*.05}this.streamGeo=new Y,this.streamGeo.setAttribute("position",new R(h,3)),this.streamGeo.setAttribute("aData",new R(o,4)),this.streamGeo.boundingSphere=new st(new z,20),this.streamMat=new W({uniforms:{uTime:{value:0},uOpacity:{value:0},uPixelRatio:{value:i},uMotion:{value:1}},vertexShader:Gt,fragmentShader:Ut,transparent:!0,depthWrite:!1,blending:E}),this.stream=new $(this.streamGeo,this.streamMat),this.stream.renderOrder=1,this.group.add(this.disc,this.stream),this.group.position.y=e}update(e,t,i){this.discMat.uniforms.uTime.value=e,this.discMat.uniforms.uOpacity.value=t,this.discMat.uniforms.uMotion.value=i,this.streamMat.uniforms.uTime.value=e,this.streamMat.uniforms.uOpacity.value=t,this.streamMat.uniforms.uMotion.value=i,this.group.visible=t>.002}dispose(){this.disc.geometry.dispose(),this.discMat.dispose(),this.streamGeo.dispose(),this.streamMat.dispose()}}const qt=`
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
`,Ht=`
varying float vAlpha;
varying float vTint;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  vec3 c = mix(vec3(0.62, 0.78, 1.0), vec3(1.0), vTint);
  gl_FragColor = vec4(c * g, vAlpha * g);
}
`,Nt=`
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
`,$t=`
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(vec3(0.5, 0.8, 1.0) * g * g, vAlpha * g);
}
`,Kt=`
varying vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }
`,Xt=`
uniform float uOpacity;
uniform vec3 uColor;
varying vec2 vUv;
void main() {
  float d = length(vUv - 0.5) * 2.0;
  float g = pow(max(1.0 - d, 0.0), 2.6);
  gl_FragColor = vec4(uColor * g * uOpacity, g * uOpacity);
}
`;class Yt{constructor(e,t){this.group=new it,this.disposables=[];const i=ot(4242),c=new Float32Array(e*3),o=new Float32Array(e*2);for(let u=0;u<e;u++){const w=i()*2-1,p=i()*Math.PI*2,x=Math.sqrt(1-w*w),M=45+i()*50;c[u*3]=x*Math.cos(p)*M,c[u*3+1]=w*M,c[u*3+2]=x*Math.sin(p)*M,o[u*2]=.8+Math.pow(i(),4)*2.8,o[u*2+1]=i()}const h=new Y;h.setAttribute("position",new R(c,3)),h.setAttribute("aStar",new R(o,2)),this.starMat=new W({uniforms:{uTime:{value:0},uPixelRatio:{value:t},uOpacity:{value:0}},vertexShader:qt,fragmentShader:Ht,transparent:!0,depthWrite:!1,blending:E}),this.stars=new $(h,this.starMat);const n=Math.round(e/6),r=new Float32Array(n*3),l=new Float32Array(n*4);for(let u=0;u<n;u++)r[u*3]=(i()-.5)*30,r[u*3+1]=(i()-.5)*16,r[u*3+2]=(i()-.5)*18-2,l[u*4]=.08+i()*.25,l[u*4+1]=i(),l[u*4+2]=i(),l[u*4+3]=i();const v=new Y;v.setAttribute("position",new R(r,3)),v.setAttribute("aDust",new R(l,4)),v.boundingSphere=new st(new z,50),this.dustMat=new W({uniforms:{uTime:{value:0},uPixelRatio:{value:t},uOpacity:{value:0},uMotion:{value:1}},vertexShader:Nt,fragmentShader:$t,transparent:!0,depthWrite:!1,blending:E}),this.dust=new $(v,this.dustMat);const y=new ut(1,1);this.glowMat=new W({uniforms:{uOpacity:{value:0},uColor:{value:new et(.08,.28,.95)}},vertexShader:Kt,fragmentShader:Xt,transparent:!0,depthWrite:!1,blending:E}),this.glow=new at(y,this.glowMat),this.glow.scale.setScalar(22),this.glow.position.set(0,.4,-6),this.glow.renderOrder=-1,this.disposables.push(h,v,y),this.group.add(this.glow,this.stars,this.dust)}update(e,t,i,c,o){this.starMat.uniforms.uTime.value=e,this.starMat.uniforms.uOpacity.value=t,this.dustMat.uniforms.uTime.value=e,this.dustMat.uniforms.uOpacity.value=t,this.dustMat.uniforms.uMotion.value=c,this.glowMat.uniforms.uOpacity.value=i*t,this.stars.rotation.y=e*.004*c,this.glow.quaternion.copy(o.quaternion)}dispose(){this.disposables.forEach(e=>e.dispose()),this.starMat.dispose(),this.dustMat.dispose(),this.glowMat.dispose()}}const Zt=`
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
`,Qt=`
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
`;class Jt{constructor(){this.group=new it,this.meshes=[],this.materials=[],this.hover=[],this.base=[],this.tmp=new z,this.geometry=new wt(.26,1.2,8,28),this.geometry.rotateZ(Math.PI/2),Lt.forEach((e,t)=>{const i=new W({uniforms:{uHover:{value:0},uOpacity:{value:0},uTime:{value:t*1.7}},vertexShader:Zt,fragmentShader:Qt,transparent:!0,depthWrite:!1}),c=new at(this.geometry,i);c.userData.index=t,c.renderOrder=3,this.group.add(c),this.meshes.push(c),this.materials.push(i),this.hover.push(0),this.base.push(new z(...e.position))})}update(e,t,i,c,o){this.group.visible=t>.002;const h=o?.47:1;this.meshes.forEach((n,r)=>{const l=this.base[r],v=e*c;n.position.set((l.x<0&&!o?l.x*.62:l.x*h)+Math.sin(v*.4+r)*.18,l.y*(o?.85:1)+(o?.4:0)+Math.sin(v*.55+r*2.1)*.25,l.z+Math.cos(v*.35+r)*.2),n.rotation.z=Math.sin(v*.3+r)*.12,n.rotation.y=Math.sin(v*.25+r*1.3)*.35;const y=i===r?1:0;this.hover[r]+=(y-this.hover[r])*.12;const u=(o?.72:1)*(1+this.hover[r]*.12);n.scale.setScalar(u);const w=this.materials[r].uniforms;w.uHover.value=this.hover[r],w.uOpacity.value=t,w.uTime.value=e+r*1.7})}hoverAmount(e){return this.hover[e]}worldPosition(e,t){return this.meshes[e].getWorldPosition(t??this.tmp)}dispose(){this.geometry.dispose(),this.materials.forEach(e=>e.dispose())}}const q=s=>s*s*(3-2*s),H=s=>Math.min(1,Math.max(0,s));class se{constructor(e,t){this.canvas=e,this.opts=t,this.scene=new Mt,this.composer=null,this.bloom=null,this.labels={capsules:[],brand:null},this.raf=0,this.time=0,this.last=performance.now(),this.width=1,this.height=1,this.disposed=!1,this.pointer=new J(0,0),this.pointerSmooth=new J(0,0),this.pointerActive=0,this.lastPointerMove=0,this.hovered=-1,this.raycaster=new yt,this.plane=new xt(new z(0,0,1),0),this.mouseWorld=new z(999,999,0),this.camPos=new z,this.camTarget=new z,this.camShift=0,this.tmpV=new z,this.tmpA=new z,this.tmpB=new z,this.initialized=!1,this.perfFrames=0,this.perfAcc=0,this.perfSteps=0,this.dprScale=1,this.onContextLost=n=>{n.preventDefault(),cancelAnimationFrame(this.raf),this.opts.onFailure?.("WebGL context lost")},this.onResize=()=>{this.width=window.innerWidth,this.height=window.innerHeight,this.renderer.setSize(this.width,this.height,!1),this.composer?.setSize(this.width,this.height),this.camera.aspect=this.width/this.height,this.camera.updateProjectionMatrix()},this.onPointerMove=n=>{this.pointer.set(n.clientX/this.width*2-1,-(n.clientY/this.height)*2+1),X.pointerX=this.pointer.x,X.pointerY=this.pointer.y,this.lastPointerMove=performance.now()},this.onClick=n=>{this.hovered<0||n.target?.closest("a,button,input,textarea,select,label,nav")||this.opts.onCapsuleClick?.(this.hovered)},this.poseCache=[],this.poseIdx=0,this.quality=Vt(t.lite);const i=this.quality;this.renderer=new bt({canvas:e,antialias:!1,alpha:!1,powerPreference:"high-performance",stencil:!1}),this.renderer.setPixelRatio(i.dpr),this.renderer.setClearColor(new et("#02030A"),1),this.renderer.outputColorSpace=Pt,this.camera=new Tt(42,1,.1,200),this.camera.position.set(0,1.5,20);const c=i.tier==="low"?2.2:i.tier==="mid"?1.65:1.45;this.particles=new _t(i.particles,i.dpr,i.reflection,c),this.atmosphere=new Yt(i.stars,i.dpr),this.rings=new jt(this.particles.shapes.trunkBase-.02,i.ringParticles,i.dpr),this.capsules=new Jt;const o=new St(4.6,4.6,4.6),h=new zt(o);o.dispose(),this.cubeLines=new At(h,new Rt({color:new et(.55,.95,1),transparent:!0,opacity:0,blending:E,depthWrite:!1})),this.cubeLines.renderOrder=3,this.scene.add(this.cubeLines),this.scene.add(this.atmosphere.group,this.rings.group,this.particles.points,this.capsules.group),this.particles.reflection&&this.scene.add(this.particles.reflection),i.bloom&&(this.composer=new Ct(this.renderer),this.composer.setPixelRatio(i.dpr),this.composer.addPass(new kt(this.scene,this.camera)),this.bloom=new Ft(new J(256,256),.5,.42,.16),this.composer.addPass(this.bloom),this.composer.addPass(new Ot)),this.particles.uniforms.uMotion.value=t.reducedMotion?.15:1,this.onResize(),window.addEventListener("resize",this.onResize),window.addEventListener("pointermove",this.onPointerMove,{passive:!0}),window.addEventListener("click",this.onClick),e.addEventListener("webglcontextlost",this.onContextLost,!1)}setLabels(e){this.labels=e}start(){this.last=performance.now();const e=()=>{this.disposed||(this.raf=requestAnimationFrame(e),this.frame())};this.raf=requestAnimationFrame(e)}poses(e,t){const i=e?0:t?.1:.19;return[{pos:this.tmpPose(0,1.5,21),target:this.tmpPose(0,.5,0),shift:0},e?{pos:this.tmpPose(0,1,24.5),target:this.tmpPose(0,-2.9,0),shift:0}:{pos:this.tmpPose(0,.9,t?15:13.2),target:this.tmpPose(0,.55,0),shift:i},{pos:this.tmpPose(0,1.2,e?24:15.5),target:this.tmpPose(0,.8,0),shift:i*.3},e?{pos:this.tmpPose(0,.4,28),target:this.tmpPose(0,-4.6,0),shift:0}:{pos:this.tmpPose(0,.2,t?15:13.5),target:this.tmpPose(0,-.1,0),shift:i},{pos:this.tmpPose(0,3.3,e?13:11),target:this.tmpPose(0,-1.4,-3),shift:0}]}tmpPose(e,t,i){return this.poseCache[this.poseIdx]||(this.poseCache[this.poseIdx]=new z),this.poseCache[this.poseIdx++].set(e,t,i)}adapt(e){if(this.perfSteps>=5||this.disposed||++this.perfFrames<=90||(this.perfAcc+=Math.min(e,200),this.perfFrames<135))return;const t=this.perfAcc/45;this.perfFrames=90,this.perfAcc=0,!(t<22)&&(this.perfSteps++,t>34&&this.composer?(this.composer.dispose(),this.composer=null,this.bloom=null):this.dprScale>.6&&(this.dprScale=Math.max(.6,this.dprScale*.8),this.renderer.setPixelRatio(this.quality.dpr*this.dprScale),this.composer?.setPixelRatio(this.quality.dpr*this.dprScale),this.onResize()))}frame(){const e=performance.now();this.adapt(e-this.last);const t=Math.min(.05,(e-this.last)/1e3);this.last=e,this.time+=t;const i=this.time,c=this.opts.reducedMotion,o=c?.15:1,h=Dt(),n=[0,1,2,3].map(a=>q(H(h-a))),r=[1-n[0],n[0]*(1-n[1]),n[1]*(1-n[2]),n[2]*(1-n[3]),n[3]],l=X.reveal,v=this.particles.uniforms;v.uTime.value=i,v.uMorph.value=h,v.uOpacity.value=l*(1-n[3]*(1-X.ambient));const y=(()=>{const a=Math.sin(i*.32-1.2)*.5+.5;return q(H((a-.8)/.2))*o})();this.cubeLines.rotation.set(-(Math.sin(i*.17)*.3*o+.42),i*.22*Math.max(o,.2)+.6,0,"XYZ"),this.cubeLines.scale.setScalar(1+y*.25);const u=this.cubeLines.material;u.opacity=l*Math.pow(r[3],3)*(1-y)*.55,this.cubeLines.visible=u.opacity>.002;const w=Math.pow(r[1],1.6);this.rings.update(i,l*w,o),this.atmosphere.update(i,l,r[1]*.28+r[2]*.18+r[3]*.22+r[4]*.12+r[0]*.1,o,this.camera);const p=this.width<768,x=this.width<1100;this.capsules.update(i,l*q(H((r[1]-.25)/.75)),this.hovered,o,p),this.poseIdx=0;const M=this.poses(p,x);this.tmpA.set(0,0,0),this.tmpB.set(0,0,0);let C=0;M.forEach((a,m)=>{this.tmpA.addScaledVector(a.pos,r[m]),this.tmpB.addScaledVector(a.target,r[m]),C+=a.shift*r[m]});const O=this.initialized?1-Math.pow(.0015,t):1;this.camPos.lerp(this.tmpA,O),this.camTarget.lerp(this.tmpB,O),this.camShift+=(C-this.camShift)*O,this.initialized=!0,this.pointerSmooth.lerp(this.pointer,1-Math.pow(.02,t));const P=c?0:1;this.camera.position.set(this.camPos.x+this.pointerSmooth.x*1.1*P+Math.sin(i*.12)*.35*P,this.camPos.y+this.pointerSmooth.y*.6*P,this.camPos.z),this.camera.lookAt(this.camTarget),this.camShift>.001?this.camera.setViewOffset(this.width,this.height,-this.camShift*this.width,0,this.width,this.height):this.camera.clearViewOffset();const V=e-this.lastPointerMove,G=V<1200?1:0;this.pointerActive+=(G-this.pointerActive)*(1-Math.pow(.05,t)),this.raycaster.setFromCamera(this.pointer,this.camera),this.raycaster.ray.intersectPlane(this.plane,this.tmpV)&&this.mouseWorld.lerp(this.tmpV,1-Math.pow(.001,t)),v.uMouse.value.copy(this.mouseWorld),v.uMouseStrength.value=this.pointerActive*(c?.3:1);let _=-1;if(this.capsules.group.visible&&V<4e3){const a=this.raycaster.intersectObjects(this.capsules.meshes,!1);a.length&&(_=a[0].object.userData.index)}_!==this.hovered&&(this.hovered=_,document.documentElement.classList.toggle("capsule-hover",_>=0));const d=l*q(H((r[1]-.3)/.7));if(this.labels.capsules.forEach((a,m)=>{if(m>=this.capsules.meshes.length)return;this.capsules.worldPosition(m,this.tmpV),this.tmpV.project(this.camera);const k=(this.tmpV.x*.5+.5)*this.width,U=(-this.tmpV.y*.5+.5)*this.height,B=this.capsules.hoverAmount(m);a.style.transform=`translate3d(${k.toFixed(1)}px, ${U.toFixed(1)}px, 0) translate(-50%, -50%) scale(${(p?.82:1)*(1+B*.1)})`,a.style.opacity=d.toFixed(3),a.dataset.hover=B>.5?"1":"0"}),this.labels.brand){this.tmpV.set(0,0,0).project(this.camera);const a=(this.tmpV.x*.5+.5)*this.width,m=(-this.tmpV.y*.5+.5)*this.height,k=q(H((r[3]-.45)/.55))*l;this.labels.brand.style.transform=`translate3d(${a.toFixed(1)}px, ${m.toFixed(1)}px, 0) translate(-50%, -50%)`,this.labels.brand.style.opacity=k.toFixed(3)}this.bloom&&(this.bloom.strength=.42+r[1]*.18+r[3]*.08+r[4]*.15),this.composer?this.composer.render(t):this.renderer.render(this.scene,this.camera)}dispose(){this.disposed=!0,cancelAnimationFrame(this.raf),window.removeEventListener("resize",this.onResize),window.removeEventListener("pointermove",this.onPointerMove),window.removeEventListener("click",this.onClick),this.canvas.removeEventListener("webglcontextlost",this.onContextLost),document.documentElement.classList.remove("capsule-hover"),this.particles.dispose(),this.rings.dispose(),this.atmosphere.dispose(),this.capsules.dispose(),this.cubeLines.geometry.dispose(),this.cubeLines.material.dispose(),this.composer?.dispose(),this.bloom?.dispose(),this.renderer.dispose()}}export{se as Experience};
