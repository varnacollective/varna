/**
 * lib/rate-limiter.ts
 *
 * Simple in-memory IP/key rate-limiter for API routes.
 * Resets automatically every `windowMs` milliseconds.
 *
 * Usage:
 *   const limiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });
 *   const { allowed, remaining } = limiter.check(ip);
 */

interface RateLimiterOptions {
  maxRequests: number; // max requests per window
  windowMs: number;    // window duration in milliseconds
}

interface BucketState {
  count: number;
  resetAt: number;
}

export function createRateLimiter({ maxRequests, windowMs }: RateLimiterOptions) {
  const store = new Map<string, BucketState>();

  // Periodic GC: remove expired buckets every window to prevent memory growth.
  const gcInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of store.entries()) {
      if (bucket.resetAt <= now) store.delete(key);
    }
  }, windowMs * 2);

  // Prevent the interval from keeping the Node process alive.
  if (typeof gcInterval === "object" && gcInterval.unref) {
    gcInterval.unref();
  }

  return {
    /** Returns { allowed, remaining, resetAt } */
    check(key: string): { allowed: boolean; remaining: number; resetAt: number } {
      const now = Date.now();
      let bucket = store.get(key);

      if (!bucket || bucket.resetAt <= now) {
        bucket = { count: 0, resetAt: now + windowMs };
        store.set(key, bucket);
      }

      bucket.count += 1;
      const remaining = Math.max(0, maxRequests - bucket.count);
      const allowed = bucket.count <= maxRequests;

      return { allowed, remaining, resetAt: bucket.resetAt };
    },
  };
}

