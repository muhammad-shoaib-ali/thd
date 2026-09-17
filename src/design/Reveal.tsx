"use client";
/**
 * The .uf entrance. This is the approved mockup's own IntersectionObserver,
 * moved into a component so it runs once per page rather than per feature,
 * and so `html.js` is set before paint instead of after hydration (which
 * is what stops the first screen flashing in).
 */
import { useEffect } from "react";

export function Reveal() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("js");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.querySelectorAll<HTMLElement>(".uf").forEach((n) => n.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );

    document.querySelectorAll<HTMLElement>(".uf").forEach((n, i) => {
      n.style.transitionDelay = `${Math.min(i % 4, 3) * 70}ms`;
      io.observe(n);
    });

    return () => io.disconnect();
  }, []);

  return null;
}
