/**
 * The post template. Not one of the homepage regions: this is the object
 * continuing on another page (17.1.9), so it reuses the site's own chip,
 * meta row and cover treatment rather than introducing a second grammar.
 */
import Link from "next/link";
import { ROUTES } from "@/lib/wp/taxonomy";
import { PostCover } from "@/lib/art/PostCover";
import { UI } from "@/content/brand";
import type { PostFull } from "@/lib/wp/types";
import "./post-body.css";

export function PostBody({ post }: { post: PostFull }) {
  return (
    <article className="sec">
      <div className="w">
        <nav className="crumbs" aria-label="Breadcrumb">
          <Link href={ROUTES.home}>Home</Link>
          <span className="dot" aria-hidden="true" />
          <Link href={ROUTES.category(post.category.slug)}>{post.category.label}</Link>
        </nav>

        <header className="phead uf">
          <span className={`chip ${post.category.chip}`}>{post.category.label}</span>
          <h1 style={{ marginTop: 14 }}>{post.title}</h1>
          <p className="pdek">{post.excerpt}</p>
          <div className="meta">
            <span className="av" aria-hidden="true" />
            <span>{post.author.name}</span>
            <span className="dot" aria-hidden="true" />
            <time dateTime={post.dateISO}>{post.dateLabel}</time>
            <span className="dot" aria-hidden="true" />
            <span>{post.readMinutes} {UI.readSuffix} read</span>
          </div>
        </header>

        <div className="pcover uf">
          <PostCover post={post} priority sizes="(max-width:980px) 100vw, 860px" />
        </div>

        {/* Content is WordPress's own sanitised post_content. */}
        <div className="prose" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </div>
    </article>
  );
}
