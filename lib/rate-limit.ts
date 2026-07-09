/**
 * Fixed-window rate limit for /api/generate (SEC-11). In-memory, so it only
 * blunts abuse on a single instance, acceptable for this deploy shape (no
 * horizontal scaling, no shared cache). A multi-instance deploy would need a
 * shared store (e.g. Redis) instead.
 */
const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Bound the map itself so an attacker spraying fake IPs/keys can't grow it unbounded.
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs: number;
}

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now > existing.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) buckets.clear();
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, retryAfterMs: existing.resetAt - now };
  }

  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

/** Best-effort client key from forwarding headers. Falls back to a shared bucket if absent. */
export function clientKeyFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
