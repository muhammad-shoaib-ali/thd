/**
 * REGION 2 — hero. Homepage only, per the reasoning in TrendTicker.
 * One .feat plus three .mini, newest first, exactly as the mockup.
 */
import Link from "next/link";
import { getHeroPosts } from "@/lib/wp/queries";
import { PostCover } from "@/lib/art/PostCover";
import { UI } from "@/content/brand";
import "./hero-feature.css";

export async function HeroFeature() {
  const { feature, side } = await getHeroPosts();

  // Designed empty state (20.2): the region collapses rather than shipping
  // an empty frame on a site with nothing published yet.
  if (!feature) {
    return (
      <section className="hero">
        <div className="w" style={{ padding: "40px 0" }}>
          <p className="eyebrow">{UI.latestEyebrow}</p>
          <h1 style={{ marginTop: 10 }}>{UI.emptyLatest}</h1>
        </div>
      </section>
    );
  }

  return (
    <section className="hero" aria-labelledby="lead">
      <div className="aura" aria-hidden="true" />
      <div className="aura2" aria-hidden="true" />
      <div className="w hgrid">
        <Link className="feat uf" href={feature.href}>
          <div className="art">
            <PostCover post={feature} priority motion sizes="(max-width:980px) 100vw, 62vw" />
          </div>
          <div className="body">
            <span className={`chip ${feature.category.chip}`}>{feature.category.label}</span>
            <h1 id="lead" style={{ marginTop: 14 }}>{feature.title}</h1>
            <p>{feature.excerpt}</p>
            <div className="meta">
              <span className="av" aria-hidden="true" />
              <span>{feature.dateLabel}</span>
              <span className="dot" aria-hidden="true" />
              <span>{feature.readMinutes} {UI.readSuffix} read</span>
            </div>
          </div>
        </Link>

        <div className="side">
          {side.map((p) => (
            <Link className="mini uf" href={p.href} key={p.id}>
              <div className="thumb">
                <PostCover post={p} variant="thumb" />
              </div>
              <div>
                <span className={`chip ${p.category.chip}`}>{p.category.label}</span>
                <h3 style={{ marginTop: 8 }}>{p.title}</h3>
                <p className="m">{p.readMinutes} {UI.readSuffix} read</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
