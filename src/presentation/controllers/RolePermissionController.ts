import { Request, Response } from 'express';

import {
  RolePermissionResponseDTO,
  RolePermissionsResponseDTO,
} from '../../application/dto/RolePermissionDTO';
import { RolePermissionApplicationService } from '../../application/services/RolePermissionApplicationService';
import {
  addPermissionToRoleSchema,
  updateRolePermissionsSchema,
  validateRequest,
} from '../validators/rolePermissionValidators';

export class RolePermissionController {
  constructor(
    private rolePermissionService: RolePermissionApplicationService
  ) {}

  private mapToResponseDTO(permission: any): RolePermissionResponseDTO {
    return {
      id: permission.id,
      name: permission.name,
      displayName: permission.displayName,
      module: permission.module,
      description: permission.description,
      addedAt: permission.addedAt,
    };
  }

  async addPermissionToRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const { error, value } = validateRequest(
        addPermissionToRoleSchema,
        req.body
      );

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: [{ field: 'body', message: error }],
        });
        return;
      }

      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const rolePermission =
        await this.rolePermissionService.addPermissionToRole({
          roleId,
          permissionId: value?.permissionId || '',
          tenantId,
        });

      res.status(201).json({
        success: true,
        message: 'Permissão adicionada à role com sucesso',
        data: rolePermission,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async removePermissionFromRole(req: Request, res: Response): Promise<void> {
    try {
      const { roleId, permissionId } = req.params;

      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const result = await this.rolePermissionService.removePermissionFromRole({
        roleId,
        permissionId,
        tenantId,
      });

      if (result) {
        res.json({
          success: true,
          message: 'Permissão removida da role com sucesso',
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Permissão não encontrada na role',
        });
      }
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;

      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const permissions = await this.rolePermissionService.getRolePermissions({
        roleId,
        tenantId,
      });

      const response: RolePermissionsResponseDTO = {
        roleId,
        roleName: '', // Será preenchido se necessário
        permissions: permissions.map(permission =>
          this.mapToResponseDTO(permission)
        ),
      };

      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async updateRolePermissions(req: Request, res: Response): Promise<void> {
    try {
      const { roleId } = req.params;
      const { error, value } = validateRequest(
        updateRolePermissionsSchema,
        req.body
      );

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: [{ field: 'body', message: error }],
        });
        return;
      }

      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const permissions =
        await this.rolePermissionService.updateRolePermissions(
          roleId,
          value?.permissionIds || [],
          tenantId
        );

      res.json({
        success: true,
        message: 'Permissões da role atualizadas com sucesso',
        data: {
          roleId,
          permissions: permissions.map(permission =>
            this.mapToResponseDTO(permission)
          ),
        },
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('RolePermissionController Error:', error);

    if (error.message === 'Role not found or does not belong to tenant') {
      res.status(404).json({
        success: false,
        message: 'Role não encontrada ou não pertence ao tenant',
      });
      return;
    }

    if (error.message === 'Permission not found') {
      res.status(404).json({
        success: false,
        message: 'Permissão não encontrada',
      });
      return;
    }

    if (error.message === 'Permission already exists for this role') {
      res.status(409).json({
        success: false,
        message: 'Permissão já existe nesta role',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
