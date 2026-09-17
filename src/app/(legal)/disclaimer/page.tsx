import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Disclaimer',
  alternates: { canonical: "/disclaimer/" },
};

export default function Page() {
  return <StaticPage slug="disclaimer" fallbackTitle='Disclaimer' />;
}
