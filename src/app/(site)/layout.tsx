/**
 * THE FROZEN REGION SET (17.1.8).
 *
 * The persistent regions are declared here, once, and every route under
 * (site) inherits them by construction (24.9.3). This is the file that
 * delivers the production benefit: you can edit titles, excerpts, images,
 * menu labels and taxonomy in WordPress forever and the design cannot
 * drift, because none of those edits reach this file.
 *
 *   persistent   masthead · trend ticker · newsletter panel · footer
 *   per-page     hero · category grid · latest grid · post body
 *
 * Adding, renaming or removing a region here is a spec revision under
 * 12.10.1, not a local edit. Legal pages live in app/(legal) with their
 * own quiet layout, because 17.1 requires them plain and ad-free.
 */
import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Masthead } from "@/features/masthead";
import { TrendTicker } from "@/features/trend-ticker";
import { NewsletterPanel } from "@/features/newsletter-panel";
import { SiteFooter } from "@/features/site-footer";
import { Reveal } from "@/design/Reveal";
import { website } from "@/lib/seo/schema";
import { JsonLd } from "@/lib/seo/JsonLd";
import { baseMetadata } from "@/lib/seo/metadata";
import { UI } from "@/content/brand";

import "@/design/tokens.css";
import "@/design/reset.css";
import "@/design/typography.css";
import "@/design/atoms.css";

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-d", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-b", display: "swap" });

export const metadata: Metadata = baseMetadata;

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a className="skip" href="#main">{UI.skip}</a>
        <Masthead />
        <TrendTicker />
        <main id="main">{children}</main>
        <NewsletterPanel />
        <SiteFooter />
        <Reveal />
        <JsonLd data={website()} />
      </body>
    </html>
  );
}
