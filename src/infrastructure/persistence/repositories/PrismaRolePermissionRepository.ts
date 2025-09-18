import { PrismaClient } from '@prisma/client';

import {
  CreateRolePermissionData,
  IRolePermissionRepository,
} from '../../../application/interfaces/IRolePermissionRepository';

export class PrismaRolePermissionRepository
  implements IRolePermissionRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateRolePermissionData): Promise<any> {
    try {
      const rolePermission = await this.prisma.rolePermission.create({
        data: {
          role_id: data.roleId,
          permission_id: data.permissionId,
        },
        include: {
          permission: true,
          role: true,
        },
      });

      return rolePermission;
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new Error('Permission already exists for this role');
      }
      throw new Error(`Failed to create role permission: ${error.message}`);
    }
  }

  async findByRoleId(roleId: string): Promise<any[]> {
    try {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: {
          role_id: roleId,
          deleted_at: null,
        },
        include: {
          permission: true,
        },
      });

      return rolePermissions;
    } catch (error: any) {
      throw new Error(`Failed to find role permissions: ${error.message}`);
    }
  }

  async findByPermissionId(permissionId: string): Promise<any[]> {
    try {
      const rolePermissions = await this.prisma.rolePermission.findMany({
        where: {
          permission_id: permissionId,
          deleted_at: null,
        },
        include: {
          role: true,
        },
      });

      return rolePermissions;
    } catch (error: any) {
      throw new Error(`Failed to find permission roles: ${error.message}`);
    }
  }

  async delete(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const result = await this.prisma.rolePermission.updateMany({
        where: {
          role_id: roleId,
          permission_id: permissionId,
          deleted_at: null,
        },
        data: {
          deleted_at: new Date(),
        },
      });

      return result.count > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete role permission: ${error.message}`);
    }
  }

  async deleteByRoleId(roleId: string): Promise<boolean> {
    try {
      const result = await this.prisma.rolePermission.deleteMany({
        where: {
          role_id: roleId,
        },
      });

      return result.count > 0;
    } catch (error: any) {
      throw new Error(`Failed to delete role permissions: ${error.message}`);
    }
  }

  async exists(roleId: string, permissionId: string): Promise<boolean> {
    try {
      const rolePermission = await this.prisma.rolePermission.findFirst({
        where: {
          role_id: roleId,
          permission_id: permissionId,
          deleted_at: null,
        },
      });

      return !!rolePermission;
    } catch (error: any) {
      throw new Error(
        `Failed to check role permission existence: ${error.message}`
      );
    }
  }
}
