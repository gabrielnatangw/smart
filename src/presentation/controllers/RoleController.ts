import { Request, Response } from 'express';

import { RoleResponseDTO } from '../../application/dto/RoleDTO';
import { RoleFilters } from '../../application/interfaces/IRoleRepository';
import { RoleApplicationService } from '../../application/services/RoleApplicationService';
import { RolePermissionApplicationService } from '../../application/services/RolePermissionApplicationService';
import { Role } from '../../domain/entities/Role';
import {
  createRoleSchema,
  deleteRoleSchema,
  getRoleByIdSchema,
  roleStatsSchema,
  searchRolesSchema,
  updateRoleSchema,
  validateRequest,
} from '../validators/roleValidators';

export class RoleController {
  constructor(
    private roleService: RoleApplicationService,
    private rolePermissionService: RolePermissionApplicationService
  ) {}

  private mapToResponseDTO(role: Role | any): RoleResponseDTO {
    const response: RoleResponseDTO = {
      id: role.id,
      name: role.name,
      description: role.description,
      tenantId: role.tenantId,
      isActive: role.isActive ?? true,
      createdAt: role.createdAt,
      isDeleted: role.isDeleted,
    };

    if (role.updatedAt !== undefined) {
      response.updatedAt = role.updatedAt;
    }

    if (role.deletedAt !== undefined) {
      response.deletedAt = role.deletedAt;
    }

    // Se o objeto já tem as relações (vem do findAllWithRelations)
    if (role.permissions) {
      response.permissions = role.permissions;
    }

    if (role.users) {
      response.users = role.users;
    }

    return response;
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(createRoleSchema, req.body);

      if (error) {
        res.status(400).json({ error });
        return;
      }

      // Obter tenantId do usuário autenticado
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const role = await this.roleService.createRole({
        name: value?.name || '',
        description: value?.description || '',
        tenantId: tenantId,
        isActive: value?.isActive ?? true,
      });

      // Se permissionIds foi fornecido, adicionar as permissões à role
      if (value?.permissionIds && value.permissionIds.length > 0) {
        await this.rolePermissionService.updateRolePermissions(
          role.id,
          value.permissionIds,
          tenantId
        );
      }

      const response = this.mapToResponseDTO(role);
      res.status(201).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(getRoleByIdSchema, {
        id: req.params.id,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [{ field: 'id', message: 'Invalid role ID format' }],
        });
        return;
      }

      // Obter tenantId do usuário autenticado
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const role = await this.roleService.getRoleByIdWithRelations(
        value?.id || ''
      );
      const response = this.mapToResponseDTO(role);
      res.json({ success: true, data: response });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = req.query;

      if (!name) {
        res.status(400).json({
          success: false,
          message: 'Role name is required',
        });
        return;
      }

      // Obter tenantId do usuário autenticado
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const role = await this.roleService.getRoleByName(
        name as string,
        tenantId
      );

      if (!role) {
        res.status(404).json({
          success: false,
          message: 'Role not found',
        });
        return;
      }

      const response = this.mapToResponseDTO(role);
      res.json({ success: true, data: response });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(searchRolesSchema, req.query);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'query', message: error }],
        });
        return;
      }

      // Obter tenantId do usuário autenticado
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({ error: 'Tenant ID not found in request' });
        return;
      }

      const { page = 1, limit = 10, ...rawFilters } = value || {};

      // Clean filters to match RoleFilters interface
      const filters: RoleFilters = {
        tenantId: tenantId, // Sempre filtrar por tenant
      };

      if (rawFilters && 'name' in rawFilters && rawFilters.name !== undefined) {
        filters.name = rawFilters.name;
      }

      if (
        rawFilters &&
        'description' in rawFilters &&
        rawFilters.description !== undefined
      ) {
        filters.description = rawFilters.description;
      }

      if (
        rawFilters &&
        'isDeleted' in rawFilters &&
        rawFilters.isDeleted !== undefined
      ) {
        filters.isDeleted = rawFilters.isDeleted;
      }

      const roles = await this.roleService.getAllRolesWithRelations(filters);
      const total = await this.roleService.getRoleCount(filters);

      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = roles.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: {
          roles: paginatedData.map(role => this.mapToResponseDTO(role)),
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: endIndex < total,
            hasPrev: page > 1,
          },
        },
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(roleStatsSchema, req.query);

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'query', message: error }],
        });
        return;
      }

      const stats = await this.roleService.getRoleStats(value || {});

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { error: idError, value: idValue } = validateRequest(
        getRoleByIdSchema,
        {
          id: req.params.id,
        }
      );

      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [{ field: 'id', message: 'Invalid role ID format' }],
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = validateRequest(
        updateRoleSchema,
        req.body
      );

      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: [{ field: 'body', message: bodyError }],
        });
        return;
      }

      const role = await this.roleService.updateRole(
        idValue?.id || '',
        bodyValue || {}
      );

      // Se permissionIds foi fornecido, atualizar as permissões da role
      if (bodyValue?.permissionIds !== undefined) {
        const tenantId = (req as any).user?.tenantId;
        if (tenantId) {
          await this.rolePermissionService.updateRolePermissions(
            idValue?.id || '',
            bodyValue.permissionIds,
            tenantId
          );
        }
      }

      const response = this.mapToResponseDTO(role);

      res.json({
        success: true,
        message: 'Role updated successfully',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(deleteRoleSchema, {
        id: req.params.id,
        permanent: req.query.permanent,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'params', message: error }],
        });
        return;
      }

      const success = await this.roleService.deleteRole(value?.id || '');

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete role',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Role deleted successfully',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(getRoleByIdSchema, {
        id: req.params.id,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [{ field: 'id', message: 'Invalid role ID format' }],
        });
        return;
      }

      const success = await this.roleService.restoreRole(value?.id || '');

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to restore role',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Role restored successfully',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('Role Controller Error:', error);

    if (error.message === 'Role not found') {
      res.status(404).json({
        success: false,
        message: 'Role not found',
      });
      return;
    }

    if (error.message === 'Role name already exists') {
      res.status(409).json({
        success: false,
        message: 'Role name already exists',
      });
      return;
    }

    if (error.message === 'Cannot update deleted role') {
      res.status(409).json({
        success: false,
        message: 'Cannot update deleted role',
      });
      return;
    }

    if (error.message === 'Role is already deleted') {
      res.status(409).json({
        success: false,
        message: 'Role is already deleted',
      });
      return;
    }

    if (error.message === 'Role is not deleted') {
      res.status(409).json({
        success: false,
        message: 'Role is not deleted',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
}
