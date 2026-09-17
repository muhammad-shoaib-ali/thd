import type { NextConfig } from "next";

/** Hostname of the WordPress install, derived from the GraphQL endpoint so
 *  featured images are allowed through next/image without a second env var. */
function wpHost(): string | null {
  const raw = process.env.WORDPRESS_GRAPHQL_ENDPOINT;
  if (!raw) return null;
  try { return new URL(raw).hostname; } catch { return null; }
}

const host = wpHost();

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  /**
   * WordPress's default permalink structure ends in a slash, and every
   * canonical, sitemap entry and JSON-LD url in src/lib is written with
   * one. Without this, all of those 308-redirect to the slashless form:
   * an extra hop on every internal link and a canonical pointing at a
   * redirect. Keeping slashes also preserves existing URLs if this
   * front-end replaces a WordPress theme on the same domain.
   */
  trailingSlash: true,
  images: {
    remotePatterns: host
      ? [{ protocol: "https", hostname: host }, { protocol: "https", hostname: "secure.gravatar.com" }]
      : [],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    }];
  },
};

export default nextConfig;
