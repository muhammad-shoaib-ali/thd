import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Contact',
  alternates: { canonical: "/contact/" },
};

export default function Page() {
  return <StaticPage slug="contact" fallbackTitle='Contact' />;
}
