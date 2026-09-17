/**
 * REGION 3 — trend ticker. PERSISTENT, and site-wide except on legal pages.
 *
 * Reasoning, since this was the one you left to me: the hero is a curated
 * editorial slot and belongs to the homepage only — on a post page it would
 * compete with the article for the first screen. The ticker is the opposite:
 * one line tall, no images, and its whole job is moving readers between
 * guides, which is worth more on an article page than on the homepage. So
 * hero is homepage, ticker is layout. Legal pages get neither, because 17.1
 * requires them plain and quiet.
 *
 * Source: most-viewed, per your decision. See queries.getTrendingPosts for
 * what happens before a views plugin is installed.
 */
import Link from "next/link";
import { getTrendingPosts } from "@/lib/wp/queries";
import { UI } from "@/content/brand";
import "./trend-ticker.css";

export async function TrendTicker() {
  const { posts } = await getTrendingPosts(10);
  if (posts.length === 0) return null;

  // Duplicated once so the marquee wraps seamlessly; the copy is hidden
  // from assistive tech so the list is not announced twice.
  const track = [...posts, ...posts];

  return (
    <div className="trend" aria-label={UI.trendingLabel}>
      <div className="trow">
        {track.map((p, i) => (
          <span className="titem" key={`${p.id}-${i}`} aria-hidden={i >= posts.length}>
            <b>{String((i % posts.length) + 1).padStart(2, "0")}</b>{" "}
            <Link href={p.href} tabIndex={i >= posts.length ? -1 : undefined}>{p.title}</Link>
          </span>
        ))}
      </div>
    </div>
  );
}
