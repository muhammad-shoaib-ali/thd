/**
 * The six sections, frozen. This file is the single source for category
 * slug, label, chip class and accent, so the masthead, the category grid,
 * the chips and the routes can never disagree with each other.
 *
 * ROUTES: the approved mockup carried href="#" on 37 of its 40 links, so
 * no URL structure came with it. These are the paths the build assumes.
 * Changing one is a spec revision (12.10.1), not a local edit — the
 * sitemap, the nav, the chips and the WP permalinks all read from here.
 */
export type CategorySlug =
  | "ai-tools" | "how-to" | "apps" | "software" | "fixes" | "reviews";

export interface CategoryDef {
  slug: CategorySlug;
  /** WordPress category slug. Kept separate in case WP differs from the URL. */
  wpSlug: string;
  label: string;
  /** Chip class from design/atoms.css. */
  chip: string;
  /** CSS custom property holding this section's accent. */
  accent: string;
  /** rgba border used on the category card, matching the mockup. */
  cardBorder: string;
  dek: string;
}

export const CATEGORIES: readonly CategoryDef[] = [
  { slug: "ai-tools", wpSlug: "ai-tools", label: "AI Tools",
    chip: "c-ai", accent: "var(--mint)", cardBorder: "rgba(0,229,153,.22)",
    dek: "Chat, agents, image, audio. Tested on real work, not demos." },
  { slug: "how-to", wpSlug: "how-to", label: "How-To",
    chip: "c-how", accent: "var(--sky)", cardBorder: "rgba(56,189,248,.22)",
    dek: "Step-by-step, with the version numbers we used." },
  { slug: "apps", wpSlug: "apps", label: "Apps",
    chip: "c-app", accent: "var(--violet)", cardBorder: "rgba(167,139,250,.22)",
    dek: "Mobile and desktop, after a fortnight of real use." },
  { slug: "software", wpSlug: "software", label: "Software",
    chip: "c-sw", accent: "var(--amber)", cardBorder: "rgba(251,191,36,.22)",
    dek: "Installers, licences, and what the free tier actually gives you." },
  { slug: "fixes", wpSlug: "fixes", label: "Fixes",
    chip: "c-fix", accent: "var(--coral)", cardBorder: "rgba(255,122,69,.22)",
    dek: "Error messages, decoded, with the fix that worked." },
  { slug: "reviews", wpSlug: "reviews", label: "Reviews",
    chip: "c-rev", accent: "var(--rose)", cardBorder: "rgba(251,113,133,.22)",
    dek: "Bought, used, and reported honestly — including the returns." },
] as const;

const BY_SLUG = new Map(CATEGORIES.map((c) => [c.slug, c]));
const BY_WP = new Map(CATEGORIES.map((c) => [c.wpSlug, c]));

export const category = (slug: string): CategoryDef | undefined =>
  BY_SLUG.get(slug as CategorySlug);
export const categoryByWp = (wpSlug: string): CategoryDef | undefined =>
  BY_WP.get(wpSlug);

/** Every route the site serves. The sitemap and the audit both read this. */
export const ROUTES = {
  home: "/",
  post: (slug: string) => `/${slug}/`,
  category: (slug: string) => `/${slug}/`,
  search: "/search/",
  about: "/about/",
  howWeTest: "/how-we-test/",
  contact: "/contact/",
  writeForUs: "/write-for-us/",
  privacy: "/privacy/",
  terms: "/terms/",
  disclaimer: "/disclaimer/",
  affiliate: "/affiliate-disclosure/",
  corrections: "/corrections/",
} as const;

/**
 * 10.5 requires all five reachable from every page. The mockup's Legal
 * group had Privacy, Terms, Affiliate disclosure and Corrections, with
 * About and Contact under Site, and NO Disclaimer. Disclaimer is added.
 */
export const LEGAL_REQUIRED = [
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
  { href: ROUTES.privacy, label: "Privacy Policy" },
  { href: ROUTES.disclaimer, label: "Disclaimer" },
  { href: ROUTES.terms, label: "Terms" },
] as const;
