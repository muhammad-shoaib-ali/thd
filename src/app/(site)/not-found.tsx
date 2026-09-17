/**
 * 404, designed rather than blank (20.2). It keeps the site's chrome and
 * offers the six sections, because a dead link is usually a renamed guide.
 */
import Link from "next/link";
import { CATEGORIES, ROUTES } from "@/lib/wp/taxonomy";
import { UI } from "@/content/brand";

export default function NotFound() {
  return (
    <section className="sec">
      <div className="w">
        <p className="eyebrow">404</p>
        <h1 style={{ marginTop: 10 }}>{UI.notFoundHeading}</h1>
        <p style={{ color: "var(--mute)", maxWidth: "52ch" }}>{UI.notFoundDek}</p>
        <div className="cats" style={{ marginTop: 26 }}>
          {CATEGORIES.map((c) => (
            <Link className="cat uf in" href={ROUTES.category(c.slug)} key={c.slug}
                  style={{ borderColor: c.cardBorder }}>
              <h3>{c.label}</h3>
              <p>{c.dek}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
