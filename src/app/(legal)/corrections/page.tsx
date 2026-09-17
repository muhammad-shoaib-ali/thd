import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Corrections',
  alternates: { canonical: "/corrections/" },
};

export default function Page() {
  return <StaticPage slug="corrections" fallbackTitle='Corrections policy' />;
}
