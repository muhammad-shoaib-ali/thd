import { HeroFeature } from "@/features/hero-feature";
import { CategoryGrid } from "@/features/category-grid";
import { LatestGrid } from "@/features/latest-grid";

export const revalidate = 300;

export default function HomePage() {
  return (
    <>
      <HeroFeature />
      <CategoryGrid />
      <LatestGrid />
    </>
  );
}
