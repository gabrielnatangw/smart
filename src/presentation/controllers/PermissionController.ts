import { Request, Response } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';

export class PermissionController {
  constructor(private permissionService: PermissionApplicationService) {
    console.log(
      'PermissionController constructor called, service:',
      !!permissionService
    );
  }

  async createPermission(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const {
        functionName,
        permissionLevel,
        displayName,
        description,
        applicationId,
      } = req.body;

      if (!functionName || !permissionLevel || !displayName || !applicationId) {
        res.status(400).json({
          success: false,
          error:
            'Missing required fields: functionName, permissionLevel, displayName, applicationId',
        });
        return;
      }

      const permission = await this.permissionService.createPermission({
        functionName,
        permissionLevel,
        displayName,
        description,
        applicationId,
      });

      res.status(201).json({
        success: true,
        message: 'Permission created successfully',
        data: permission.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error creating permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create permission',
      });
    }
  }

  async getPermissionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const permission = await this.permissionService.getPermissionById(id);
      if (!permission) {
        res.status(404).json({
          success: false,
          error: 'Permission not found',
        });
        return;
      }

      res.json({
        success: true,
        data: permission.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error getting permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get permission',
      });
    }
  }

  async getPermissionsByFunction(req: Request, res: Response): Promise<void> {
    try {
      const { functionName } = req.params;
      const { applicationId } = req.query;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required',
        });
        return;
      }

      const permissions = await this.permissionService.getPermissionsByFunction(
        functionName,
        applicationId as string
      );

      res.json({
        success: true,
        data: permissions.map(p => p.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error getting permissions by function:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get permissions',
      });
    }
  }

  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { applicationId } = req.query;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required',
          message:
            'Please provide an applicationId query parameter. Use /api/applications to get available applications.',
          example:
            '/api/permissions?applicationId=0f0e6d72-b140-4bf3-925e-9d51ecb468ae',
        });
        return;
      }

      const permissions = await this.permissionService.getAllPermissions(
        applicationId as string
      );

      res.json({
        success: true,
        data: permissions.map(p => p.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error getting all permissions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get permissions',
      });
    }
  };

  getPermissionsByTenant = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          error: 'Tenant ID is required',
        });
        return;
      }

      const permissions =
        await this.permissionService.getPermissionsByTenant(tenantId);

      res.json({
        success: true,
        data: permissions.map(p => p.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error getting permissions by tenant:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get permissions',
      });
    }
  };

  async updatePermission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { displayName, description } = req.body;

      const permission = await this.permissionService.updatePermission(id, {
        displayName,
        description,
      });

      if (!permission) {
        res.status(404).json({
          success: false,
          error: 'Permission not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Permission updated successfully',
        data: permission.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error updating permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to update permission',
      });
    }
  }

  async deletePermission(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const success = await this.permissionService.deletePermission(id);
      if (!success) {
        res.status(404).json({
          success: false,
          error: 'Permission not found',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Permission deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting permission:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete permission',
      });
    }
  }

  async getAvailableFunctions(req: Request, res: Response): Promise<void> {
    try {
      const { applicationId } = req.query;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required',
        });
        return;
      }

      const functions = await this.permissionService.getAvailableFunctions(
        applicationId as string
      );

      res.json({
        success: true,
        data: functions,
      });
    } catch (error: any) {
      console.error('Error getting available functions:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get available functions',
      });
    }
  }

  async getAvailableLevels(req: Request, res: Response): Promise<void> {
    try {
      const { functionName } = req.params;
      const { applicationId } = req.query;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required',
        });
        return;
      }

      const levels = await this.permissionService.getAvailableLevels(
        functionName,
        applicationId as string
      );

      res.json({
        success: true,
        data: levels,
      });
    } catch (error: any) {
      console.error('Error getting available levels:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get available levels',
      });
    }
  }

  async getPermissionsByFunctionGrouped(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { applicationId } = req.query;

      if (!applicationId) {
        res.status(400).json({
          success: false,
          error: 'Application ID is required',
        });
        return;
      }

      const permissions =
        await this.permissionService.getAllPermissionsByFunction(
          applicationId as string
        );

      res.json({
        success: true,
        data: permissions,
      });
    } catch (error: any) {
      console.error('Error getting permissions grouped by function:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to get permissions',
      });
    }
  }
}
