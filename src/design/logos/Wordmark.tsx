/**
 * The mark. One shape, used in the masthead and the footer, so it lives in
 * design/ rather than inside either feature (24.13.1: features never import
 * each other). Geometry is the mockup's own.
 */
import { BRAND } from "@/content/brand";

export function Wordmark({ size = 26 }: { size?: number }) {
  return (
    <>
      <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
        <rect x="1.5" y="1.5" width="29" height="29" rx="8" fill="#101318" stroke="#262A32" strokeWidth="1.5" />
        <path d="M9 20.5 L15 11 l4 6 l3 -4" fill="none" stroke="#00E599" strokeWidth="2.6"
              strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="22" cy="13" r="2.4" fill="#38BDF8" />
      </svg>
      {BRAND.nameParts.a}<span>{BRAND.nameParts.b}</span>{BRAND.nameParts.c}
    </>
  );
}
