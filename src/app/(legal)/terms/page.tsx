import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Terms & Conditions',
  alternates: { canonical: "/terms/" },
};

export default function Page() {
  return <StaticPage slug="terms" fallbackTitle='Terms & Conditions' />;
}
