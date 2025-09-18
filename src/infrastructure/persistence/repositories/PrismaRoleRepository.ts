import { PrismaClient } from '@prisma/client';

import {
  CreateRoleData,
  IRoleRepository,
  RoleFilters,
  UpdateRoleData,
} from '../../../application/interfaces/IRoleRepository';
import { Role } from '../../../domain/entities/Role';

export class PrismaRoleRepository implements IRoleRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToRole(roleData: any): Role {
    return Role.fromPersistence({
      id: roleData.role_id,
      name: roleData.name,
      description: roleData.description,
      tenantId: roleData.tenant_id,
      isActive: roleData.isActive ?? true,
      createdAt: roleData.created_at,
      updatedAt: roleData.updated_at ?? undefined,
      deletedAt: roleData.deleted_at ?? undefined,
    });
  }

  private mapDatabaseToRoleWithRelations(roleData: any): any {
    return {
      id: roleData.role_id,
      name: roleData.name,
      description: roleData.description,
      tenantId: roleData.tenant_id,
      isActive: roleData.isActive ?? true,
      createdAt: roleData.created_at,
      updatedAt: roleData.updated_at ?? undefined,
      deletedAt: roleData.deleted_at ?? undefined,
      isDeleted: !!roleData.deleted_at,
      permissions:
        roleData.permissions?.map((rp: any) => ({
          id: rp.permission.permission_id,
          name: rp.permission.name,
          displayName: rp.permission.displayName,
          module: rp.permission.module,
          description: rp.permission.description,
        })) || [],
      users:
        roleData.users?.map((ur: any) => ({
          id: ur.user.user_id,
          name: ur.user.name,
          email: ur.user.email,
          accessType: ur.user.user_type,
        })) || [],
    };
  }

  async create(data: CreateRoleData): Promise<Role> {
    try {
      const existingRole = await this.prisma.role.findFirst({
        where: {
          name: data.name,
          tenant_id: data.tenantId,
          deleted_at: null,
        },
      });

      if (existingRole) {
        throw new Error('Role name already exists for this tenant');
      }

      const roleData = await this.prisma.role.create({
        data: {
          name: data.name,
          description: data.description,
          tenant_id: data.tenantId,
          isActive: data.isActive ?? true,
        },
      });

      return this.mapDatabaseToRole(roleData);
    } catch (error: any) {
      if (error.message === 'Role name already exists for this tenant') {
        throw error;
      }
      throw new Error(`Failed to create role: ${error.message}`);
    }
  }

  async findById(id: string, tenantId?: string): Promise<Role | null> {
    try {
      const whereClause: any = {
        role_id: id,
      };

      if (tenantId) {
        whereClause.tenant_id = tenantId;
      }

      const roleData = await this.prisma.role.findUnique({
        where: whereClause,
      });

      return roleData ? this.mapDatabaseToRole(roleData) : null;
    } catch (error: any) {
      throw new Error(`Failed to find role by id: ${error.message}`);
    }
  }

  async findByName(name: string, tenantId?: string): Promise<Role | null> {
    try {
      const whereClause: any = {
        name,
      };

      if (tenantId) {
        whereClause.tenant_id = tenantId;
      }

      const roleData = await this.prisma.role.findFirst({
        where: whereClause,
      });

      return roleData ? this.mapDatabaseToRole(roleData) : null;
    } catch (error: any) {
      throw new Error(`Failed to find role by name: ${error.message}`);
    }
  }

  async findAll(filters: RoleFilters): Promise<Role[]> {
    try {
      const where: any = {};

      if (filters.name) {
        where.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        where.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.tenantId) {
        where.tenant_id = filters.tenantId;
      }

      if (filters.isDeleted !== undefined) {
        where.deleted_at = filters.isDeleted ? { not: null } : null;
      }

      const rolesData = await this.prisma.role.findMany({
        where,
        orderBy: {
          created_at: 'desc',
        },
      });

      return rolesData.map(roleData => this.mapDatabaseToRole(roleData));
    } catch (error: any) {
      throw new Error(`Failed to find roles: ${error.message}`);
    }
  }

  async findByTenantId(tenantId: string): Promise<Role[]> {
    try {
      const rolesData = await this.prisma.role.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return rolesData.map(roleData => this.mapDatabaseToRole(roleData));
    } catch (error: any) {
      throw new Error(`Failed to find roles by tenant: ${error.message}`);
    }
  }

  async findByIdWithRelations(id: string): Promise<any> {
    try {
      const roleData = await this.prisma.role.findUnique({
        where: { role_id: id },
        include: {
          permissions: {
            where: { deleted_at: null },
            include: {
              permission: true,
            },
          },
          users: {
            where: { user: { deleted_at: null } },
            include: {
              user: {
                select: {
                  user_id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!roleData) {
        return null;
      }

      return this.mapDatabaseToRoleWithRelations(roleData);
    } catch (error: any) {
      throw new Error(`Failed to find role with relations: ${error.message}`);
    }
  }

  async findAllWithRelations(filters: RoleFilters): Promise<any[]> {
    try {
      const where: any = {};

      // Para administradores, mostrar roles de todos os tenants
      // if (filters.tenantId) {
      //   where.tenant_id = filters.tenantId;
      // }

      if (filters.name) {
        where.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        where.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.isDeleted !== undefined) {
        if (filters.isDeleted) {
          where.deleted_at = { not: null };
        } else {
          where.deleted_at = null;
        }
      }

      const rolesData = await this.prisma.role.findMany({
        where,
        include: {
          permissions: {
            where: { deleted_at: null },
            include: {
              permission: true,
            },
          },
          users: {
            where: { user: { deleted_at: null } },
            include: {
              user: {
                select: {
                  user_id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      return rolesData.map(roleData =>
        this.mapDatabaseToRoleWithRelations(roleData)
      );
    } catch (error: any) {
      throw new Error(`Failed to find roles with relations: ${error.message}`);
    }
  }

  async update(id: string, data: UpdateRoleData): Promise<Role> {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { role_id: id },
      });

      if (!existingRole) {
        throw new Error('Role not found');
      }

      if (existingRole.deleted_at !== null) {
        throw new Error('Cannot update deleted role');
      }

      if (data.name && data.name !== existingRole.name) {
        const nameExists = await this.prisma.role.findFirst({
          where: {
            name: data.name,
            role_id: { not: id },
            deleted_at: null,
          },
        });

        if (nameExists) {
          throw new Error('Role name already exists');
        }
      }

      const updateData: any = {
        updated_at: new Date(),
      };

      if (data.name !== undefined) {
        updateData.name = data.name;
      }

      if (data.description !== undefined) {
        updateData.description = data.description;
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      const updatedRole = await this.prisma.role.update({
        where: { role_id: id },
        data: updateData,
      });

      return this.mapDatabaseToRole(updatedRole);
    } catch (error: any) {
      if (
        error.message === 'Role not found' ||
        error.message === 'Cannot update deleted role' ||
        error.message === 'Role name already exists'
      ) {
        throw error;
      }
      throw new Error(`Failed to update role: ${error.message}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { role_id: id },
      });

      if (!existingRole) {
        throw new Error('Role not found');
      }

      if (existingRole.deleted_at !== null) {
        throw new Error('Role is already deleted');
      }

      await this.prisma.role.update({
        where: { role_id: id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });

      return true;
    } catch (error: any) {
      if (
        error.message === 'Role not found' ||
        error.message === 'Role is already deleted'
      ) {
        throw error;
      }
      throw new Error(`Failed to delete role: ${error.message}`);
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      const existingRole = await this.prisma.role.findUnique({
        where: { role_id: id },
      });

      if (!existingRole) {
        throw new Error('Role not found');
      }

      if (existingRole.deleted_at === null) {
        throw new Error('Role is not deleted');
      }

      const nameExists = await this.prisma.role.findFirst({
        where: {
          name: existingRole.name,
          role_id: { not: id },
          deleted_at: null,
        },
      });

      if (nameExists) {
        throw new Error('Role name already exists');
      }

      await this.prisma.role.update({
        where: { role_id: id },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });

      return true;
    } catch (error: any) {
      if (
        error.message === 'Role not found' ||
        error.message === 'Role is not deleted' ||
        error.message === 'Role name already exists'
      ) {
        throw error;
      }
      throw new Error(`Failed to restore role: ${error.message}`);
    }
  }

  async count(filters: RoleFilters): Promise<number> {
    try {
      const where: any = {};

      if (filters.name) {
        where.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.description) {
        where.description = {
          contains: filters.description,
          mode: 'insensitive',
        };
      }

      if (filters.tenantId) {
        where.tenant_id = filters.tenantId;
      }

      if (filters.isDeleted !== undefined) {
        where.deleted_at = filters.isDeleted ? { not: null } : null;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      return await this.prisma.role.count({ where });
    } catch (error: any) {
      throw new Error(`Failed to count roles: ${error.message}`);
    }
  }
}
