import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'How we test',
  alternates: { canonical: "/how-we-test/" },
};

export default function Page() {
  return <StaticPage slug="how-we-test" fallbackTitle='How we test' />;
}
