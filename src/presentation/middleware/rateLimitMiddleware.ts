import { NextFunction, Request, Response } from 'express';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

export interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxAttempts: number; // Maximum attempts per window
  blockDuration: number; // Block duration in milliseconds
  keyGenerator?: (req: Request) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Skip counting successful requests
  skipFailedRequests?: boolean; // Skip counting failed requests
  onLimitReached?: (req: Request, res: Response) => void; // Custom handler for limit reached
}

export class RateLimitMiddleware {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000
    );
  }

  createRateLimit = (options: RateLimitOptions) => {
    const {
      windowMs,
      maxAttempts,
      blockDuration,
      keyGenerator = (req: Request) => this.getClientIp(req),
      skipSuccessfulRequests = false,
      skipFailedRequests = false,
      onLimitReached,
    } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
      const key = keyGenerator(req);
      const now = Date.now();
      const entry = this.store.get(key) || {
        count: 0,
        resetTime: now + windowMs,
        blocked: false,
      };

      // Check if currently blocked
      if (entry.blocked && entry.blockUntil && now < entry.blockUntil) {
        const remainingTime = Math.ceil((entry.blockUntil - now) / 1000);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: remainingTime,
          code: 'RATE_LIMIT_EXCEEDED',
        });
        return;
      }

      // Reset window if expired
      if (now > entry.resetTime) {
        entry.count = 0;
        entry.resetTime = now + windowMs;
        entry.blocked = false;
        delete entry.blockUntil;
      }

      // Check rate limit before processing request
      if (entry.count >= maxAttempts && !entry.blocked) {
        entry.blocked = true;
        entry.blockUntil = now + blockDuration;

        if (onLimitReached) {
          onLimitReached(req, res);
        }

        const remainingTime = Math.ceil(blockDuration / 1000);
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: remainingTime,
          code: 'RATE_LIMIT_EXCEEDED',
        });

        this.store.set(key, entry);
        return;
      }

      // Increment counter if not blocked
      if (!entry.blocked) {
        entry.count++;
        this.store.set(key, entry);
      }

      // Add headers
      res.set({
        'X-RateLimit-Limit': maxAttempts.toString(),
        'X-RateLimit-Remaining': Math.max(
          0,
          maxAttempts - entry.count
        ).toString(),
        'X-RateLimit-Reset': new Date(entry.resetTime).toISOString(),
      });

      // Override res.status to handle success/failure counting
      const originalStatus = res.status;
      const storeRef = this.store;
      res.status = function (statusCode: number) {
        const isSuccess = statusCode >= 200 && statusCode < 400;
        const isFailure = statusCode >= 400;

        // Decrement counter for successful requests if configured
        if (isSuccess && skipSuccessfulRequests && entry.count > 0) {
          entry.count--;
          storeRef.set(key, entry);
        }

        // Decrement counter for failed requests if configured
        if (isFailure && skipFailedRequests && entry.count > 0) {
          entry.count--;
          storeRef.set(key, entry);
        }

        return originalStatus.call(this, statusCode);
      };

      next();
    };
  };

  // Predefined rate limiters for common use cases
  loginRateLimit = this.createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 5,
    blockDuration: 15 * 60 * 1000, // 15 minutes
    keyGenerator: (req: Request) => {
      const email = req.body?.email ?? 'unknown';
      const ip = this.getClientIp(req);
      return `login:${email}:${ip}`;
    },
    skipSuccessfulRequests: true, // Don't count successful logins
  });

  generalApiRateLimit = this.createRateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxAttempts: 100,
    blockDuration: 5 * 60 * 1000, // 5 minutes
  });

  passwordResetRateLimit = this.createRateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxAttempts: 3,
    blockDuration: 60 * 60 * 1000, // 1 hour
    keyGenerator: (req: Request) => {
      const email = req.body?.email ?? 'unknown';
      return `password-reset:${email}`;
    },
  });

  refreshTokenRateLimit = this.createRateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxAttempts: 10,
    blockDuration: 5 * 60 * 1000, // 5 minutes
  });

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIp = req.headers['x-real-ip'];

    const ip =
      (Array.isArray(forwarded) ? forwarded[0] : forwarded) ||
      (typeof realIp === 'string' ? realIp : undefined) ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      'unknown';

    return Array.isArray(ip) ? ip[0] : String(ip);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      // Remove entries that are no longer blocked and past their reset time
      if (!entry.blocked && now > entry.resetTime) {
        this.store.delete(key);
      }
      // Remove entries that were blocked but block period has expired
      else if (entry.blocked && entry.blockUntil && now > entry.blockUntil) {
        this.store.delete(key);
      }
    }
  }

  // Method to manually clear rate limit for a key
  clearRateLimit(key: string): void {
    this.store.delete(key);
  }

  // Method to get current rate limit status for a key
  getRateLimitStatus(key: string): RateLimitEntry | null {
    return this.store.get(key) || null;
  }

  // Cleanup on shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}
