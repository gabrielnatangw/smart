import { Request, Response } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';

export class UserPermissionController {
  constructor(private permissionService: PermissionApplicationService) {}

  async grantPermission(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { userId, permissionId } = req.body;
      const grantedBy = req.user?.userId;

      if (!userId || !permissionId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, permissionId',
        });
        return;
      }

      const userPermission = await this.permissionService.grantPermission({
        userId,
        permissionId,
        grantedBy,
      });

      res.status(201).json({
        success: true,
        message: 'Permission granted successfully',
        data: userPermission.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error granting permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to grant permission',
      });
    }
  }

  async revokePermission(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { userId, permissionId } = req.body;

      if (!userId || !permissionId) {
        res.status(400).json({
          success: false,
          error: 'Missing required fields: userId, permissionId',
        });
        return;
      }

      const success = await this.permissionService.revokePermission({
        userId,
        permissionId,
      });

      if (!success) {
        res.status(404).json({
          success: false,
          error: 'User permission not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Permission revoked successfully',
      });
    } catch (error: any) {
      console.error('Error revoking permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to revoke permission',
      });
    }
  }

  async getUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;

      const permissions =
        await this.permissionService.getUserPermissions(userId);

      res.json({
        success: true,
        data: permissions.map(p => p.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error getting user permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user permissions',
      });
    }
  }

  async setUserPermissions(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { userId } = req.params;
      const { permissionIds } = req.body;
      const grantedBy = req.user?.userId;

      if (!permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({
          success: false,
          error: 'permissionIds must be an array',
        });
        return;
      }

      const userPermissions = await this.permissionService.setUserPermissions({
        userId,
        permissionIds,
        grantedBy,
      });

      res.json({
        success: true,
        message: 'User permissions updated successfully',
        data: userPermissions.map(p => p.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error setting user permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to set user permissions',
      });
    }
  }

  async checkPermission(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { functionName, permissionLevel } = req.query;

      if (!functionName || !permissionLevel) {
        res.status(400).json({
          success: false,
          error:
            'Missing required query parameters: functionName, permissionLevel',
        });
        return;
      }

      const hasPermission = await this.permissionService.checkPermission({
        userId,
        functionName: functionName as string,
        permissionLevel: permissionLevel as any,
      });

      res.json({
        success: true,
        data: {
          hasPermission,
          userId,
          functionName,
          permissionLevel,
        },
      });
    } catch (error: any) {
      console.error('Error checking permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check permission',
      });
    }
  }

  async getUserPermissionsByFunction(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { userId } = req.params;

      const permissions =
        await this.permissionService.getUserPermissionsByFunction(userId);

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      console.error('Error getting user permissions by function:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get user permissions',
      });
    }
  }

  async canUserCreateUserType(req: Request, res: Response): Promise<void> {
    try {
      const { creatorId } = req.params;
      const { targetUserType, targetTenantId } = req.query;

      if (!targetUserType) {
        res.status(400).json({
          success: false,
          error: 'targetUserType is required',
        });
        return;
      }

      const canCreate = await this.permissionService.canUserCreateUserType(
        creatorId,
        targetUserType as any,
        targetTenantId as string
      );

      res.json({
        success: true,
        data: {
          canCreate,
          creatorId,
          targetUserType,
          targetTenantId,
        },
      });
    } catch (error: any) {
      console.error('Error checking user creation permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check user creation permission',
      });
    }
  }

  async canUserManageUser(req: Request, res: Response): Promise<void> {
    try {
      const { managerId, targetUserId } = req.params;

      const canManage = await this.permissionService.canUserManageUser(
        managerId,
        targetUserId
      );

      res.json({
        success: true,
        data: {
          canManage,
          managerId,
          targetUserId,
        },
      });
    } catch (error: any) {
      console.error('Error checking user management permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check user management permission',
      });
    }
  }

  async canUserAccessTenant(req: Request, res: Response): Promise<void> {
    try {
      const { userId, tenantId } = req.params;

      const canAccess = await this.permissionService.canUserAccessTenant(
        userId,
        tenantId
      );

      res.json({
        success: true,
        data: {
          canAccess,
          userId,
          tenantId,
        },
      });
    } catch (error: any) {
      console.error('Error checking tenant access permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to check tenant access permission',
      });
    }
  }

  async getDefaultUserPermissions(req: Request, res: Response): Promise<void> {
    try {
      const defaultPermissions =
        await this.permissionService.getDefaultUserPermissions();

      res.json({
        success: true,
        data: defaultPermissions,
      });
    } catch (error: any) {
      console.error('Error getting default user permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get default user permissions',
      });
    }
  }

  async validatePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { permissions } = req.body;

      if (!permissions || !Array.isArray(permissions)) {
        res.status(400).json({
          success: false,
          error: 'permissions must be an array',
        });
        return;
      }

      const validation =
        await this.permissionService.validatePermissions(permissions);

      res.json({
        success: true,
        data: validation,
      });
    } catch (error: any) {
      console.error('Error validating permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to validate permissions',
      });
    }
  }
}
