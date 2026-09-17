/**
 * Called from a WordPress save_post hook so publishing a guide refreshes
 * that one page instead of waiting out the 300s revalidate window.
 *
 *   curl -X POST https://site/api/revalidate \
 *        -H 'content-type: application/json' \
 *        -d '{"secret":"...","slug":"my-guide"}'
 */
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "REVALIDATE_SECRET is not set" }, { status: 503 });
  }

  let body: { secret?: string; slug?: string; category?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body must be JSON" }, { status: 400 });
  }

  if (body.secret !== secret) {
    return NextResponse.json({ error: "Bad secret" }, { status: 401 });
  }

  const tags = ["wp", "wp:posts", "wp:cats"];
  if (body.slug) tags.push(`wp:post:${body.slug}`);
  if (body.category) tags.push(`wp:cat:${body.category}`);
  // Next 16 requires a cacheLife profile as the second argument.
  tags.forEach((t) => revalidateTag(t, { expire: 0 }));

  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() });
}
