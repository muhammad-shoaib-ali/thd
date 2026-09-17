/** JSON-LD. Every value is real: nothing here is invented for the markup. */
import { BRAND } from "@/content/brand";
import { CATEGORIES, ROUTES } from "@/lib/wp/taxonomy";
import type { Post, PostFull } from "@/lib/wp/types";
import { SITE_URL, abs } from "./metadata";

export const organisation = () => ({
  "@type": "Organization",
  "@id": `${SITE_URL}/#org`,
  name: BRAND.name,
  url: SITE_URL,
  description: BRAND.description,
});

export const website = () => ({
  "@context": "https://schema.org",
  "@graph": [
    organisation(),
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#site`,
      url: SITE_URL,
      name: BRAND.name,
      publisher: { "@id": `${SITE_URL}/#org` },
      potentialAction: {
        "@type": "SearchAction",
        target: { "@type": "EntryPoint", urlTemplate: `${abs(ROUTES.search)}?q={q}` },
        "query-input": "required name=q",
      },
    },
  ],
});

export const articleSchema = (post: PostFull) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.excerpt,
  datePublished: post.dateISO,
  dateModified: post.modifiedISO,
  mainEntityOfPage: { "@type": "WebPage", "@id": abs(post.href) },
  author: { "@type": "Person", name: post.author.name },
  publisher: { "@id": `${SITE_URL}/#org` },
  ...(post.cover.url ? { image: [post.cover.url] } : {}),
  articleSection: post.category.label,
});

export const breadcrumbs = (trail: { name: string; href: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({
    "@type": "ListItem", position: i + 1, name: t.name, item: abs(t.href),
  })),
});

export const categoryList = (slug: string, posts: Post[]) => {
  const def = CATEGORIES.find((c) => c.slug === slug);
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: def?.label ?? slug,
    description: def?.dek,
    url: abs(ROUTES.category(slug)),
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.slice(0, 20).map((p, i) => ({
        "@type": "ListItem", position: i + 1, url: abs(p.href), name: p.title,
      })),
    },
  };
};
