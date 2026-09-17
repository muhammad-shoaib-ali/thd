/** The shape every region consumes. Nothing downstream sees WPGraphQL. */
import type { CategoryDef } from "./taxonomy";

export interface Cover {
  /** WP featured image. Null when the post has none — then art() is used. */
  url: string | null;
  alt: string;
  width: number | null;
  height: number | null;
  /** Deterministic seed for the generated fallback, derived from the slug. */
  seed: number;
}

export interface Post {
  id: string;
  slug: string;
  href: string;
  title: string;
  excerpt: string;
  dateISO: string;
  /** "27 Aug", as the mockup renders it. */
  dateLabel: string;
  readMinutes: number;
  category: CategoryDef;
  cover: Cover;
  views: number | null;
}

export interface PostFull extends Post {
  contentHtml: string;
  modifiedISO: string;
  author: { name: string; slug: string; avatar: string | null };
}

export interface CategoryWithCount {
  def: CategoryDef;
  count: number;
}

export interface Paged<T> {
  items: T[];
  hasNext: boolean;
  endCursor: string | null;
}
