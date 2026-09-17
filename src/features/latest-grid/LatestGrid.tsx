/**
 * REGION 5 — latest grid. Owns its own posts query (24.13.1 law 3); no
 * other region knows it exists. Reused by the category route with a
 * different heading and a different feed.
 */
import Link from "next/link";
import { getLatestPosts } from "@/lib/wp/queries";
import { ROUTES } from "@/lib/wp/taxonomy";
import { PostCover } from "@/lib/art/PostCover";
import { SectionHead } from "@/features/section-head";
import { UI } from "@/content/brand";
import type { Post } from "@/lib/wp/types";
import "./latest-grid.css";

export interface LatestGridProps {
  /** Supplied by the category route; omitted on the homepage. */
  posts?: Post[];
  eyebrow?: string;
  heading?: string;
  dek?: string;
  more?: { href: string; label: string };
  count?: number;
  emptyMessage?: string;
}

export async function LatestGrid({
  posts, eyebrow = UI.latestEyebrow, heading = UI.latestHeading, dek,
  more = { href: ROUTES.search, label: UI.more }, count = 6, emptyMessage = UI.emptyLatest,
}: LatestGridProps) {
  const items = posts ?? (await getLatestPosts(count));

  return (
    <section className="sec" aria-labelledby="latest">
      <div className="w">
        <SectionHead headingId="latest" eyebrow={eyebrow} heading={heading} dek={dek} more={more} />
        {items.length === 0 ? (
          <p style={{ color: "var(--mute)", margin: 0 }}>{emptyMessage}</p>
        ) : (
          <div className="grid3">
            {items.map((p) => (
              <Link className="card uf" href={p.href} key={p.id}>
                <div className="art">
                  <PostCover post={p} />
                </div>
                <div className="body">
                  <span className={`chip ${p.category.chip}`}>{p.category.label}</span>
                  <h3>{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <div className="m">
                    <span>{p.dateLabel}</span>
                    <span className="dot" aria-hidden="true" />
                    <span>{p.readMinutes} {UI.readSuffix}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
