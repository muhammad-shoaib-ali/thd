/**
 * The JSON-LD tag. Separate from schema.ts because that file is pure data
 * with no JSX, which keeps it importable from anywhere (including the
 * sitemap) and satisfies the repository contract's src/lib/seo/schema.ts.
 */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      // Generated from typed data in schema.ts, never from user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
