import { createHash } from 'node:crypto';

const WINDOW_MS = 60_000;
const MAX_TRACKED = 1000;
const buckets = new Map<string, { count: number; expiresAt: number }>();

/** Bounded per-process safeguard, with lazy expiry and no polling. A shared
 * edge rate limit and durable n8n idempotency remain required across replicas.
 * Never trust arbitrary forwarded IP headers as an authenticated identity.
 */
export function allowCheckoutAttempt(email: string, now = Date.now()): boolean {
  for (const [key, bucket] of buckets) {
    if (bucket.expiresAt <= now) buckets.delete(key);
  }
  const key = createHash('sha256').update(email.trim().toLowerCase()).digest('hex');
  if (!buckets.has(key) && buckets.size >= MAX_TRACKED) return false;
  const global = buckets.get('global');
  const local = buckets.get(key);
  if ((global?.count ?? 0) >= 30 || (local?.count ?? 0) >= 3) return false;
  buckets.set('global', { count: (global?.count ?? 0) + 1, expiresAt: global?.expiresAt ?? now + WINDOW_MS });
  buckets.set(key, { count: (local?.count ?? 0) + 1, expiresAt: local?.expiresAt ?? now + WINDOW_MS });
  return true;
}
