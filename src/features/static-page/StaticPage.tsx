/**
 * The template for About, How we test, Contact, Privacy, Terms, Disclaimer,
 * Affiliate disclosure and Corrections. Content comes from a WordPress
 * Page of the same slug. Before that Page exists the route still resolves
 * and says plainly that it is unwritten, rather than 404ing a link the
 * footer shows on every page — which for the five 10.5 pages would be a
 * compliance failure, not just a dead link.
 */
import { getPage } from "@/lib/wp/queries";

export async function StaticPage({
  slug, fallbackTitle, fallbackNote,
}: { slug: string; fallbackTitle: string; fallbackNote?: string }) {
  const page = await getPage(slug);

  return (
    <article className="sec">
      <div className="w">
        <h1 style={{ fontFamily: "var(--d)", fontSize: "clamp(28px,4vw,42px)", letterSpacing: "-.02em", margin: 0 }}>
          {page?.title ?? fallbackTitle}
        </h1>
        {page ? (
          <div className="prose" style={{ marginTop: 26 }}
               dangerouslySetInnerHTML={{ __html: page.contentHtml }} />
        ) : (
          <div className="prose" style={{ marginTop: 26 }}>
            <p style={{ color: "var(--mute)" }}>
              {fallbackNote ??
                `This page is served from a WordPress Page with the slug “${slug}”. Create that Page and its content appears here — no code change needed.`}
            </p>
          </div>
        )}
        {page ? (
          <p style={{ color: "var(--dim)", fontSize: 13.5, marginTop: 34 }}>
            Last updated{" "}
            <time dateTime={page.modifiedISO}>
              {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
                .format(new Date(page.modifiedISO))}
            </time>
          </p>
        ) : null}
      </div>
    </article>
  );
}
