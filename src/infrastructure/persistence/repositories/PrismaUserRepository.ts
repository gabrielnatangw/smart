import { PrismaClient } from '@prisma/client';

import {
  CreateUserData,
  IUserRepository,
  UpdateUserData,
  UserFilters,
} from '../../../application/interfaces/IUserRepository';
import { User, UserType } from '../../../domain/entities/User';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  private convertNullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  async create(data: CreateUserData): Promise<User> {
    const userData = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.password,
        user_type: data.userType,
        tenant_id: data.tenantId,
        first_login: data.firstLogin ?? true,
        is_active: data.isActive ?? true,
      },
    });

    return User.fromPersistence({
      id: userData.user_id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      userType: userData.user_type as UserType,
      tenantId: userData.tenant_id || undefined,
      firstLogin: userData.first_login,
      isActive: userData.is_active,
      createdAt: userData.created_at,
      updatedAt: (userData.updated_at || userData.created_at) as Date,
      deletedAt: this.convertNullToUndefined(userData.deleted_at),
    });
  }

  async findById(id: string, includeDeleted = false): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: id,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!user) {
      return null;
    }

    return User.fromPersistence({
      id: user.user_id,
      name: user.name,
      email: user.email,
      password: user.password,
      userType: user.user_type as UserType,
      tenantId: user.tenant_id,
      firstLogin: user.first_login,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: (user.updated_at || user.created_at) as Date,
      deletedAt: this.convertNullToUndefined(user.deleted_at),
    });
  }

  async findByEmail(
    email: string,
    includeDeleted = false
  ): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!user) {
      return null;
    }

    return User.fromPersistence({
      id: user.user_id,
      name: user.name,
      email: user.email,
      password: user.password,
      userType: user.user_type as UserType,
      tenantId: user.tenant_id,
      firstLogin: user.first_login,
      isActive: user.is_active,
      createdAt: user.created_at,
      updatedAt: (user.updated_at || user.created_at) as Date,
      deletedAt: this.convertNullToUndefined(user.deleted_at),
    });
  }

  async findByTenant(tenantId: string, filters?: UserFilters): Promise<User[]> {
    const whereClause = this.buildWhereClause({ ...filters, tenantId });

    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
    });

    return users.map((user: any) =>
      User.fromPersistence({
        id: user.user_id,
        name: user.name,
        email: user.email,
        password: user.password,
        userType: user.user_type as UserType,
        tenantId: user.tenant_id,
        firstLogin: user.first_login,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: (user.updated_at || user.created_at) as Date,
        deletedAt: this.convertNullToUndefined(user.deleted_at),
      })
    );
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    const whereClause = this.buildWhereClause(filters);
    const { offset, limit } = filters || {};

    const users = await this.prisma.user.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
      ...(offset !== undefined && { skip: offset }),
      ...(limit !== undefined && { take: limit }),
    });

    return users.map((user: any) =>
      User.fromPersistence({
        id: user.user_id,
        name: user.name,
        email: user.email,
        password: user.password,
        userType: user.user_type as UserType,
        tenantId: user.tenant_id,
        firstLogin: user.first_login,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: (user.updated_at || user.created_at) as Date,
        deletedAt: this.convertNullToUndefined(user.deleted_at),
      })
    );
  }

  async update(id: string, data: UpdateUserData): Promise<User | null> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { user_id: id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.password !== undefined && { password: data.password }),
          ...(data.userType !== undefined && { user_type: data.userType }),
          ...(data.isActive !== undefined && { is_active: data.isActive }),
          ...(data.firstLogin !== undefined && {
            first_login: data.firstLogin,
          }),
          updated_at: new Date(),
        },
      });

      return User.fromPersistence({
        id: updatedUser.user_id,
        name: updatedUser.name,
        email: updatedUser.email,
        password: updatedUser.password,
        userType: updatedUser.user_type as UserType,
        tenantId: updatedUser.tenant_id,
        firstLogin: updatedUser.first_login,
        isActive: updatedUser.is_active,
        createdAt: updatedUser.created_at,
        updatedAt: (updatedUser.updated_at || updatedUser.created_at) as Date,
        deletedAt: this.convertNullToUndefined(updatedUser.deleted_at),
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({
        where: { user_id: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.update({
        where: { user_id: id },
        data: {
          deleted_at: new Date(),
          is_active: false,
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
      await this.prisma.user.update({
        where: { user_id: id },
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
    const user = await this.prisma.user.findFirst({
      where: {
        user_id: id,
        deleted_at: null,
      },
      select: { user_id: true },
    });

    return user !== null;
  }

  async existsByEmail(email: string, excludeId?: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
        ...(excludeId && { user_id: { not: excludeId } }),
      },
      select: { user_id: true },
    });

    return user !== null;
  }

  async count(filters?: UserFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters);

    return await this.prisma.user.count({
      where: whereClause,
    });
  }

  async countByTenant(
    tenantId: string,
    filters?: UserFilters
  ): Promise<number> {
    return this.count({ ...filters, tenantId });
  }

  async findTenantAdmins(tenantId: string): Promise<User[]> {
    return this.findByTenant(tenantId, {
      userType: UserType.ADMIN,
      isActive: true,
    });
  }

  async findFirstTenantAdmin(tenantId: string): Promise<User | null> {
    const admins = await this.findTenantAdmins(tenantId);
    return admins.length > 0 ? (admins[0] ?? null) : null;
  }

  private buildWhereClause(filters?: UserFilters): any {
    const whereClause: any = {};

    if (filters) {
      if (filters.name) {
        whereClause.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.email) {
        whereClause.email = {
          contains: filters.email,
          mode: 'insensitive',
        };
      }

      if (filters.userType) {
        whereClause.user_type = filters.userType;
      }

      if (filters.isActive !== undefined) {
        whereClause.is_active = filters.isActive;
      }

      if (filters.firstLogin !== undefined) {
        whereClause.first_login = filters.firstLogin;
      }

      if (filters.tenantId) {
        whereClause.tenant_id = filters.tenantId;
      }

      if (!filters.includeDeleted) {
        whereClause.deleted_at = null;
      }
    } else {
      whereClause.deleted_at = null;
    }

    return whereClause;
  }
}
