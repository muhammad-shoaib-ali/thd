/**
 * The glossary. Every user-facing string on the site resolves from here, so
 * changing a label is one edit and never a hunt through components (E6).
 * Strings are the approved mockup's own wording.
 */
export const BRAND = {
  name: "TechHowDaily",
  nameParts: { a: "Tech", b: "How", c: "Daily" },
  tagline: "AI tools, software and how-to guides",
  description:
    "Practical guides to AI tools, software and apps. Tested walkthroughs, honest comparisons, and fixes that actually work.",
  footerBlurb:
    "Practical guides to AI tools, software and apps. Tested, dated, and re-checked.",
  copyright: (y: number) => `© ${y} TechHowDaily. All rights reserved.`,
  colophon: "Made for people who read the docs.",
} as const;

export const UI = {
  skip: "Skip to content",
  searchPlaceholder: "Search guides",
  cta: "Subscribe",
  more: "View all →",
  allTopics: "All topics →",
  browseEyebrow: "Browse",
  browseHeading: "Pick your corner",
  browseDek:
    "Six sections, updated most weekdays. Every guide is dated and re-tested.",
  latestEyebrow: "Fresh",
  latestHeading: "Latest guides",
  trendingLabel: "Trending now",
  newsletterEyebrow: "Newsletter",
  newsletterHeading: "One tested guide, every Tuesday",
  newsletterDek:
    "No launch roundups, no “top 50” lists. One thing we actually used, with what went wrong.",
  newsletterReassurance:
    "Free. Unsubscribe in one click. We never sell your address.",
  emailPlaceholder: "you@work.com",
  emailLabel: "Email address",
  readSuffix: "min",
  guidesSuffix: "guides",
  // Designed empty and loading states (20.2), not blanks.
  emptyCategory: "Nothing published in this section yet. The first guide lands soon.",
  emptyLatest: "No guides yet. This is where they will appear.",
  emptySearch: "No guide matches that. Try a broader term.",
  loading: "Loading guides…",
  notFoundHeading: "That page is not here",
  notFoundDek:
    "The link may be old, or the guide may have been renamed after a re-test. The six sections below all still work.",
} as const;

export const FOOTER_GROUPS = {
  topics: "Topics",
  site: "Site",
  legal: "Legal",
} as const;
