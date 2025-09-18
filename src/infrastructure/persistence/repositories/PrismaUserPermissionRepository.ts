import { PrismaClient } from '@prisma/client';

import {
  CreateUserPermissionData,
  IUserPermissionRepository,
  UpdateUserPermissionData,
  UserPermissionFilters,
} from '../../../application/interfaces/IUserPermissionRepository';
import { UserPermission } from '../../../domain/entities/UserPermission';

export class PrismaUserPermissionRepository
  implements IUserPermissionRepository
{
  constructor(private prisma: PrismaClient) {}

  private convertNullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  async create(data: CreateUserPermissionData): Promise<UserPermission> {
    const userPermissionData = await this.prisma.userPermission.create({
      data: {
        user_id: data.userId,
        permission_id: data.permissionId,
        granted: data.granted ?? true,
        grantedBy: data.grantedBy,
      },
    });

    return UserPermission.fromPersistence({
      id: userPermissionData.userPermission_id,
      userId: userPermissionData.user_id,
      permissionId: userPermissionData.permission_id,
      granted: userPermissionData.granted,
      grantedBy: userPermissionData.grantedBy,
      createdAt: userPermissionData.created_at,
      updatedAt: userPermissionData.updated_at || userPermissionData.created_at,
      deletedAt: this.convertNullToUndefined(userPermissionData.deleted_at),
    });
  }

  async findById(
    id: string,
    includeDeleted = false
  ): Promise<UserPermission | null> {
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        userPermission_id: id,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!userPermission) return null;

    return UserPermission.fromPersistence({
      id: userPermission.userPermission_id,
      userId: userPermission.user_id,
      permissionId: userPermission.permission_id,
      granted: userPermission.granted,
      grantedBy: userPermission.grantedBy,
      createdAt: userPermission.created_at,
      updatedAt: userPermission.updated_at || userPermission.created_at,
      deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
    });
  }

  async findByUserAndPermission(
    userId: string,
    permissionId: string
  ): Promise<UserPermission | null> {
    const userPermission = await this.prisma.userPermission.findFirst({
      where: {
        user_id: userId,
        permission_id: permissionId,
        deleted_at: null,
      },
    });

    if (!userPermission) return null;

    return UserPermission.fromPersistence({
      id: userPermission.userPermission_id,
      userId: userPermission.user_id,
      permissionId: userPermission.permission_id,
      granted: userPermission.granted,
      grantedBy: userPermission.grantedBy,
      createdAt: userPermission.created_at,
      updatedAt: userPermission.updated_at || userPermission.created_at,
      deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
    });
  }

  async findByUser(
    userId: string,
    filters?: UserPermissionFilters
  ): Promise<UserPermission[]> {
    const where: any = {
      user_id: userId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.permissionId) {
      where.permission_id = filters.permissionId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    const userPermissions = await this.prisma.userPermission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return userPermissions.map(userPermission =>
      UserPermission.fromPersistence({
        id: userPermission.userPermission_id,
        userId: userPermission.user_id,
        permissionId: userPermission.permission_id,
        granted: userPermission.granted,
        grantedBy: userPermission.grantedBy,
        createdAt: userPermission.created_at,
        updatedAt: userPermission.updated_at || userPermission.created_at,
        deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
      })
    );
  }

  async findByPermission(
    permissionId: string,
    filters?: UserPermissionFilters
  ): Promise<UserPermission[]> {
    const where: any = {
      permission_id: permissionId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    const userPermissions = await this.prisma.userPermission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return userPermissions.map(userPermission =>
      UserPermission.fromPersistence({
        id: userPermission.userPermission_id,
        userId: userPermission.user_id,
        permissionId: userPermission.permission_id,
        granted: userPermission.granted,
        grantedBy: userPermission.grantedBy,
        createdAt: userPermission.created_at,
        updatedAt: userPermission.updated_at || userPermission.created_at,
        deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
      })
    );
  }

  async findAll(filters?: UserPermissionFilters): Promise<UserPermission[]> {
    const where: any = {
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.permissionId) {
      where.permission_id = filters.permissionId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    const userPermissions = await this.prisma.userPermission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return userPermissions.map(userPermission =>
      UserPermission.fromPersistence({
        id: userPermission.userPermission_id,
        userId: userPermission.user_id,
        permissionId: userPermission.permission_id,
        granted: userPermission.granted,
        grantedBy: userPermission.grantedBy,
        createdAt: userPermission.created_at,
        updatedAt: userPermission.updated_at || userPermission.created_at,
        deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
      })
    );
  }

  async update(
    id: string,
    data: UpdateUserPermissionData
  ): Promise<UserPermission | null> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.granted !== undefined) {
      updateData.granted = data.granted;
    }

    if (data.grantedBy !== undefined) {
      updateData.granted_by = data.grantedBy;
    }

    const userPermission = await this.prisma.userPermission.update({
      where: { userPermission_id: id },
      data: updateData,
    });

    return UserPermission.fromPersistence({
      id: userPermission.userPermission_id,
      userId: userPermission.user_id,
      permissionId: userPermission.permission_id,
      granted: userPermission.granted,
      grantedBy: userPermission.grantedBy,
      createdAt: userPermission.created_at,
      updatedAt: userPermission.updated_at || userPermission.created_at,
      deletedAt: this.convertNullToUndefined(userPermission.deleted_at),
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.userPermission.delete({
        where: { userPermission_id: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.userPermission.update({
        where: { userPermission_id: id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await this.prisma.userPermission.update({
        where: { userPermission_id: id },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });
      return true;
    } catch {
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.userPermission.count({
      where: {
        userPermission_id: id,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async existsByUserAndPermission(
    userId: string,
    permissionId: string
  ): Promise<boolean> {
    const count = await this.prisma.userPermission.count({
      where: {
        user_id: userId,
        permission_id: permissionId,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async count(filters?: UserPermissionFilters): Promise<number> {
    const where: any = {
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.permissionId) {
      where.permission_id = filters.permissionId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    return this.prisma.userPermission.count({ where });
  }

  async countByUser(
    userId: string,
    filters?: UserPermissionFilters
  ): Promise<number> {
    const where: any = {
      user_id: userId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.permissionId) {
      where.permission_id = filters.permissionId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    return this.prisma.userPermission.count({ where });
  }

  async countByPermission(
    permissionId: string,
    filters?: UserPermissionFilters
  ): Promise<number> {
    const where: any = {
      permission_id: permissionId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.granted !== undefined) {
      where.granted = filters.granted;
    }

    if (filters?.grantedBy) {
      where.granted_by = filters.grantedBy;
    }

    return this.prisma.userPermission.count({ where });
  }

  async grantPermission(
    userId: string,
    permissionId: string,
    grantedBy?: string
  ): Promise<UserPermission> {
    // Verificar se já existe
    const existing = await this.findByUserAndPermission(userId, permissionId);

    if (existing) {
      // Atualizar para granted
      const updated = await this.update(existing.id, {
        granted: true,
        grantedBy,
      });
      return updated as UserPermission;
    }

    // Criar nova permissão
    return this.create({
      userId,
      permissionId,
      granted: true,
      grantedBy,
    });
  }

  async revokePermission(
    userId: string,
    permissionId: string
  ): Promise<boolean> {
    const existing = await this.findByUserAndPermission(userId, permissionId);

    if (!existing) {
      return false;
    }

    return this.update(existing.id, { granted: false }) !== null;
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return this.findByUser(userId, { granted: true });
  }

  async hasPermission(
    userId: string,
    functionName: string,
    permissionLevel: string
  ): Promise<boolean> {
    const userPermissions = await this.prisma.userPermission.findMany({
      where: {
        user_id: userId,
        granted: true,
        deleted_at: null,
        permission: {
          function_name: functionName,
          permission_level: permissionLevel,
          deleted_at: null,
        },
      },
    });

    return userPermissions.length > 0;
  }

  async grantMultiplePermissions(
    userId: string,
    permissionIds: string[],
    grantedBy?: string
  ): Promise<UserPermission[]> {
    const results: UserPermission[] = [];

    for (const permissionId of permissionIds) {
      try {
        const userPermission = await this.grantPermission(
          userId,
          permissionId,
          grantedBy
        );
        results.push(userPermission);
      } catch (error) {
        console.error(
          `Error granting permission ${permissionId} to user ${userId}:`,
          error
        );
      }
    }

    return results;
  }

  async revokeMultiplePermissions(
    userId: string,
    permissionIds: string[]
  ): Promise<boolean> {
    let allSuccess = true;

    for (const permissionId of permissionIds) {
      try {
        const success = await this.revokePermission(userId, permissionId);
        if (!success) {
          allSuccess = false;
        }
      } catch (error) {
        console.error(
          `Error revoking permission ${permissionId} from user ${userId}:`,
          error
        );
        allSuccess = false;
      }
    }

    return allSuccess;
  }

  async replaceUserPermissions(
    userId: string,
    permissionIds: string[],
    grantedBy?: string
  ): Promise<UserPermission[]> {
    // Primeiro, revogar todas as permissões existentes
    const existingPermissions = await this.findByUser(userId);
    for (const permission of existingPermissions) {
      await this.softDelete(permission.id);
    }

    // Depois, conceder as novas permissões
    return this.grantMultiplePermissions(userId, permissionIds, grantedBy);
  }
}
