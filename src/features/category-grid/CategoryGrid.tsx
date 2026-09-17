/**
 * REGION 4 — category grid. Six sections, counts from WordPress rather
 * than hardcoded, so "142 guides" is true on any given week.
 */
import Link from "next/link";
import { getCategoryCounts } from "@/lib/wp/queries";
import { ROUTES } from "@/lib/wp/taxonomy";
import { SectionHead } from "@/features/section-head";
import { UI } from "@/content/brand";
import "./category-grid.css";

export async function CategoryGrid() {
  const cats = await getCategoryCounts();

  return (
    <section className="sec" aria-labelledby="browse">
      <div className="w">
        <SectionHead
          headingId="browse"
          eyebrow={UI.browseEyebrow}
          heading={UI.browseHeading}
          dek={UI.browseDek}
          more={{ href: ROUTES.search, label: UI.allTopics }}
        />
        <div className="cats">
          {cats.map(({ def, count }) => (
            <Link
              className="cat uf"
              href={ROUTES.category(def.slug)}
              key={def.slug}
              style={{ borderColor: def.cardBorder }}
            >
              <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" fill="none"
                   stroke={def.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3.5" y="5.5" width="25" height="21" rx="4" />
                <path d="M9 13h9 M9 18h14" />
                <circle cx="23" cy="12.5" r="1.8" fill={def.accent} stroke="none" />
              </svg>
              <h3>{def.label}</h3>
              <p>{def.dek}</p>
              <span className="n">
                {count > 0 ? `${count} ${UI.guidesSuffix}` : "Coming soon"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
