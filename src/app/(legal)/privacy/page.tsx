import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Privacy Policy',
  alternates: { canonical: "/privacy/" },
};

export default function Page() {
  return <StaticPage slug="privacy" fallbackTitle='Privacy Policy' />;
}
