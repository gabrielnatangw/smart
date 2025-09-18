import { NextFunction, Request, Response } from 'express';

import { IAuthenticationRepository } from '../../application/interfaces/IAuthenticationRepository';
import {
  JwtPayload,
  JwtTokenService,
} from '../../domain/services/JwtTokenService';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId?: string;
    userType: string;
  };
}

export interface AuthMiddlewareOptions {
  requireAuth?: boolean;
  requiredUserTypes?: string[];
  requireAdmin?: boolean;
  requireRoot?: boolean;
}

export class AuthenticationMiddleware {
  private readonly jwtService: JwtTokenService;

  constructor(private readonly authRepository: IAuthenticationRepository) {
    this.jwtService = new JwtTokenService();
  }

  authenticate = (options: AuthMiddlewareOptions = { requireAuth: true }) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        const authHeader = req.headers.authorization;
        const token = this.jwtService.extractTokenFromHeader(authHeader);

        if (!token) {
          if (options.requireAuth) {
            res.status(401).json({ error: 'Authentication required' });
            return;
          }
          return next();
        }

        let payload: JwtPayload;
        try {
          payload = this.jwtService.verifyAccessToken(token);
        } catch (error: any) {
          if (error.message === 'ACCESS_TOKEN_EXPIRED') {
            res.status(401).json({
              error: 'Token expired',
              code: 'TOKEN_EXPIRED',
            });
            return;
          }
          if (error.message === 'INVALID_ACCESS_TOKEN') {
            res.status(401).json({
              error: 'Invalid token',
              code: 'INVALID_TOKEN',
            });
            return;
          }
          res.status(401).json({ error: 'Token validation failed' });
          return;
        }

        // Verify user still exists and is active
        const user = await this.authRepository.findUserById(payload.userId);
        if (!user || !user.isActive || user.isDeleted) {
          res.status(401).json({ error: 'User not found or inactive' });
          return;
        }

        // Check user type requirements
        if (
          options.requiredUserTypes &&
          !options.requiredUserTypes.includes(payload.userType)
        ) {
          res.status(403).json({ error: 'Insufficient user type' });
          return;
        }

        // Check admin requirements
        if (options.requireAdmin && payload.userType !== 'admin') {
          res.status(403).json({ error: 'Admin access required' });
          return;
        }

        // Check root requirements
        if (options.requireRoot && payload.userType !== 'root') {
          res.status(403).json({ error: 'Root access required' });
          return;
        }

        // Attach user info to request
        req.user = {
          userId: payload.userId,
          email: payload.email,
          tenantId: payload.tenantId,
          userType: payload.userType,
        };

        next();
      } catch (error: any) {
        console.error('Authentication middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

  requireAuth = this.authenticate({ requireAuth: true });

  requireAdmin = this.authenticate({
    requireAuth: true,
    requireAdmin: true,
  });

  requireUserType = (userTypes: string[]) => {
    return this.authenticate({
      requireAuth: true,
      requiredUserTypes: userTypes,
    });
  };

  optional = this.authenticate({ requireAuth: false });
}
