# TechHowDaily

A Next.js front end for the TechHowDaily design, running on headless
WordPress. Built from the approved mockup `techhowdaily.html`; the region set
is frozen and documented in `MANIFEST.md`.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev            # http://localhost:3000
```

**It runs with no WordPress.** While `WORDPRESS_GRAPHQL_ENDPOINT` is unset the
whole site renders from `src/lib/wp/preview.ts`, so `next build` passes and
every region's empty and loading states are inspectable before the CMS exists.
Setting the variable switches every query over — no component changes.

```bash
npm run typecheck      # tsc --noEmit
npm run build          # production build
npm start              # serve the build
```

## Connecting WordPress

1. Install **WPGraphQL**. Nothing else is required for the current queries.
2. Set permalinks to **Post name** (`/%postname%/`). The front end uses
   trailing slashes throughout, which matches WordPress's default and means
   existing URLs survive if this replaces a theme on the same domain.
3. Create the six categories with these exact slugs, or change `wpSlug` in
   `src/lib/wp/taxonomy.ts`:
   `ai-tools` · `how-to` · `apps` · `software` · `fixes` · `reviews`
   A post in any other category is dropped rather than rendered with a broken
   chip and a dead link.
4. Create WordPress **Pages** with these slugs. Until a Page exists the route
   still resolves and says so plainly, rather than 404ing a link the footer
   shows on every page:
   `about` · `how-we-test` · `contact` · `write-for-us` · `privacy` ·
   `terms` · `disclaimer` · `affiliate-disclosure` · `corrections`
5. Set `WORDPRESS_GRAPHQL_ENDPOINT` and `NEXT_PUBLIC_SITE_URL`.

### Card art

Featured image when a post has one, a deterministic generated SVG when it does
not. The fallback is seeded from the post slug, so a given guide always draws
the same cover, on the server and the client, forever. Six section palettes ×
four layouts, all built from the mockup's own card shapes. Add a featured
image and it takes over with no code change.

### The trend ticker

Ordered by most-viewed, per the build decision. **WordPress has no native view
counter**, so this needs a plugin that exposes one through WPGraphQL:

| Plugin | Set `WP_VIEWS_FIELD` to |
|--------|------------------------|
| Post Views Counter | `views` |
| WP-PostViews | `postViews` |

With no field configured, or before any view data exists, the ticker falls
back to most-recent. That is correct on a new site and means the region never
renders empty — but it is not "most viewed" until the plugin is in place.

### Cache invalidation

Publishing a guide refreshes that page immediately instead of waiting out the
300-second window. Set `REVALIDATE_SECRET`, then add to your theme's
`functions.php`:

```php
add_action('save_post_post', function ($post_id, $post) {
  if ($post->post_status !== 'publish') return;
  $cats = wp_get_post_categories($post_id, ['fields' => 'slugs']);
  wp_remote_post('https://YOUR-SITE/api/revalidate', [
    'headers' => ['Content-Type' => 'application/json'],
    'body'    => wp_json_encode([
      'secret'   => 'YOUR_REVALIDATE_SECRET',
      'slug'     => $post->post_name,
      'category' => $cats[0] ?? null,
    ]),
  ]);
}, 10, 2);
```

### The newsletter

`POST /api/subscribe` validates, rate-limits per IP, then forwards to
`SUBSCRIBE_ENDPOINT` with an optional `SUBSCRIBE_TOKEN` bearer. Until that is
set it returns 501 and the panel tells the reader honestly rather than showing
a success state for a subscription that never happened.

## Architecture

```
src/
  app/(site)/       layout.tsx carries the PERSISTENT regions
                    page.tsx · [slug]/ · search/ · not-found.tsx
  app/(legal)/      quiet layout: chrome only, no ticker, no newsletter
  app/api/          revalidate · subscribe
  features/         one folder per region (MANIFEST.md)
  design/           tokens · reset · typography · atoms · motion · logos
  lib/wp/           taxonomy (routes) · client · queries · preview · format
  lib/seo/          metadata · schema
  lib/art/          generated cover · PostCover
  content/brand.ts  the glossary — every user-facing string
```

Feature folders never import each other; shared code goes to `design/` or
`lib/`. Each feature owns its markup, its CSS, its query and its strings, so
any fault in the rendered page maps to exactly one folder.

**Every user-facing string is in `src/content/brand.ts`.** Changing a label is
one edit.

## The forced constraint

**Every path resolves from `src/lib/wp/taxonomy.ts`.** No component, query,
sitemap entry or JSON-LD object may contain a literal URL path. The mockup
shipped `href="#"` on 37 of its 40 links, so the URL structure is this repo's
invention and must stay in one place: change `ROUTES` and the nav, footer,
sitemap, schema, canonicals and archives all follow. A hardcoded path anywhere
else is a build defect.

## Two known items

**The ticker sits above the hero, not below it.** Making it persistent means it
lives outside `<main>`, which puts it under the masthead on every page. The
mockup had it below the hero on the homepage. To restore the mockup's order,
remove `<TrendTicker />` from `app/(site)/layout.tsx` and place it between
`<HeroFeature />` and `<CategoryGrid />` in `app/(site)/page.tsx` — it then
appears on the homepage only.

**The six section tiles wrap 5 + 1 at 1440.** `.cats` is an `auto-fit` grid, so
the sixth tile is orphaned on its own row. This is the mockup's own behaviour
and was left as designed. For six even tiles, change `.cats` in
`features/category-grid/category-grid.css` to
`grid-template-columns:repeat(3,1fr)` at ≥1000px.

## Motion fidelity note

The mockup carries six SMIL animations: five small drifts (5–8px, 22–43s)
inside the hero feature art, plus the newsletter dial rotation. The port has
three — two drifts on the hero cover and the dial — because the generated
fallback has fewer element groups than the mockup's bespoke hero illustration.

This is moot in production: as soon as the featured post has a featured image
the generated art is replaced entirely and its motion goes with it. Grid cards
are deliberately still, as in the mockup. If you want the hero livelier before
real images land, add further `<g>` groups with `animateTransform` in
`src/lib/art/cover.tsx` — the amplitudes and `keySplines` there are already
the mockup's own.
