/** The .shead row: eyebrow, heading, dek, and an optional "more" link. */
import Link from "next/link";
import "./section-head.css";

export interface SectionHeadProps {
  eyebrow: string;
  heading: string;
  dek?: string;
  more?: { href: string; label: string };
  headingId?: string;
}

export function SectionHead({ eyebrow, heading, dek, more, headingId }: SectionHeadProps) {
  return (
    <div className="shead uf">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={headingId} style={{ marginTop: 8 }}>{heading}</h2>
        {dek ? <p>{dek}</p> : null}
      </div>
      {more ? <Link className="more" href={more.href}>{more.label}</Link> : null}
    </div>
  );
}
