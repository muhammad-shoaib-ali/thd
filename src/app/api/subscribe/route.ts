/**
 * The one endpoint you need to wire to your mailing provider. It validates
 * and rate-limits, then hands off. Until SUBSCRIBE_ENDPOINT is set it
 * returns 501 and the panel tells the reader honestly rather than showing
 * a success state for a subscription that never happened.
 */
import { NextResponse } from "next/server";

const seen = new Map<string, number>();

export async function POST(req: Request) {
  let body: { email?: string };
  try { body = (await req.json()) as typeof body; }
  catch { return NextResponse.json({ error: "Body must be JSON" }, { status: 400 }); }

  const email = (body.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: "That address does not look right." }, { status: 422 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const last = seen.get(ip) ?? 0;
  if (Date.now() - last < 10_000) {
    return NextResponse.json({ error: "One moment — try again shortly." }, { status: 429 });
  }
  seen.set(ip, Date.now());

  const endpoint = process.env.SUBSCRIBE_ENDPOINT;
  if (!endpoint) {
    return NextResponse.json(
      { error: "The list is not connected yet. Set SUBSCRIBE_ENDPOINT." },
      { status: 501 },
    );
  }

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.SUBSCRIBE_TOKEN ? { Authorization: `Bearer ${process.env.SUBSCRIBE_TOKEN}` } : {}),
    },
    body: JSON.stringify({ email }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: "The list rejected that. Try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
