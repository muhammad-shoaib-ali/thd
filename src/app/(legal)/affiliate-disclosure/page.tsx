import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Affiliate disclosure',
  alternates: { canonical: "/affiliate-disclosure/" },
};

export default function Page() {
  return <StaticPage slug="affiliate-disclosure" fallbackTitle='Affiliate disclosure' />;
}
