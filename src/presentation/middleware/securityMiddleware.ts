import * as crypto from 'crypto';
import { NextFunction, Request, Response } from 'express';

export interface SecurityOptions {
  enableHsts?: boolean;
  enableNoSniff?: boolean;
  enableXssProtection?: boolean;
  enableClickjacking?: boolean;
  enableReferrerPolicy?: boolean;
  enablePermissionsPolicy?: boolean;
}

export class SecurityMiddleware {
  constructor(private options: SecurityOptions = {}) {
    // Set default values
    this.options = {
      enableHsts: true,
      enableNoSniff: true,
      enableXssProtection: true,
      enableClickjacking: true,
      enableReferrerPolicy: true,
      enablePermissionsPolicy: true,
      ...options,
    };
  }

  // Apply security headers
  securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
    // HTTP Strict Transport Security
    if (this.options.enableHsts) {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    // Prevent MIME type sniffing
    if (this.options.enableNoSniff) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // XSS Protection
    if (this.options.enableXssProtection) {
      res.setHeader('X-XSS-Protection', '1; mode=block');
    }

    // Clickjacking protection
    if (this.options.enableClickjacking) {
      res.setHeader('X-Frame-Options', 'DENY');
    }

    // Referrer Policy
    if (this.options.enableReferrerPolicy) {
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }

    // Permissions Policy
    if (this.options.enablePermissionsPolicy) {
      res.setHeader(
        'Permissions-Policy',
        'camera=(), microphone=(), geolocation=()'
      );
    }

    // Remove server information
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  };

  // Input sanitization middleware
  sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    // Only sanitize req.body as query and params are handled by Express internally
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    next();
  };

  // Validate request size
  validateRequestSize = (maxSize: number = 10 * 1024 * 1024) => {
    // 10MB default
    return (req: Request, res: Response, next: NextFunction): void => {
      const contentLength = parseInt(req.headers['content-length'] || '0');

      if (contentLength > maxSize) {
        res.status(413).json({
          error: 'Request entity too large',
          maxSize: `${maxSize / (1024 * 1024)}MB`,
        });
        return;
      }

      next();
    };
  };

  // Validate Content-Type for POST/PUT requests
  validateContentType = (allowedTypes: string[] = ['application/json']) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
        const contentType = req.headers['content-type'];

        if (
          !contentType ||
          !allowedTypes.some(type => contentType.includes(type))
        ) {
          res.status(415).json({
            error: 'Unsupported Media Type',
            allowedTypes,
          });
          return;
        }
      }

      next();
    };
  };

  // Request ID middleware for tracing
  requestId = (
    req: Request & { id?: string },
    res: Response,
    next: NextFunction
  ): void => {
    const requestId =
      (req.headers['x-request-id'] as string) || crypto.randomUUID();
    req.id = requestId;
    res.setHeader('X-Request-ID', requestId);
    next();
  };

  // Timeout middleware
  requestTimeout = (timeoutMs: number = 30000) => {
    // 30 seconds default
    return (req: Request, res: Response, next: NextFunction): void => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            error: 'Request Timeout',
            timeout: `${timeoutMs}ms`,
          });
        }
      }, timeoutMs);

      res.on('finish', () => {
        clearTimeout(timeout);
      });

      res.on('close', () => {
        clearTimeout(timeout);
      });

      next();
    };
  };

  // Block suspicious user agents
  blockSuspiciousUserAgents = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const userAgent = req.headers['user-agent'] || '';
    const suspiciousPatterns = [
      /sqlmap/i,
      /nikto/i,
      /nmap/i,
      /masscan/i,
      /nessus/i,
      /openvas/i,
      /burp/i,
      /zap/i,
    ];

    const isSuspicious = suspiciousPatterns.some(pattern =>
      pattern.test(userAgent)
    );

    if (isSuspicious) {
      res.status(403).json({
        error: 'Forbidden',
        reason: 'Suspicious user agent detected',
      });
      return;
    }

    next();
  };

  // Validate required headers
  requireHeaders = (requiredHeaders: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const missingHeaders = requiredHeaders.filter(
        header => !req.headers[header.toLowerCase()]
      );

      if (missingHeaders.length > 0) {
        res.status(400).json({
          error: 'Bad Request',
          missingHeaders,
        });
        return;
      }

      next();
    };
  };

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[this.sanitizeString(key)] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    if (typeof str !== 'string') {
      return str;
    }

    return str
      .replace(/[<>]/g, '') // Remove potential XSS characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .trim();
  }
}
