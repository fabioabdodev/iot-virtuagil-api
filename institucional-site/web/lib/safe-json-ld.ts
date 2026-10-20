/**
 * JSON-LD is embedded in an HTML script element. JSON.stringify alone leaves
 * "</script>" intact and can terminate the element before the JSON is parsed.
 *
 * Escape HTML-significant characters using valid JSON unicode escapes. The
 * resulting string retains identical JSON semantics when parsed by crawlers.
 */
export function serializeSafeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}
