/**
 * The quiet layout. Legal and static pages keep the masthead and the footer
 * — the persistent regions that carry the site's identity and the 10.5
 * links — but drop the trend ticker and the newsletter panel, because 17.1
 * requires these pages plain and conversion-free.
 */
import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import { Masthead } from "@/features/masthead";
import { SiteFooter } from "@/features/site-footer";
import { Reveal } from "@/design/Reveal";
import { baseMetadata } from "@/lib/seo/metadata";
import { UI } from "@/content/brand";

import "@/design/tokens.css";
import "@/design/reset.css";
import "@/design/typography.css";
import "@/design/atoms.css";
import "@/features/post-body/post-body.css";

const sora = Sora({ subsets: ["latin"], weight: ["400", "600", "700", "800"], variable: "--font-d", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-b", display: "swap" });

export const metadata: Metadata = { ...baseMetadata, robots: { index: true, follow: true } };

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body>
        <a className="skip" href="#main">{UI.skip}</a>
        <Masthead />
        <main id="main">{children}</main>
        <SiteFooter />
        <Reveal />
      </body>
    </html>
  );
}
