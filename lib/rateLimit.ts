interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const limits = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL = 5 * 60 * 1000;
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of limits) {
    if (entry.resetAt < now) {
      limits.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = limits.get(key);

  if (!entry || entry.resetAt < now) {
    limits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real;
  return "unknown";
}

export const RATE_LIMITS = {
  login: { max: 10, window: 15 * 60 * 1000 },
  register: { max: 5, window: 60 * 60 * 1000 },
  sendCode: { max: 3, window: 60 * 60 * 1000 },
  generate: { max: 20, window: 60 * 60 * 1000 },
  redeem: { max: 10, window: 60 * 60 * 1000 },
  feedback: { max: 5, window: 60 * 60 * 1000 },
  passwordReset: { max: 5, window: 60 * 60 * 1000 },
} as const;
