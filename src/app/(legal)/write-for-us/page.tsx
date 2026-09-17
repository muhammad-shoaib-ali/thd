import type { Metadata } from "next";
import { StaticPage } from "@/features/static-page";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: 'Write for us',
  alternates: { canonical: "/write-for-us/" },
};

export default function Page() {
  return <StaticPage slug="write-for-us" fallbackTitle='Write for us' />;
}
