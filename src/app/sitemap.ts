import type { MetadataRoute } from "next";
import { CATEGORIES, ROUTES } from "@/lib/wp/taxonomy";
import { getAllPostSlugs } from "@/lib/wp/queries";
import { abs } from "@/lib/seo/metadata";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getAllPostSlugs();
  const now = new Date();

  return [
    { url: abs(ROUTES.home), lastModified: now, changeFrequency: "daily", priority: 1 },
    ...CATEGORIES.map((c) => ({
      url: abs(ROUTES.category(c.slug)), lastModified: now,
      changeFrequency: "daily" as const, priority: 0.8,
    })),
    ...posts.map((p) => ({
      url: abs(`/${p.slug}/`), lastModified: new Date(p.dateISO),
      changeFrequency: "monthly" as const, priority: 0.7,
    })),
    ...[ROUTES.about, ROUTES.howWeTest, ROUTES.contact, ROUTES.writeForUs,
        ROUTES.privacy, ROUTES.terms, ROUTES.disclaimer, ROUTES.affiliate, ROUTES.corrections]
      .map((href) => ({
        url: abs(href), lastModified: now,
        changeFrequency: "yearly" as const, priority: 0.3,
      })),
  ];
}
