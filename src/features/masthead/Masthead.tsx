/**
 * REGION 1 — masthead. Persistent (17.1.2): declared once here and
 * inherited by every route through app/(site)/layout.tsx, so editing menu
 * labels in WordPress can never move it (24.9.3).
 *
 * Two departures from the mockup, both forced by production:
 *  · nav links were href="#"; they now resolve from lib/wp/taxonomy.ts
 *  · .srch was a decorative div; it is now a real link to /search/
 */
import Link from "next/link";
import { CATEGORIES, ROUTES } from "@/lib/wp/taxonomy";
import { BRAND, UI } from "@/content/brand";
import { Wordmark } from "@/design/logos/Wordmark";
import "./masthead.css";

export function Masthead({ current }: { current?: string }) {
  return (
    <header>
      <div className="w hrow">
        <Link className="logo" href={ROUTES.home} aria-label={BRAND.name}>
          <Wordmark />
        </Link>

        <nav className="main" aria-label="Sections">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={ROUTES.category(c.slug)}
              className={current === c.slug ? "on" : undefined}
              aria-current={current === c.slug ? "page" : undefined}
            >
              {c.label}
            </Link>
          ))}
        </nav>

        <div className="hact">
          <Link className="srch" href={ROUTES.search}>
            <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true" fill="none"
                 stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20 L16.2 16.2" />
            </svg>
            <span>{UI.searchPlaceholder}…</span>
          </Link>
          <Link className="cta" href="#newsletter">{UI.cta}</Link>
        </div>
      </div>
    </header>
  );
}
