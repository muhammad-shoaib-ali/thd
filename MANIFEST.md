# MANIFEST — TechHowDaily

Generated from the approved mockup `techhowdaily.html`. Next 16.3.5 · React
19.3.0 · TypeScript 5.9.3 · headless WordPress via WPGraphQL.

## The frozen region set (17.1.8)

Declared once, frozen at mockup approval. Adding, renaming or removing one is
a spec revision under 12.10.1, never a local edit.

| # | Region | What it is | Persistent | Owner folder |
|---|--------|-----------|-----------|--------------|
| 1 | masthead | logo, six section links, search, CTA | yes | `features/masthead` |
| 2 | hero | one feature + three side items | homepage | `features/hero-feature` |
| 3 | trend ticker | ten numbered items, marquee, most-viewed | yes | `features/trend-ticker` |
| 4 | category grid | six sections with live counts | homepage | `features/category-grid` |
| 5 | latest grid | six cards; reused by section and search | per-page | `features/latest-grid` |
| 6 | newsletter panel | the only conversion on the site | yes | `features/newsletter-panel` |
| 7 | footer | brand, Topics, Site, Legal, bottom bar | yes | `features/site-footer` |

Shared, not regions: `features/section-head` (the `.shead` row),
`features/post-body` (the article template), `features/static-page`.

Persistent regions live in `app/(site)/layout.tsx` and are inherited by every
route by construction (24.9.3). Legal and static pages use `app/(legal)/layout.tsx`,
which keeps the masthead and footer but drops the ticker and the newsletter,
because 17.1 requires those pages plain and conversion-free.

## Routes

| Path | Source |
|------|--------|
| `/` | homepage |
| `/{ai-tools,how-to,apps,software,fixes,reviews}/` | section archive |
| `/{post-slug}/` | a guide |
| `/search/?q=` | search, noindexed |
| `/about/` `/how-we-test/` `/contact/` `/write-for-us/` | WP Pages |
| `/privacy/` `/terms/` `/disclaimer/` `/affiliate-disclosure/` `/corrections/` | WP Pages |
| `/sitemap.xml` `/robots.txt` | generated |
| `POST /api/revalidate` `POST /api/subscribe` | endpoints |

Sections and posts share one dynamic segment, because Next permits only one
per path level. `app/(site)/[slug]/page.tsx` resolves the six section slugs
first and treats everything else as a post slug, which matches WordPress's
`/%postname%/` permalinks.

## Verified, not asserted

- `tsc --noEmit` clean · `next build` clean · 23 routes generated
- 27 unique internal links across four page types — 0 broken
- 28 sitemap URLs — 0 broken
- 10.5 legal set reachable from a post page: About, Contact, Privacy,
  Disclaimer, Terms
- render gate at 390 / 768 / 1024 / 1280 / 1440 — 0 horizontal overflow
- element counts match the mockup: 6 cards, 6 section tiles, 3 hero minis, 20 SVG

## Values that are NOT from the mockup

Everything else in `design/` is a verbatim slice of the mockup's own CSS.
These four are additions, and are marked as such in the files:

1. `--amber` `#FBBF24` (Software) and `--rose` `#FB7185` (Reviews) with chips
   `.c-sw` and `.c-rev`. The mockup defined four chip colours for six sections.
2. `/disclaimer/` added to the Legal group. 10.5 requires it on every page and
   the mockup had four of the five.
3. Masthead nav collapse moved from 1000px to 1080px. At exactly 1024 the
   mockup's own header overflows by 8px.
4. `.hero{position:relative;overflow:hidden}` and `.hgrid{position:relative}`
   moved from inline styles on the elements into the stylesheet.

## Forced constraint (24.11)

**Every path in this repository resolves from `src/lib/wp/taxonomy.ts`.** No
component, no query, no sitemap entry and no JSON-LD object may contain a
literal URL path. The mockup shipped with `href="#"` on 37 of its 40 links, so
the URL structure is this repo's invention and must stay in one file — change
`ROUTES` and the nav, footer, sitemap, schema, canonicals and archives all
follow with no further edits. A hardcoded path anywhere else is a G1.
