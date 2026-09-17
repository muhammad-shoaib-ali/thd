import type { CategoryDef } from "./taxonomy";
import type { Cover, Post } from "./types";

/** "27 Aug" — the mockup's own date format. */
export function dateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(d);
}

/** Strip WP's excerpt markup without pulling in a sanitiser. */
export function plain(html: string, max = 168): string {
  const text = html.replace(/<[^>]*>/g, "").replace(/&hellip;/g, "…")
    .replace(/&#8217;/g, "’").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** 225 wpm, rounded up, floor of 1. Matches the mockup's "11 min" style. */
export function readMinutes(html: string): number {
  const words = html.replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 225));
}

/** Stable per-slug seed, so a post's generated cover never changes. */
export function seedFrom(slug: string): number {
  let h = 2166136261;
  for (let i = 0; i < slug.length; i++) {
    h ^= slug.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
}

export function makeCover(
  slug: string,
  title: string,
  img: { sourceUrl?: string | null; altText?: string | null; mediaDetails?: { width?: number | null; height?: number | null } | null } | null | undefined,
): Cover {
  return {
    url: img?.sourceUrl ?? null,
    alt: img?.altText?.trim() || title,
    width: img?.mediaDetails?.width ?? null,
    height: img?.mediaDetails?.height ?? null,
    seed: seedFrom(slug),
  };
}

export function postHref(slug: string): string {
  return `/${slug}/`;
}

export function sortByViews(a: Post, b: Post): number {
  const av = a.views ?? -1, bv = b.views ?? -1;
  if (av !== bv) return bv - av;
  return b.dateISO.localeCompare(a.dateISO);
}

export function chipFor(def: CategoryDef): string {
  return def.chip;
}
