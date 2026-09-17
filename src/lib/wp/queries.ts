/**
 * Every query the site makes, and the only module that knows WPGraphQL's
 * shape. Each function pairs a live query with the preview fallback, so a
 * missing or broken WordPress degrades to a designed state rather than a
 * 500 (20.2).
 */
import { VIEWS_FIELD, wpQuery, withFallback } from "./client";
import { CATEGORIES, categoryByWp, type CategoryDef } from "./taxonomy";
import { dateLabel, makeCover, plain, postHref, readMinutes, seedFrom, sortByViews } from "./format";
import {
  previewCategoryCounts, previewPost, previewPosts, previewPostsByCategory,
} from "./preview";
import type { CategoryWithCount, Post, PostFull } from "./types";

/* ---------------------------------------------------------------- shapes */

interface RawImage {
  sourceUrl?: string | null;
  altText?: string | null;
  mediaDetails?: { width?: number | null; height?: number | null } | null;
}
interface RawPost {
  id: string; slug: string; title: string; excerpt?: string | null;
  content?: string | null; date: string; modified?: string | null;
  featuredImage?: { node?: RawImage | null } | null;
  categories?: { nodes?: { slug: string }[] | null } | null;
  author?: { node?: { name?: string | null; slug?: string | null; avatar?: { url?: string | null } | null } | null } | null;
  [key: string]: unknown;
}

/** Only requested when WP_VIEWS_FIELD names a field the schema exposes. */
const viewsSelection = (): string => (VIEWS_FIELD ? `\n    ${VIEWS_FIELD}` : "");

const POST_FIELDS = `
  id
  slug
  title
  excerpt
  date
  featuredImage { node { sourceUrl altText mediaDetails { width height } } }
  categories { nodes { slug } }`;

function mapPost(raw: RawPost): Post | null {
  const wpSlug = raw.categories?.nodes?.[0]?.slug;
  const def: CategoryDef | undefined = wpSlug ? categoryByWp(wpSlug) : undefined;
  // A post in a category the site does not route is dropped rather than
  // rendered with a broken chip and a dead link.
  if (!def) return null;

  const rawViews = VIEWS_FIELD ? raw[VIEWS_FIELD] : undefined;
  const views = typeof rawViews === "number" ? rawViews
    : typeof rawViews === "string" && rawViews.trim() !== "" ? Number(rawViews)
    : null;

  return {
    id: raw.id,
    slug: raw.slug,
    href: postHref(raw.slug),
    title: plain(raw.title, 200),
    excerpt: plain(raw.excerpt ?? "", 168),
    dateISO: new Date(raw.date).toISOString(),
    dateLabel: dateLabel(raw.date),
    readMinutes: raw.content ? readMinutes(raw.content) : 6,
    category: def,
    cover: makeCover(raw.slug, plain(raw.title, 200), raw.featuredImage?.node),
    views: Number.isFinite(views as number) ? (views as number) : null,
  };
}

/* ----------------------------------------------------------------- reads */

export async function getLatestPosts(first = 6): Promise<Post[]> {
  return withFallback("latest", async () => {
    const data = await wpQuery<{ posts: { nodes: RawPost[] } }>(
      `query Latest($first:Int!){ posts(first:$first, where:{status:PUBLISH, orderby:{field:DATE, order:DESC}}){ nodes { ${POST_FIELDS} } } }`,
      { first },
      { tags: ["wp", "wp:posts"] },
    );
    return data.posts.nodes.map(mapPost).filter((p): p is Post => p !== null);
  }, () => previewPosts().slice(0, first));
}

/** Hero: one feature plus three side items, newest first. */
export async function getHeroPosts(): Promise<{ feature: Post | null; side: Post[] }> {
  const posts = await getLatestPosts(4);
  return { feature: posts[0] ?? null, side: posts.slice(1, 4) };
}

/**
 * Trend ticker: most-viewed. WordPress has no native view counter, so this
 * needs a plugin that exposes one through WPGraphQL (Post Views Counter or
 * WP-PostViews) named in WP_VIEWS_FIELD. With no field configured, or with
 * no view data yet, it falls back to most-recent — which is correct on a
 * new site and means the region never renders empty. See README.
 */
export async function getTrendingPosts(count = 10): Promise<{ posts: Post[]; byViews: boolean }> {
  const pool = await getLatestPosts(40);
  const haveViews = VIEWS_FIELD !== "" && pool.some((p) => p.views !== null);
  const ordered = haveViews ? [...pool].sort(sortByViews) : pool;
  return { posts: ordered.slice(0, count), byViews: haveViews };
}

