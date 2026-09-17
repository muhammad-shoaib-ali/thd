import type { Metadata } from "next";
import { BRAND } from "@/content/brand";
import type { PostFull } from "@/lib/wp/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://techhowdaily.com").replace(/\/$/, "");
export const abs = (path: string): string => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND.name} — ${BRAND.tagline}`, template: `%s — ${BRAND.name}` },
  description: BRAND.description,
  openGraph: { type: "website", siteName: BRAND.name, url: SITE_URL, description: BRAND.description },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export function postMetadata(post: PostFull): Metadata {
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: post.href },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: abs(post.href),
      publishedTime: post.dateISO,
      modifiedTime: post.modifiedISO,
      images: post.cover.url ? [{ url: post.cover.url }] : undefined,
    },
  };
}
