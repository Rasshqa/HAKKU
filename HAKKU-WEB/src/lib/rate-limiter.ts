import { NextRequest, NextResponse } from "next/server";

export interface RateLimitConfig {
  /** Maximum requests allowed in the short-term window (burst protection) */
  burstLimit?: number;
  /** Short-term window duration in seconds (default: 60s) */
  burstWindowSec?: number;
  /** Maximum requests allowed in the long-term window (hourly protection) */
  hourlyLimit?: number;
  /** Long-term window duration in seconds (default: 3600s = 1 hour) */
  hourlyWindowSec?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number; // Unix timestamp in ms
  retryAfterSec: number;
  reason?: "burst" | "hourly";
}

interface ClientRecord {
  timestamps: number[];
  hourlyTimestamps: number[];
}

/**
 * In-memory sliding window rate limiter.
 * Designed for Next.js App Router API routes to prevent API cost explosions and spamming.
 */
class MemoryRateLimiter {
  private clients = new Map<string, ClientRecord>();
  private lastCleanup = Date.now();
  private readonly cleanupInterval = 5 * 60 * 1000; // 5 minutes

  constructor() {}

  /**
   * Periodically cleans up inactive client records to avoid memory leaks.
   */
  private cleanup(now: number) {
    if (now - this.lastCleanup < this.cleanupInterval) return;
    this.lastCleanup = now;

    const oneHourAgo = now - 3600 * 1000;
    for (const [key, record] of this.clients.entries()) {
      record.hourlyTimestamps = record.hourlyTimestamps.filter((t) => t > oneHourAgo);
      record.timestamps = record.timestamps.filter((t) => t > oneHourAgo);
      if (record.hourlyTimestamps.length === 0 && record.timestamps.length === 0) {
        this.clients.delete(key);
      }
    }
  }

  public check(key: string, config: RateLimitConfig = {}): RateLimitResult {
    const now = Date.now();
    this.cleanup(now);

    const burstLimit = config.burstLimit ?? 10; // Max 10 req/min
    const burstWindowMs = (config.burstWindowSec ?? 60) * 1000;
    const hourlyLimit = config.hourlyLimit ?? 45; // Max 45 req/hour
    const hourlyWindowMs = (config.hourlyWindowSec ?? 3600) * 1000;

    let record = this.clients.get(key);
    if (!record) {
      record = { timestamps: [], hourlyTimestamps: [] };
      this.clients.set(key, record);
    }

    // Filter out timestamps outside windows
    const burstCutoff = now - burstWindowMs;
    const hourlyCutoff = now - hourlyWindowMs;

    record.timestamps = record.timestamps.filter((t) => t > burstCutoff);
    record.hourlyTimestamps = record.hourlyTimestamps.filter((t) => t > hourlyCutoff);

    // 1. Check Burst Limit (per minute)
    if (record.timestamps.length >= burstLimit) {
      const oldestInBurst = record.timestamps[0];
      const resetTime = oldestInBurst + burstWindowMs;
      const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000));

      return {
        allowed: false,
        limit: burstLimit,
        remaining: 0,
        resetTime,
        retryAfterSec,
        reason: "burst",
      };
    }

    // 2. Check Hourly Limit (per hour)
    if (record.hourlyTimestamps.length >= hourlyLimit) {
      const oldestInHour = record.hourlyTimestamps[0];
      const resetTime = oldestInHour + hourlyWindowMs;
      const retryAfterSec = Math.max(1, Math.ceil((resetTime - now) / 1000));

      return {
        allowed: false,
        limit: hourlyLimit,
        remaining: 0,
        resetTime,
        retryAfterSec,
        reason: "hourly",
      };
    }

    // Record this request
    record.timestamps.push(now);
    record.hourlyTimestamps.push(now);

    const remaining = Math.max(0, burstLimit - record.timestamps.length);
    const resetTime = now + burstWindowMs;

    return {
      allowed: true,
      limit: burstLimit,
      remaining,
      resetTime,
      retryAfterSec: 0,
    };
  }

  /**
   * Resets limit for a specific key (useful in tests).
   */
  public reset(key: string) {
    this.clients.delete(key);
  }

  /**
   * Clear all records.
   */
  public clear() {
    this.clients.clear();
  }
}

// Global singleton instance
export const rateLimiter = new MemoryRateLimiter();

/**
 * Extracts client IP safely from common HTTP headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Return first non-empty IP in chain
    const firstIp = forwarded.split(",")[0].trim();
    if (firstIp) return firstIp;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  return "127.0.0.1";
}

/**
 * Convenience helper to apply rate limiting to an API request.
 * Returns null if allowed, or a 429 NextResponse if limit is exceeded.
 */
export function enforceRateLimit(
  request: NextRequest,
  customConfig?: RateLimitConfig,
  keyPrefix = "api"
): NextResponse | null {
  const ip = getClientIp(request);
  const key = `${keyPrefix}:${ip}`;
  const result = rateLimiter.check(key, customConfig);

  if (!result.allowed) {
    const isHourly = result.reason === "hourly";
    const errorMessage = isHourly
      ? `Batas penggunaan per jam telah tercapai (maksimal ${result.limit} permintaan/jam). Silakan tunggu ${Math.ceil(
          result.retryAfterSec / 60
        )} menit sebelum mengirim pertanyaan kembali.`
      : `Anda mengirim pesan terlalu cepat. Silakan tunggu ${result.retryAfterSec} detik sebelum mengirim pesan berikutnya demi menjaga stabilitas layanan.`;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        rateLimit: {
          retryAfterSec: result.retryAfterSec,
          reason: result.reason,
          limit: result.limit,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": result.retryAfterSec.toString(),
          "X-RateLimit-Limit": result.limit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(result.resetTime / 1000).toString(),
        },
      }
    );
  }

  return null;
}