export async function getPostsByCategory(
  slug: string, first = 12,
): Promise<Post[]> {
  const def = CATEGORIES.find((c) => c.slug === slug);
  if (!def) return [];
  return withFallback(`category:${slug}`, async () => {
    const data = await wpQuery<{ posts: { nodes: RawPost[] } }>(
      `query ByCat($cat:String!,$first:Int!){ posts(first:$first, where:{status:PUBLISH, categoryName:$cat, orderby:{field:DATE, order:DESC}}){ nodes { ${POST_FIELDS} } } }`,
      { cat: def.wpSlug, first },
      { tags: ["wp", `wp:cat:${slug}`] },
    );
    return data.posts.nodes.map(mapPost).filter((p): p is Post => p !== null);
  }, () => previewPostsByCategory(slug).slice(0, first));
}

export async function getCategoryCounts(): Promise<CategoryWithCount[]> {
  return withFallback("counts", async () => {
    const data = await wpQuery<{ categories: { nodes: { slug: string; count: number | null }[] } }>(
      `query Counts{ categories(first:50){ nodes { slug count } } }`,
      {}, { tags: ["wp", "wp:cats"] },
    );
    const found = new Map(data.categories.nodes.map((n) => [n.slug, n.count ?? 0]));
    return CATEGORIES.map((def) => ({ def, count: found.get(def.wpSlug) ?? 0 }));
  }, previewCategoryCounts);
}

export async function getPost(slug: string): Promise<PostFull | null> {
  return withFallback(`post:${slug}`, async () => {
    const data = await wpQuery<{ post: RawPost | null }>(
      `query One($slug:ID!){ post(id:$slug, idType:SLUG){ ${POST_FIELDS} content modified author { node { name slug avatar { url } } } ${viewsSelection()} } }`,
      { slug }, { tags: ["wp", `wp:post:${slug}`] },
    );
    const raw = data.post;
    if (!raw) return null;
    const base = mapPost(raw);
    if (!base) return null;
    return {
      ...base,
      contentHtml: raw.content ?? "",
      modifiedISO: new Date(raw.modified ?? raw.date).toISOString(),
      author: {
        name: raw.author?.node?.name ?? "The TechHowDaily desk",
        slug: raw.author?.node?.slug ?? "desk",
        avatar: raw.author?.node?.avatar?.url ?? null,
      },
    };
  }, () => previewPost(slug));
}

export async function getAllPostSlugs(): Promise<{ slug: string; dateISO: string }[]> {
  return withFallback("slugs", async () => {
    const data = await wpQuery<{ posts: { nodes: { slug: string; modified?: string | null; date: string }[] } }>(
      `query Slugs{ posts(first:1000, where:{status:PUBLISH}){ nodes { slug date modified } } }`,
      {}, { tags: ["wp", "wp:posts"] },
    );
    return data.posts.nodes.map((n) => ({
      slug: n.slug,
      dateISO: new Date(n.modified ?? n.date).toISOString(),
    }));
  }, () => previewPosts().map((p) => ({ slug: p.slug, dateISO: p.dateISO })));
}

export async function searchPosts(q: string, first = 20): Promise<Post[]> {
  const term = q.trim();
  if (!term) return [];
  return withFallback("search", async () => {
    const data = await wpQuery<{ posts: { nodes: RawPost[] } }>(
      `query Search($q:String!,$first:Int!){ posts(first:$first, where:{status:PUBLISH, search:$q}){ nodes { ${POST_FIELDS} } } }`,
      { q: term, first }, { tags: ["wp", "wp:search"], revalidate: 60 },
    );
    return data.posts.nodes.map(mapPost).filter((p): p is Post => p !== null);
  }, () => {
    const needle = term.toLowerCase();
    return previewPosts().filter(
      (p) => p.title.toLowerCase().includes(needle) || p.excerpt.toLowerCase().includes(needle),
    ).slice(0, first);
  });
}

/** Static pages (About, Privacy, Terms…) come from WordPress Pages. */
export interface WpPage { title: string; contentHtml: string; modifiedISO: string }

export async function getPage(slug: string): Promise<WpPage | null> {
  return withFallback(`page:${slug}`, async () => {
    const data = await wpQuery<{ page: { title: string; content?: string | null; modified?: string | null; date: string } | null }>(
      `query Pg($slug:ID!){ page(id:$slug, idType:URI){ title content modified date } }`,
      { slug }, { tags: ["wp", `wp:page:${slug}`], revalidate: 3600 },
    );
    if (!data.page) return null;
    return {
      title: plain(data.page.title, 120),
      contentHtml: data.page.content ?? "",
      modifiedISO: new Date(data.page.modified ?? data.page.date).toISOString(),
    };
  }, () => null);
}

export { seedFrom };
