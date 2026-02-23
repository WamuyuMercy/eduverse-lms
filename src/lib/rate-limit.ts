// =============================================================
// In-Memory Rate Limiter (suitable for single instance)
// For production with multiple instances, use Upstash Redis
// =============================================================

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStore>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitOptions {
  windowMs?: number; // Time window in milliseconds
  maxRequests?: number; // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Rate limit by identifier (IP, user ID, etc.)
 */
export function rateLimit(
  identifier: string,
  options: RateLimitOptions = {}
): RateLimitResult {
  const { windowMs = 60 * 1000, maxRequests = 60 } = options;

  const now = Date.now();
  const key = identifier;
  const existing = store.get(key);

  if (!existing || existing.resetTime < now) {
    store.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return {
      success: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    };
  }

  if (existing.count >= maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: existing.resetTime,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: maxRequests - existing.count,
    resetTime: existing.resetTime,
  };
}

// Pre-configured rate limiters
export const authRateLimit = (ip: string) =>
  rateLimit(`auth:${ip}`, { windowMs: 15 * 60 * 1000, maxRequests: 10 });

export const apiRateLimit = (userId: string) =>
  rateLimit(`api:${userId}`, { windowMs: 60 * 1000, maxRequests: 100 });

export const aiRateLimit = (userId: string) =>
  rateLimit(`ai:${userId}`, { windowMs: 60 * 1000, maxRequests: 10 });

export const uploadRateLimit = (userId: string) =>
  rateLimit(`upload:${userId}`, { windowMs: 60 * 1000, maxRequests: 20 });
