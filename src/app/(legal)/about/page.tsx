import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'About',
  alternates: { canonical: "/about/" },
};

export default function Page() {
  return <StaticPage slug="about" fallbackTitle='About TechHowDaily' />;
}
