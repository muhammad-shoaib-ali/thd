/**
 * Motion constants. The mockup uses exactly one easing curve, so this file
 * has exactly one, and no component may inline a cubic-bezier (Module 11).
 * Durations are the mockup's own, read off its transition declarations.
 */
export const EASE = {
  /** cubic-bezier(.16,1,.3,1) — the only curve in the approved mockup. */
  arrive: "cubic-bezier(.16,1,.3,1)",
} as const;

export const DUR = {
  liftFeat: 300,   // .feat  hover
  liftMini: 280,   // .mini  hover
  liftCat: 280,    // .cat   hover
  liftCard: 300,   // .card  hover
  reveal: 600,     // .uf    entrance
} as const;

/** Ambient loops, all rest-dominant and all from the mockup. */
export const LOOP = {
  march: 40_000,      // trend ticker marquee
  glowdrift: 26_000,  // hero aura
  slowspin: 43_000,   // newsletter dial
  bobcard: 9_000,
} as const;

/** Stagger for the .uf entrance. The observer adds .in; index sets delay. */
export const stagger = (i: number, step = 60, cap = 420): number =>
  Math.min(i * step, cap);

export const REDUCED = "(prefers-reduced-motion: reduce)";
