import { PrismaClient } from '@prisma/client';

import {
  CreatePermissionData,
  IPermissionRepository,
  PermissionFilters,
  UpdatePermissionData,
} from '../../../application/interfaces/IPermissionRepository';
import { Permission } from '../../../domain/entities/Permission';

export class PrismaPermissionRepository implements IPermissionRepository {
  constructor(private prisma: PrismaClient) {}

  private convertNullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  async create(data: CreatePermissionData): Promise<Permission> {
    const permissionData = await this.prisma.permission.create({
      data: {
        function_name: data.functionName,
        permission_level: data.permissionLevel,
        display_name: data.displayName,
        description: data.description,
        application_id: data.applicationId,
      },
    });

    return Permission.fromPersistence({
      id: permissionData.permission_id,
      functionName: permissionData.function_name,
      permissionLevel: permissionData.permission_level,
      displayName: permissionData.display_name,
      description: permissionData.description,
      applicationId: permissionData.application_id,
      createdAt: permissionData.created_at,
      updatedAt: permissionData.updated_at || permissionData.created_at,
      deletedAt: this.convertNullToUndefined(permissionData.deleted_at),
    });
  }

  async findById(
    id: string,
    includeDeleted = false
  ): Promise<Permission | null> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        permission_id: id,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!permission) return null;

    return Permission.fromPersistence({
      id: permission.permission_id,
      functionName: permission.function_name,
      permissionLevel: permission.permission_level,
      displayName: permission.display_name,
      description: permission.description,
      applicationId: permission.application_id,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at || permission.created_at,
      deletedAt: this.convertNullToUndefined(permission.deleted_at),
    });
  }

  async findByFunctionAndLevel(
    functionName: string,
    permissionLevel: string,
    applicationId: string
  ): Promise<Permission | null> {
    const permission = await this.prisma.permission.findFirst({
      where: {
        function_name: functionName,
        permission_level: permissionLevel,
        application_id: applicationId,
        deleted_at: null,
      },
    });

    if (!permission) return null;

    return Permission.fromPersistence({
      id: permission.permission_id,
      functionName: permission.function_name,
      permissionLevel: permission.permission_level,
      displayName: permission.display_name,
      description: permission.description,
      applicationId: permission.application_id,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at || permission.created_at,
      deletedAt: this.convertNullToUndefined(permission.deleted_at),
    });
  }

  async findByApplication(
    applicationId: string,
    filters?: PermissionFilters
  ): Promise<Permission[]> {
    const where: any = {
      application_id: applicationId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.functionName) {
      where.function_name = filters.functionName;
    }

    if (filters?.permissionLevel) {
      where.permission_level = filters.permissionLevel;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return permissions.map(permission =>
      Permission.fromPersistence({
        id: permission.permission_id,
        functionName: permission.function_name,
        permissionLevel: permission.permission_level,
        displayName: permission.display_name,
        description: permission.description,
        applicationId: permission.application_id,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at || permission.created_at,
        deletedAt: this.convertNullToUndefined(permission.deleted_at),
      })
    );
  }

  async findByTenant(
    tenantId: string,
    filters?: PermissionFilters
  ): Promise<Permission[]> {
    // Buscar aplicações do tenant primeiro
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        tenant_id: tenantId,
        isActive: true,
      },
      select: {
        application_id: true,
      },
    });

    const applicationIds = tenantSubscriptions.map(sub => sub.application_id);

    if (applicationIds.length === 0) {
      return [];
    }

    const where: any = {
      application_id: { in: applicationIds },
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.functionName) {
      where.function_name = filters.functionName;
    }

    if (filters?.permissionLevel) {
      where.permission_level = filters.permissionLevel;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return permissions.map(permission =>
      Permission.fromPersistence({
        id: permission.permission_id,
        functionName: permission.function_name,
        permissionLevel: permission.permission_level,
        displayName: permission.display_name,
        description: permission.description,
        applicationId: permission.application_id,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at || permission.created_at,
        deletedAt: this.convertNullToUndefined(permission.deleted_at),
      })
    );
  }

  async findAll(filters?: PermissionFilters): Promise<Permission[]> {
    const where: any = {
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.functionName) {
      where.function_name = filters.functionName;
    }

    if (filters?.permissionLevel) {
      where.permission_level = filters.permissionLevel;
    }

    if (filters?.applicationId) {
      where.application_id = filters.applicationId;
    }

    const permissions = await this.prisma.permission.findMany({
      where,
      orderBy: { created_at: 'desc' },
      ...(filters?.page && filters?.limit
        ? {
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
          }
        : {}),
    });

    return permissions.map(permission =>
      Permission.fromPersistence({
        id: permission.permission_id,
        functionName: permission.function_name,
        permissionLevel: permission.permission_level,
        displayName: permission.display_name,
        description: permission.description,
        applicationId: permission.application_id,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at || permission.created_at,
        deletedAt: this.convertNullToUndefined(permission.deleted_at),
      })
    );
  }

  async update(
    id: string,
    data: UpdatePermissionData
  ): Promise<Permission | null> {
    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.displayName !== undefined) {
      updateData.display_name = data.displayName;
    }

    if (data.description !== undefined) {
      updateData.description = data.description;
    }

    const permission = await this.prisma.permission.update({
      where: { permission_id: id },
      data: updateData,
    });

    return Permission.fromPersistence({
      id: permission.permission_id,
      functionName: permission.function_name,
      permissionLevel: permission.permission_level,
      displayName: permission.display_name,
      description: permission.description,
      applicationId: permission.application_id,
      createdAt: permission.created_at,
      updatedAt: permission.updated_at || permission.created_at,
      deletedAt: this.convertNullToUndefined(permission.deleted_at),
    });
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.permission.delete({
        where: { permission_id: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.permission.update({
        where: { permission_id: id },
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
      await this.prisma.permission.update({
        where: { permission_id: id },
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
    const count = await this.prisma.permission.count({
      where: {
        permission_id: id,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async existsByFunctionAndLevel(
    functionName: string,
    permissionLevel: string,
    applicationId: string
  ): Promise<boolean> {
    const count = await this.prisma.permission.count({
      where: {
        function_name: functionName,
        permission_level: permissionLevel,
        application_id: applicationId,
        deleted_at: null,
      },
    });
    return count > 0;
  }

  async count(filters?: PermissionFilters): Promise<number> {
    const where: any = {
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.functionName) {
      where.function_name = filters.functionName;
    }

    if (filters?.permissionLevel) {
      where.permission_level = filters.permissionLevel;
    }

    if (filters?.applicationId) {
      where.application_id = filters.applicationId;
    }

    return this.prisma.permission.count({ where });
  }

  async countByApplication(
    applicationId: string,
    filters?: PermissionFilters
  ): Promise<number> {
    const where: any = {
      application_id: applicationId,
      ...(filters?.includeDeleted ? {} : { deleted_at: null }),
    };

    if (filters?.functionName) {
      where.function_name = filters.functionName;
    }

    if (filters?.permissionLevel) {
      where.permission_level = filters.permissionLevel;
    }

    return this.prisma.permission.count({ where });
  }

  async getPermissionsByFunction(
    functionName: string,
    applicationId: string
  ): Promise<Permission[]> {
    const permissions = await this.prisma.permission.findMany({
      where: {
        function_name: functionName,
        application_id: applicationId,
        deleted_at: null,
      },
      orderBy: { permission_level: 'asc' },
    });

    return permissions.map(permission =>
      Permission.fromPersistence({
        id: permission.permission_id,
        functionName: permission.function_name,
        permissionLevel: permission.permission_level,
        displayName: permission.display_name,
        description: permission.description,
        applicationId: permission.application_id,
        createdAt: permission.created_at,
        updatedAt: permission.updated_at || permission.created_at,
        deletedAt: this.convertNullToUndefined(permission.deleted_at),
      })
    );
  }

  async getAvailableFunctions(applicationId: string): Promise<string[]> {
    const result = await this.prisma.permission.findMany({
      where: {
        application_id: applicationId,
        deleted_at: null,
      },
      select: {
        function_name: true,
      },
      distinct: ['function_name'],
      orderBy: { function_name: 'asc' },
    });

    return result.map(p => p.function_name);
  }

  async getAvailableLevels(
    functionName: string,
    applicationId: string
  ): Promise<string[]> {
    const result = await this.prisma.permission.findMany({
      where: {
        function_name: functionName,
        application_id: applicationId,
        deleted_at: null,
      },
      select: {
        permission_level: true,
      },
      distinct: ['permission_level'],
      orderBy: { permission_level: 'asc' },
    });

    return result.map(p => p.permission_level);
  }
}
