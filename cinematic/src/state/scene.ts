/**
 * Shared, mutable scene state. GSAP/ScrollTrigger writes to it, the WebGL
 * engine reads it every frame. Nothing here triggers React renders.
 *
 * morph stages:
 *   0 = scattered universe   1 = particle tree   2 = dissolved cloud
 *   3 = particle cube        4 = energy waves
 */
export const sceneState = {
  /** 0 → 1 on first load: the universe gathers into the tree. */
  intro: 0,
  /** Scroll-driven stage, 1 → 4. */
  scrollMorph: 1,
  /** Global fade for the whole canvas (0 → 1 on load). */
  reveal: 0,
  /** Normalised pointer, -1..1. */
  pointerX: 0,
  pointerY: 0,
  /** Ambient intensity once the journey is over (0..1). */
  ambient: 1,
};

export function currentMorph() {
  return Math.min(4, Math.max(0, sceneState.scrollMorph - 1 + sceneState.intro));
}
