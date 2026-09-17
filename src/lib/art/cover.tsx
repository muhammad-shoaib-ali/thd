/**
 * The generated cover. Card art in production is the WordPress featured
 * image; this is the fallback when a post has none, which on a site
 * heading for 140+ guides per section will be often.
 *
 * It is deterministic: the seed comes from the post slug, so a given post
 * always draws the same cover, on the server and on the client, forever.
 * The shapes and the palette are the approved mockup's own card art —
 * bordered panel, rule lines, connector, ringed tick — recoloured to the
 * post's section accent so a card never looks foreign to its chip.
 */
import type { CategoryDef } from "@/lib/wp/taxonomy";

const ACCENT: Record<string, [string, string, string]> = {
  // [stroke, panel fill, ground]  — all four from the mockup's own card SVGs
  "c-ai":  ["#00E599", "#132420", "#0F1A18"],
  "c-how": ["#38BDF8", "#101A24", "#0E1620"],
  "c-app": ["#A78BFA", "#1A1526", "#14101F"],
  "c-fix": ["#FF7A45", "#241811", "#1C1310"],
  "c-sw":  ["#FBBF24", "#241E10", "#1B160C"],
  "c-rev": ["#FB7185", "#24141A", "#1C1014"],
};

export interface CoverArtProps {
  seed: number;
  category: CategoryDef;
  /** Card art is 640×400; the hero thumb is square. */
  variant?: "card" | "thumb";
  /**
   * Ambient drift. Off by default: in the approved mockup only the hero
   * feature art animated, and the six grid cards were still. Drifting all
   * seven would put fourteen extra loops on the homepage and read busier
   * than the design. The hero passes true; nothing else does.
   */
  motion?: boolean;
  className?: string;
}

/** Small deterministic PRNG so every value below is a function of the seed. */
function rng(seed: number): () => number {
  let s = seed || 1;
  return () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
}

export function CoverArt({ seed, category, variant = "card", motion = false, className }: CoverArtProps) {
  const [stroke, panel, ground] = ACCENT[category.chip] ?? ACCENT["c-ai"]!;
  const r = rng(seed);
  const square = variant === "thumb";
  const w = square ? 200 : 640;
  const h = square ? 200 : 400;

  // Four layout variants, chosen by seed. Enough variety that a grid of six
  // cards never shows the same drawing twice, few enough that the set still
  // reads as one family (31.1).
  const kind = Math.floor(r() * 4);
  const lines = 3 + Math.floor(r() * 2);

  // The mockup's card art drifts: five animateTransform translates of 5–8px
  // on long, rest-dominant loops. The generated fallback kept the shapes and
  // lost the motion, so the ported hero sat still where the approved mockup
  // breathed. Restored here, with duration and phase seeded from the slug so
  // a grid of six cards never moves in lockstep. Amplitudes and easing are
  // the mockup's own; composited transform only, so nothing repaints.
  const driftA = 22 + Math.floor(r() * 9);   // 22–30s
  const driftB = 27 + Math.floor(r() * 11);  // 27–37s
  const dy = 5 + Math.floor(r() * 4);        // 5–8px, as in the mockup

  if (square) {
    return (
      <svg viewBox="0 0 200 200" width="100%" height="100%"
           preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
        <rect width="200" height="200" fill={ground} />
        <rect x="34" y="46" width="132" height="108" rx="10" fill={panel} stroke={stroke} strokeWidth="2.5" />
        {Array.from({ length: lines }, (_, i) => (
          <path key={i} d={`M56 ${84 + i * 20} h${88 - i * 18}`} stroke={stroke}
                strokeWidth="4" strokeLinecap="round" opacity=".75" />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 640 400" width="100%" height="100%"
         preserveAspectRatio="xMidYMid slice" aria-hidden="true" className={className}>
      <rect width="640" height="400" fill={ground} />
      <g>
        {motion ? (
          <animateTransform attributeName="transform" type="translate"
            values={`0 0;0 -${dy};0 0`} keyTimes="0;0.5;1" dur={`${driftA}s`}
            calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
            repeatCount="indefinite" />
        ) : null}
        <rect x="70" y="86" width="210" height="228" rx="14" fill={panel} stroke={stroke} strokeWidth="2.5" />
        {Array.from({ length: lines + 1 }, (_, i) => (
          <path key={i} d={`M104 ${140 + i * 38} h${142 - (i % 3) * 30}`} stroke={stroke}
                strokeWidth="5" strokeLinecap="round" opacity=".7" />
        ))}
      </g>
      <path d="M300 200 h64" stroke={stroke} strokeWidth="4" strokeDasharray="10 8" />
      <g>
        {motion ? (
          <animateTransform attributeName="transform" type="translate"
            values={`0 0;0 ${dy};0 0`} keyTimes="0;0.5;1" dur={`${driftB}s`}
            calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
            repeatCount="indefinite" />
        ) : null}
      {kind === 0 && (
        <>
          <rect x="382" y="120" width="188" height="160" rx="14" fill={panel} stroke={stroke} strokeWidth="2.5" />
          <circle cx="476" cy="200" r="34" fill="none" stroke={stroke} strokeWidth="4" />
          <path d="M462 200 l10 12 l20 -26" fill="none" stroke={stroke} strokeWidth="5"
                strokeLinecap="round" strokeLinejoin="round" />
        </>
      )}
      {kind === 1 && (
        <>
          <rect x="382" y="120" width="188" height="160" rx="14" fill={panel} stroke={stroke} strokeWidth="2.5" />
          <path d="M412 250 v-40 M452 250 v-72 M492 250 v-54 M532 250 v-96"
                stroke={stroke} strokeWidth="9" strokeLinecap="round" />
        </>
      )}
      {kind === 2 && (
        <>
          <circle cx="476" cy="200" r="72" fill={panel} stroke={stroke} strokeWidth="2.5" />
          <circle cx="476" cy="200" r="42" fill="none" stroke={stroke} strokeWidth="3" opacity=".6" />
          <circle cx="476" cy="128" r="8" fill={stroke} />
        </>
      )}
      {kind === 3 && (
        <>
          <rect x="382" y="150" width="188" height="44" rx="10" fill={panel} stroke={stroke} strokeWidth="2.5" />
          <rect x="382" y="214" width="132" height="44" rx="10" fill={panel} stroke={stroke} strokeWidth="2.5" />
          <path d="M540 236 h30" stroke={stroke} strokeWidth="5" strokeLinecap="round" />
        </>
      )}
      </g>
    </svg>
  );
}
