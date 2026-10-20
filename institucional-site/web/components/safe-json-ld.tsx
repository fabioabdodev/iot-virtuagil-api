import { serializeSafeJsonLd } from '@/lib/safe-json-ld';

/**
 * The sole approved JSON-LD script sink in Virtuagil.
 * serializeSafeJsonLd encodes HTML breakout characters before interpolation.
 */
export function SafeJsonLd({ data }: { data: unknown }) {
  // nosemgrep: typescript.react.security.audit.react-dangerouslysetinnerhtml.react-dangerouslysetinnerhtml
  // Safe: HTML/script breakout is neutralized in serializeSafeJsonLd.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeSafeJsonLd(data) }} />;
}
