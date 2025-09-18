import { NextFunction, Response } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { PermissionLevel } from '../../domain/entities/User';
import { AuthenticatedRequest } from './authenticationMiddleware';

export interface PermissionMiddlewareOptions {
  functionName: string;
  permissionLevel: PermissionLevel;
  requireAll?: boolean; // Se true, requer todas as permissões, se false, requer pelo menos uma
}

export class PermissionMiddleware {
  constructor(private permissionService: PermissionApplicationService) {}

  requirePermission = (options: PermissionMiddlewareOptions) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        const hasPermission = await this.permissionService.checkPermission({
          userId: req.user.userId,
          functionName: options.functionName,
          permissionLevel: options.permissionLevel,
        });

        if (!hasPermission) {
          res.status(403).json({
            error: 'Insufficient permissions',
            details: `Required: ${options.functionName}:${options.permissionLevel}`,
          });
          return;
        }

        next();
      } catch (error: any) {
        console.error('Permission middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

  requireAnyPermission = (
    permissions: Array<{
      functionName: string;
      permissionLevel: PermissionLevel;
    }>
  ) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        let hasAnyPermission = false;
        const failedPermissions: string[] = [];

        for (const permission of permissions) {
          const hasPermission = await this.permissionService.checkPermission({
            userId: req.user.userId,
            functionName: permission.functionName,
            permissionLevel: permission.permissionLevel,
          });

          if (hasPermission) {
            hasAnyPermission = true;
            break;
          } else {
            failedPermissions.push(
              `${permission.functionName}:${permission.permissionLevel}`
            );
          }
        }

        if (!hasAnyPermission) {
          res.status(403).json({
            error: 'Insufficient permissions',
            details: `Required any of: ${failedPermissions.join(', ')}`,
          });
          return;
        }

        next();
      } catch (error: any) {
        console.error('Permission middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

  requireAllPermissions = (
    permissions: Array<{
      functionName: string;
      permissionLevel: PermissionLevel;
    }>
  ) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        const failedPermissions: string[] = [];

        for (const permission of permissions) {
          const hasPermission = await this.permissionService.checkPermission({
            userId: req.user.userId,
            functionName: permission.functionName,
            permissionLevel: permission.permissionLevel,
          });

          if (!hasPermission) {
            failedPermissions.push(
              `${permission.functionName}:${permission.permissionLevel}`
            );
          }
        }

        if (failedPermissions.length > 0) {
          res.status(403).json({
            error: 'Insufficient permissions',
            details: `Required all of: ${failedPermissions.join(', ')}`,
          });
          return;
        }

        next();
      } catch (error: any) {
        console.error('Permission middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

  // Middleware para verificar se o usuário pode gerenciar outro usuário
  requireUserManagement = () => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        const targetUserId = req.params.userId || req.body.userId;
        if (!targetUserId) {
          res.status(400).json({ error: 'Target user ID is required' });
          return;
        }

        const canManage = await this.permissionService.canUserManageUser(
          req.user.userId,
          targetUserId
        );

        if (!canManage) {
          res.status(403).json({ error: 'Cannot manage this user' });
          return;
        }

        next();
      } catch (error: any) {
        console.error('User management middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };

  // Middleware para verificar se o usuário pode acessar um tenant
  requireTenantAccess = () => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ): Promise<void> => {
      try {
        if (!req.user) {
          res.status(401).json({ error: 'Authentication required' });
          return;
        }

        const tenantId =
          req.params.tenantId ||
          req.body.tenantId ||
          req.headers['x-tenant-id'];
        if (!tenantId) {
          res.status(400).json({ error: 'Tenant ID is required' });
          return;
        }

        const canAccess = await this.permissionService.canUserAccessTenant(
          req.user.userId,
          tenantId as string
        );

        if (!canAccess) {
          res.status(403).json({ error: 'Cannot access this tenant' });
          return;
        }

        next();
      } catch (error: any) {
        console.error('Tenant access middleware error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  };
}
