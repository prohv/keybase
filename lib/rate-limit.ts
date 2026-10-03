import { headers } from 'next/headers';
import { NextRequest } from 'next/server';

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export class SlidingWindowRateLimiter {
  private hits: Map<string, number[]> = new Map();

  check(key: string, maxAttempts: number = 10, windowMs: number = 60_000): RateLimitResult {
    // In test environment, bypass rate limits to keep test suites deterministic and fast
    if (process.env.NODE_ENV === 'test') {
      return { allowed: true, remaining: maxAttempts, retryAfterSec: 0 };
    }

    const now = Date.now();
    const timestamps = (this.hits.get(key) || []).filter((time) => now - time < windowMs);

    if (timestamps.length >= maxAttempts) {
      const oldest = timestamps[0];
      const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
      return { allowed: false, remaining: 0, retryAfterSec };
    }

    timestamps.push(now);
    this.hits.set(key, timestamps);

    // Prevent memory leaks
    if (this.hits.size > 5000) {
      this.cleanup(windowMs);
    }

    return {
      allowed: true,
      remaining: maxAttempts - timestamps.length,
      retryAfterSec: 0,
    };
  }

  reset(key: string): void {
    this.hits.delete(key);
  }

  private cleanup(windowMs: number): void {
    const now = Date.now();
    for (const [key, timestamps] of this.hits.entries()) {
      const valid = timestamps.filter((time) => now - time < windowMs);
      if (valid.length === 0) {
        this.hits.delete(key);
      } else {
        this.hits.set(key, valid);
      }
    }
  }
}

// Global singleton instance
const limiter = new SlidingWindowRateLimiter();

export function checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 60_000): RateLimitResult {
  return limiter.check(key, maxAttempts, windowMs);
}

export function resetRateLimit(key: string): void {
  limiter.reset(key);
}

export function getClientIp(req?: Request | NextRequest | null): string {
  if (!req) return '127.0.0.1';
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}

export async function getActionClientIp(): Promise<string> {
  try {
    const headerList = await headers();
    const xForwardedFor = headerList.get('x-forwarded-for');
    if (xForwardedFor) {
      return xForwardedFor.split(',')[0].trim();
    }
    return headerList.get('x-real-ip') || '127.0.0.1';
  } catch {
    return '127.0.0.1';
  }
}
