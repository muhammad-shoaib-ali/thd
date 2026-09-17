"use client";
/**
 * REGION 6 — newsletter panel. Persistent, and the only conversion on the
 * site. Four states per 20.2: idle, submitting, done, error.
 *
 * The mockup's button was type="button" with no handler. This posts to
 * /api/subscribe, which is the one endpoint you will need to point at your
 * provider — see README. Until then it returns 501 and the panel says so
 * honestly rather than pretending to have subscribed anyone.
 */
import { useState } from "react";
import { UI } from "@/content/brand";
import "./newsletter-panel.css";

type State = "idle" | "sending" | "done" | "error";

export function NewsletterPanel() {
  const [state, setState] = useState<State>("idle");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>(UI.newsletterReassurance);

  const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  async function submit() {
    if (!valid) {
      setState("error");
      setMessage("That address does not look right. Check it and try again.");
      return;
    }
    setState("sending");
    setMessage("Sending…");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setState("done");
        setMessage("You are on the list. First guide lands Tuesday.");
      } else {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setState("error");
        setMessage(body.error ?? "That did not go through. Try again in a moment.");
      }
    } catch {
      setState("error");
      setMessage("No connection. Try again in a moment.");
    }
  }

  return (
    <section className="sec" style={{ paddingTop: 0 }} id="newsletter">
      <div className="w">
        <div className="nl uf">
          <svg className="nlart" width="320" height="320" viewBox="0 0 320 320" aria-hidden="true">
            <g>
              <animateTransform attributeName="transform" type="rotate" dur="43s"
                values="0 160 160;6 160 160;0 160 160" keyTimes="0;0.5;1"
                calcMode="spline" keySplines="0.42 0 0.58 1;0.42 0 0.58 1"
                repeatCount="indefinite" />
              <circle cx="160" cy="160" r="120" fill="none" stroke="#00E599" strokeWidth="2" opacity=".4" />
              <circle cx="160" cy="160" r="86" fill="none" stroke="#38BDF8" strokeWidth="2" opacity=".35" />
              <circle cx="160" cy="160" r="52" fill="none" stroke="#A78BFA" strokeWidth="2" opacity=".3" />
              <circle cx="160" cy="40" r="7" fill="#00E599" />
              <circle cx="246" cy="160" r="6" fill="#38BDF8" />
              <circle cx="160" cy="212" r="5" fill="#A78BFA" />
            </g>
          </svg>

          <p className="eyebrow">{UI.newsletterEyebrow}</p>
          <h2 style={{ marginTop: 10 }}>{UI.newsletterHeading}</h2>
          <p>{UI.newsletterDek}</p>

          {state === "done" ? (
            <p style={{ color: "var(--mint)", fontWeight: 600, margin: "18px 0 0" }}>{message}</p>
          ) : (
            <div className="form">
              <label className="skip" htmlFor="em">{UI.emailLabel}</label>
              <input
                id="em"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder={UI.emailPlaceholder}
                value={email}
                disabled={state === "sending"}
                aria-invalid={state === "error" || undefined}
                onChange={(e) => { setEmail(e.target.value); if (state === "error") { setState("idle"); setMessage(UI.newsletterReassurance); } }}
                onKeyDown={(e) => { if (e.key === "Enter") void submit(); }}
              />
              <button className="cta" type="button" style={{ padding: "12px 22px" }}
                      disabled={state === "sending"} onClick={() => void submit()}>
                {state === "sending" ? "Sending…" : UI.cta}
              </button>
            </div>
          )}

          <p aria-live="polite" style={{
            fontSize: 13,
            color: state === "error" ? "var(--coral)" : "var(--dim)",
            margin: "14px 0 0",
          }}>{state === "done" ? "" : message}</p>
        </div>
      </div>
    </section>
  );
}
