/**
 * REGION 7 — footer. Persistent. Three groups as in the mockup, with one
 * addition: Disclaimer. 10.5 requires About, Contact, Privacy Policy,
 * Disclaimer and Terms reachable from every page; the mockup had four of
 * the five, so Disclaimer joins the Legal group.
 */
import Link from "next/link";
import { CATEGORIES, ROUTES } from "@/lib/wp/taxonomy";
import { BRAND, FOOTER_GROUPS } from "@/content/brand";
import { Wordmark } from "@/design/logos/Wordmark";
import "./site-footer.css";

const SITE_LINKS = [
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.howWeTest, label: "How we test" },
  { href: ROUTES.contact, label: "Contact" },
  { href: ROUTES.writeForUs, label: "Write for us" },
] as const;

const LEGAL_LINKS = [
  { href: ROUTES.privacy, label: "Privacy" },
  { href: ROUTES.terms, label: "Terms" },
  { href: ROUTES.disclaimer, label: "Disclaimer" },
  { href: ROUTES.affiliate, label: "Affiliate disclosure" },
  { href: ROUTES.corrections, label: "Corrections" },
] as const;

export function SiteFooter() {
  return (
    <footer>
      <div className="w">
        <div className="fg">
          <div>
            <Link className="logo" href={ROUTES.home} aria-label={BRAND.name}>
              <Wordmark />
            </Link>
            <p style={{ color: "var(--mute)", maxWidth: "34ch", margin: "12px 0 0", fontSize: "14.5px" }}>
              {BRAND.footerBlurb}
            </p>
          </div>

          <div>
            <h4>{FOOTER_GROUPS.topics}</h4>
            {CATEGORIES.map((c) => (
              <Link key={c.slug} href={ROUTES.category(c.slug)}>{c.label}</Link>
            ))}
          </div>

          <div>
            <h4>{FOOTER_GROUPS.site}</h4>
            {SITE_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </div>

          <div>
            <h4>{FOOTER_GROUPS.legal}</h4>
            {LEGAL_LINKS.map((l) => <Link key={l.href} href={l.href}>{l.label}</Link>)}
          </div>
        </div>

        <div className="fbot">
          <span>{BRAND.copyright(new Date().getUTCFullYear())}</span>
          <span>{BRAND.colophon}</span>
        </div>
      </div>
    </footer>
  );
}
