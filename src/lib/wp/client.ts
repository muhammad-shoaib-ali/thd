/**
 * The only place in the repo that talks to WordPress.
 *
 * While WORDPRESS_GRAPHQL_ENDPOINT is unset the whole site renders from
 * preview.ts, so `next build` and `next dev` are green before WordPress
 * exists (D11). Setting the env var switches every query over; no component
 * changes and no import changes.
 */
export const WP_ENDPOINT = process.env.WORDPRESS_GRAPHQL_ENDPOINT ?? "";
export const WP_LIVE = WP_ENDPOINT.length > 0;

/** Field name exposed by the views plugin, if any. See README. */
export const VIEWS_FIELD = process.env.WP_VIEWS_FIELD ?? "";

export class WpError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
    this.name = "WpError";
  }
}

interface GqlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

/**
 * One fetch, revalidated on a tag so POST /api/revalidate can purge a
 * single post without rebuilding the site.
 */
export async function wpQuery<T>(
  query: string,
  variables: Record<string, unknown> = {},
  opts: { tags?: string[]; revalidate?: number } = {},
): Promise<T> {
  if (!WP_LIVE) throw new WpError("WordPress endpoint not configured");

  const res = await fetch(WP_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { tags: opts.tags ?? ["wp"], revalidate: opts.revalidate ?? 300 },
  });

  if (!res.ok) throw new WpError(`WPGraphQL responded ${res.status}`, res.status);

  const json = (await res.json()) as GqlResponse<T>;
  if (json.errors?.length) throw new WpError(json.errors.map((e) => e.message).join("; "));
  if (!json.data) throw new WpError("WPGraphQL returned no data");
  return json.data;
}

/**
 * Every data function goes through this. If WordPress is absent, slow or
 * broken, the region renders its designed empty state instead of throwing
 * a 500 at the reader — and the failure is logged once, not swallowed.
 */
export async function withFallback<T>(
  label: string,
  live: () => Promise<T>,
  fallback: () => T | Promise<T>,
): Promise<T> {
  if (!WP_LIVE) return fallback();
  try {
    return await live();
  } catch (err) {
    console.error(`[wp:${label}]`, err instanceof Error ? err.message : err);
    return fallback();
  }
}
