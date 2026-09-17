/**
 * Search. The masthead's .srch was decorative in the mockup; this is the
 * page it now leads to. Server-rendered from ?q= so it works without JS,
 * and noindexed because a search results page should not be in the index.
 */
import type { Metadata } from "next";
import { searchPosts } from "@/lib/wp/queries";
import { LatestGrid } from "@/features/latest-grid";
import { ROUTES } from "@/lib/wp/taxonomy";
import { UI } from "@/content/brand";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage(
  { searchParams }: { searchParams: Promise<{ q?: string }> },
) {
  const { q = "" } = await searchParams;
  const term = q.trim();
  const results = term ? await searchPosts(term, 24) : [];

  return (
    <section className="sec">
      <div className="w">
        <p className="eyebrow">Search</p>
        <h1 style={{ fontFamily: "var(--d)", fontSize: "clamp(26px,3.6vw,38px)", letterSpacing: "-.02em", margin: "10px 0 20px" }}>
          {term ? `Guides matching “${term}”` : "Search the guides"}
        </h1>

        {/* No JS needed: a plain GET form. */}
        <form action={ROUTES.search} method="get" className="form" style={{ maxWidth: 520 }}>
          <label className="skip" htmlFor="q">Search guides</label>
          <input id="q" name="q" type="search" defaultValue={term} placeholder={UI.searchPlaceholder} />
          <button className="cta" type="submit" style={{ padding: "12px 22px" }}>Search</button>
        </form>
      </div>

      {term ? (
        <LatestGrid
          posts={results}
          eyebrow={`${results.length} result${results.length === 1 ? "" : "s"}`}
          heading={results.length ? "What we found" : UI.emptySearch}
          more={{ href: ROUTES.home, label: "All sections →" }}
          emptyMessage={UI.emptySearch}
        />
      ) : null}
    </section>
  );
}
