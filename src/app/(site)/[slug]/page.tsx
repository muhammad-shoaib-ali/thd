/**
 * The one dynamic route at the site root, resolving BOTH shapes:
 *
 *   /ai-tools/                     -> one of the six sections  (archive)
 *   /local-ai-model-windows/       -> a guide                  (post)
 *
 * Next.js permits only one dynamic segment per path level, so a separate
 * [category] route beside [slug] is not possible. This resolves the six
 * known section slugs first and treats everything else as a post slug,
 * which also matches WordPress's flat permalink structure (/%postname%/).
 *
 * If you would rather have /category/ai-tools/, change ROUTES.category in
 * lib/wp/taxonomy.ts and split this file — the masthead, footer, sitemap
 * and schema all read their paths from there and will follow with no
 * further edits.
 */
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CATEGORIES, ROUTES, category } from "@/lib/wp/taxonomy";
import { getPost, getPostsByCategory } from "@/lib/wp/queries";
import { LatestGrid } from "@/features/latest-grid";
import { PostBody } from "@/features/post-body";
import { articleSchema, breadcrumbs, categoryList } from "@/lib/seo/schema";
import { JsonLd } from "@/lib/seo/JsonLd";
import { postMetadata } from "@/lib/seo/metadata";
import { UI } from "@/content/brand";

export const revalidate = 300;

/** Only the six sections are pre-rendered; posts are generated on demand. */
export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
): Promise<Metadata> {
  const { slug } = await params;

  const def = category(slug);
  if (def) {
    return {
      title: def.label,
      description: def.dek,
      alternates: { canonical: ROUTES.category(def.slug) },
    };
  }

  const post = await getPost(slug);
  return post ? postMetadata(post) : {};
}

export default async function SlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // ── a section archive ───────────────────────────────────────────────
  const def = category(slug);
  if (def) {
    const posts = await getPostsByCategory(def.slug, 12);
    return (
      <>
        <LatestGrid
          posts={posts}
          eyebrow={def.label}
          heading={def.dek}
          more={{ href: ROUTES.home, label: "All sections →" }}
          emptyMessage={UI.emptyCategory}
        />
        <JsonLd data={categoryList(def.slug, posts)} />
        <JsonLd data={breadcrumbs([
          { name: "Home", href: ROUTES.home },
          { name: def.label, href: ROUTES.category(def.slug) },
        ])} />
      </>
    );
  }

  // ── a guide ─────────────────────────────────────────────────────────
  const post = await getPost(slug);
  if (!post) notFound();

  const related = (await getPostsByCategory(post.category.slug, 4))
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <>
      <PostBody post={post} />
      {related.length > 0 ? (
        <LatestGrid
          posts={related}
          eyebrow={post.category.label}
          heading="More from this section"
          more={{ href: ROUTES.category(post.category.slug), label: UI.more }}
        />
      ) : null}
      <JsonLd data={articleSchema(post)} />
      <JsonLd data={breadcrumbs([
        { name: "Home", href: ROUTES.home },
        { name: post.category.label, href: ROUTES.category(post.category.slug) },
        { name: post.title, href: post.href },
      ])} />
    </>
  );
}
