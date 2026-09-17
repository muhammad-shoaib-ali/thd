/**
 * The preview data layer. The repo runs entirely on this until
 * WORDPRESS_GRAPHQL_ENDPOINT is set, which is what lets `next build` pass
 * before WordPress exists (D11) and what makes every region's four states
 * (20.2) inspectable without a CMS.
 *
 * Copy is the approved mockup's own, so the rendered page matches the
 * mockup one-to-one and any divergence is a real regression rather than
 * placeholder noise. No featured images here on purpose: every card
 * exercises the generated-SVG fallback path until real images arrive.
 */
import { CATEGORIES, category } from "./taxonomy";
import { dateLabel, postHref, seedFrom } from "./format";
import type { CategoryWithCount, Post, PostFull } from "./types";

interface Seed {
  slug: string; title: string; excerpt: string; cat: string;
  date: string; mins: number; views: number;
}

const SEEDS: Seed[] = [
  { slug: "ai-agents-40-tasks-11-agents", cat: "ai-tools", date: "2026-08-29", mins: 14, views: 41_208,
    title: "We ran the same 40 tasks through 11 “AI agents”. Four were actually useful.",
    excerpt: "Same brief, same files, same clock. Most of them stalled on step three — here is where each one broke and which four finished." },
  { slug: "local-ai-model-windows-15-minutes", cat: "how-to", date: "2026-08-28", mins: 9, views: 33_940,
    title: "Set up a local AI model on Windows in 15 minutes",
    excerpt: "One installer, one model file, no Python. Tested on a 2021 laptop with 16 GB of RAM." },
  { slug: "note-apps-training-on-your-notes", cat: "apps", date: "2026-08-28", mins: 7, views: 28_115,
    title: "The note apps that quietly train on what you write",
    excerpt: "We read eleven privacy policies so you do not have to. Three had an opt-out buried four screens deep." },
  { slug: "model-is-overloaded-what-it-means", cat: "fixes", date: "2026-08-27", mins: 5, views: 26_440,
    title: "“Model is overloaded” — what it means and the three fixes",
    excerpt: "It is almost never your code. Here is how to tell, and what to do while you wait." },
  { slug: "pdf-to-searchable-knowledge-base", cat: "how-to", date: "2026-08-27", mins: 11, views: 21_003,
    title: "Turn any PDF into a searchable knowledge base in one afternoon",
    excerpt: "Chunking, embeddings and the free stack that runs on a laptop. With the three things that break first." },
  { slug: "six-ai-note-takers-tested", cat: "ai-tools", date: "2026-08-26", mins: 10, views: 19_884,
    title: "Six AI note-takers tested on the same bad conference call",
    excerpt: "Crosstalk, a dropped line and two accents. Only two produced notes worth sending." },
  { slug: "api-bill-tripled-overnight", cat: "fixes", date: "2026-08-25", mins: 8, views: 18_220,
    title: "Your API bill tripled overnight. Here is how to find out why.",
    excerpt: "A retry loop, a cached prompt and a model swap you did not make. In that order of likelihood." },
  { slug: "free-image-tools-commercial-use", cat: "software", date: "2026-08-24", mins: 6, views: 17_610,
    title: "Free image tools you can actually use commercially",
    excerpt: "Licence terms read line by line, with the four that permit paid work and the two that changed last month." },
  { slug: "automate-weekly-report-no-code", cat: "software", date: "2026-08-22", mins: 12, views: 15_402,
    title: "Automate your weekly report without writing code",
    excerpt: "A spreadsheet, a scheduler and one webhook. Runs unattended, and tells you when it fails." },
  { slug: "30-days-ai-code-reviewer", cat: "reviews", date: "2026-08-21", mins: 13, views: 14_771,
    title: "30 days with an AI code reviewer: what it caught and what it missed",
    excerpt: "It found every unhandled promise and none of the three logic bugs that actually shipped." },
  { slug: "clipboard-manager-cloud-sync", cat: "fixes", date: "2026-08-20", mins: 4, views: 13_559,
    title: "Stop your clipboard manager syncing to the cloud",
    excerpt: "Two settings on macOS, one registry key on Windows, and why the default is what it is." },
  { slug: "self-hosted-password-manager", cat: "apps", date: "2026-08-19", mins: 9, views: 12_004,
    title: "Self-hosting a password manager: worth it, with caveats",
    excerpt: "Cheap, private, and entirely your problem at 2 a.m. The backup plan matters more than the install." },
];

function toPost(s: Seed): Post {
  const def = category(s.cat)!;
  return {
    id: s.slug,
    slug: s.slug,
    href: postHref(s.slug),
    title: s.title,
    excerpt: s.excerpt,
    dateISO: `${s.date}T09:00:00.000Z`,
    dateLabel: dateLabel(`${s.date}T09:00:00.000Z`),
    readMinutes: s.mins,
    category: def,
    cover: { url: null, alt: s.title, width: null, height: null, seed: seedFrom(s.slug) },
    views: s.views,
  };
}

export const previewPosts = (): Post[] => SEEDS.map(toPost);

export const previewPostsByCategory = (slug: string): Post[] =>
  previewPosts().filter((p) => p.category.slug === slug);

export function previewPost(slug: string): PostFull | null {
  const base = previewPosts().find((p) => p.slug === slug);
  if (!base) return null;
  return {
    ...base,
    modifiedISO: base.dateISO,
    author: { name: "The TechHowDaily desk", slug: "desk", avatar: null },
    contentHtml: `<p>${base.excerpt}</p><p>This body comes from the preview data layer. Set <code>WORDPRESS_GRAPHQL_ENDPOINT</code> and this becomes the post content from WordPress, with no change to any component.</p><h2>What we tested</h2><p>Preview copy, standing in for the real thing so every state of the post template can be inspected without a CMS.</p>`,
  };
}

/** Counts the category grid renders. Live builds count in WordPress. */
export const previewCategoryCounts = (): CategoryWithCount[] => {
  const posts = previewPosts();
  return CATEGORIES.map((def) => ({
    def,
    count: posts.filter((p) => p.category.slug === def.slug).length,
  }));
};
