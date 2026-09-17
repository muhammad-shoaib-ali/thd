/**
 * Featured image when WordPress has one, generated art when it does not.
 * Your decision, implemented in one place so every region behaves the same
 * and the fallback can never diverge between the hero and the grids.
 */
import Image from "next/image";
import { CoverArt } from "./cover";
import type { Post } from "@/lib/wp/types";

export function PostCover({
  post, variant = "card", priority = false, sizes, motion = false,
}: { post: Post; variant?: "card" | "thumb"; priority?: boolean; sizes?: string; motion?: boolean }) {
  if (post.cover.url) {
    return (
      <Image
        src={post.cover.url}
        alt={post.cover.alt}
        fill
        priority={priority}
        sizes={sizes ?? (variant === "thumb" ? "96px" : "(max-width:760px) 100vw, 33vw")}
        style={{ objectFit: "cover" }}
      />
    );
  }
  return <CoverArt seed={post.cover.seed} category={post.category} variant={variant} motion={motion} />;
}
