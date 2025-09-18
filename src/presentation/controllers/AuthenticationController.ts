import { Request, Response } from 'express';

import { AuthenticationApplicationService } from '../../application/services/AuthenticationApplicationService';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';
import {
  firstLoginSchema,
  forgotPasswordSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordSchema,
  validateRequest,
} from '../validators/authenticationValidators';

export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationApplicationService,
    private readonly userService?: UserApplicationService
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(loginSchema, req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const result = await this.authService.login(value);
      res.status(200).json(result);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(refreshTokenSchema, req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const result = await this.authService.refreshToken(value);
      res.status(200).json(result);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      await this.authService.logout(req.user.userId);
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(forgotPasswordSchema, req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const result = await this.authService.forgotPassword(value);
      res.status(200).json({ message: result });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(resetPasswordSchema, req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      await this.authService.resetPassword(value);
      res.status(200).json({ message: 'Password reset successfully' });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  firstLogin = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(firstLoginSchema, req.body);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const result = await this.authService.firstLogin(value);
      res.status(200).json(result);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // Se o UserService estiver disponível, retornar dados completos
      if (this.userService) {
        const userWithTenant = await this.userService.getUserWithTenantById(
          req.user.userId
        );

        if (!userWithTenant) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        res.status(200).json({
          user: userWithTenant.user.toSafeObject(),
          tenant: userWithTenant.tenant,
        });
      } else {
        // Fallback para dados básicos se UserService não estiver disponível
        res.status(200).json({ user: req.user });
      }
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  private handleError(error: any, res: Response): void {
    console.error('Authentication error:', error);

    const errorMessage = error.message || 'Internal server error';

    switch (errorMessage) {
      case 'INVALID_CREDENTIALS':
        res.status(401).json({ error: 'Invalid email or password' });
        break;
      case 'USER_INACTIVE':
        res.status(401).json({ error: 'User account is inactive' });
        break;
      case 'USER_NOT_FOUND':
        res.status(404).json({ error: 'User not found' });
        break;
      case 'ACCESS_TOKEN_EXPIRED':
        res
          .status(401)
          .json({ error: 'Access token expired', code: 'TOKEN_EXPIRED' });
        break;
      case 'INVALID_ACCESS_TOKEN':
      case 'INVALID_REFRESH_TOKEN':
        res.status(401).json({ error: 'Invalid token', code: 'INVALID_TOKEN' });
        break;
      case 'REFRESH_TOKEN_EXPIRED':
        res.status(401).json({
          error: 'Refresh token expired',
          code: 'REFRESH_TOKEN_EXPIRED',
        });
        break;
      case 'INVALID_OR_EXPIRED_TOKEN':
        res.status(400).json({ error: 'Invalid or expired token' });
        break;
      case 'USER_ALREADY_ACTIVATED':
        res.status(400).json({ error: 'User has already been activated' });
        break;
      default:
        if (errorMessage.startsWith('ACCOUNT_BLOCKED_')) {
          const minutes = errorMessage.split('_')[2];
          res.status(429).json({
            error: `Account temporarily blocked due to too many failed login attempts. Try again in ${minutes} minutes.`,
            code: 'ACCOUNT_BLOCKED',
          });
        } else {
          res.status(500).json({ error: 'Internal server error' });
        }
        break;
    }
  }
}
