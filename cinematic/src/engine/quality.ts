export type Tier = 'low' | 'mid' | 'high';

export interface Quality {
  tier: Tier;
  particles: number;
  stars: number;
  ringParticles: number;
  dpr: number;
  bloom: boolean;
  reflection: boolean;
}

export function detectQuality(lite = false): Quality {
  const w = window.innerWidth;
  const cores = navigator.hardwareConcurrency ?? 4;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  let tier: Tier = 'high';
  if (lite || w < 768 || cores <= 4) tier = 'low';
  else if (w < 1200 || coarse) tier = 'mid';

  const dprCap = tier === 'high' ? 1.5 : tier === 'mid' ? 1.25 : 1.1;
  const dpr = lite ? 1 : Math.min(window.devicePixelRatio || 1, dprCap);

  switch (tier) {
    case 'high':
      return { tier, particles: 46000, stars: 4200, ringParticles: 1800, dpr, bloom: true, reflection: true };
    case 'mid':
      return { tier, particles: 28000, stars: 2800, ringParticles: 1200, dpr, bloom: true, reflection: false };
    default:
      return { tier, particles: 15000, stars: 1600, ringParticles: 700, dpr, bloom: false, reflection: false };
  }
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}
