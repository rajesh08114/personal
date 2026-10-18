/** Fixed-window, in-memory rate limiter (per process). Good for one instance; use a shared store to scale out. */
export class RateLimiter {
  private readonly hits = new Map<string, { count: number; resetAt: number }>();
  private lastSweep = Date.now();

  constructor(private readonly windowMs: number) {}

  allow(key: string, max: number, now = Date.now()): boolean {
    if (now - this.lastSweep > this.windowMs) {
      for (const [k, v] of this.hits) if (v.resetAt <= now) this.hits.delete(k);
      this.lastSweep = now;
    }
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= now) {
      this.hits.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    entry.count++;
    return entry.count <= max;
  }
}
