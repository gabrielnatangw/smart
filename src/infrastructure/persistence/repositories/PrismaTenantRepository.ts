import { PrismaClient } from '@prisma/client';

import {
  CreateTenantData,
  ITenantRepository,
  TenantFilters,
  UpdateTenantData,
} from '../../../application/interfaces/ITenantRepository';
import { Tenant } from '../../../domain/entities/Tenant';

export class PrismaTenantRepository implements ITenantRepository {
  constructor(private prisma: PrismaClient) {}

  private convertNullToUndefined<T>(value: T | null): T | undefined {
    return value === null ? undefined : value;
  }

  async create(data: CreateTenantData): Promise<Tenant> {
    const tenantData = await this.prisma.tenant.create({
      data: {
        name: data.name,
        cnpj: data.cnpj ?? null,
        address: data.address ?? null,
        is_active: data.isActive ?? true,
      },
    });

    return Tenant.fromPersistence({
      id: tenantData.tenant_id,
      name: tenantData.name,
      cnpj: this.convertNullToUndefined(tenantData.cnpj),
      address: this.convertNullToUndefined(tenantData.address),
      isActive: tenantData.is_active,
      createdAt: tenantData.created_at,
      updatedAt: (tenantData.updated_at || tenantData.created_at) as Date,
      deletedAt: this.convertNullToUndefined(tenantData.deleted_at),
    });
  }

  async findById(id: string, includeDeleted = false): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        tenant_id: id,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!tenant) {
      return null;
    }

    return Tenant.fromPersistence({
      id: tenant.tenant_id,
      name: tenant.name,
      cnpj: this.convertNullToUndefined(tenant.cnpj),
      address: this.convertNullToUndefined(tenant.address),
      isActive: tenant.is_active,
      createdAt: tenant.created_at,
      updatedAt: (tenant.updated_at || tenant.created_at) as Date,
      deletedAt: this.convertNullToUndefined(tenant.deleted_at),
    });
  }

  async findByCNPJ(
    cnpj: string,
    includeDeleted = false
  ): Promise<Tenant | null> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        cnpj,
        ...(includeDeleted ? {} : { deleted_at: null }),
      },
    });

    if (!tenant) {
      return null;
    }

    return Tenant.fromPersistence({
      id: tenant.tenant_id,
      name: tenant.name,
      cnpj: this.convertNullToUndefined(tenant.cnpj),
      address: this.convertNullToUndefined(tenant.address),
      isActive: tenant.is_active,
      createdAt: tenant.created_at,
      updatedAt: (tenant.updated_at || tenant.created_at) as Date,
      deletedAt: this.convertNullToUndefined(tenant.deleted_at),
    });
  }

  async findAll(filters?: TenantFilters): Promise<Tenant[]> {
    const whereClause = this.buildWhereClause(filters);

    const tenants = await this.prisma.tenant.findMany({
      where: whereClause,
      orderBy: {
        created_at: 'desc',
      },
    });

    return tenants.map((tenant: any) =>
      Tenant.fromPersistence({
        id: tenant.tenant_id,
        name: tenant.name,
        cnpj: tenant.cnpj,
        address: tenant.address,
        isActive: tenant.is_active,
        createdAt: tenant.created_at,
        updatedAt: tenant.updated_at,
        deletedAt: tenant.deleted_at,
      })
    );
  }

  async update(id: string, data: UpdateTenantData): Promise<Tenant | null> {
    try {
      const updatedTenant = await this.prisma.tenant.update({
        where: { tenant_id: id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.cnpj !== undefined && { cnpj: data.cnpj }),
          ...(data.address !== undefined && { address: data.address }),
          ...(data.isActive !== undefined && { is_active: data.isActive }),
          updated_at: new Date(),
        },
      });

      return Tenant.fromPersistence({
        id: updatedTenant.tenant_id,
        name: updatedTenant.name,
        cnpj: this.convertNullToUndefined(updatedTenant.cnpj),
        address: this.convertNullToUndefined(updatedTenant.address),
        isActive: updatedTenant.is_active,
        createdAt: updatedTenant.created_at,
        updatedAt: (updatedTenant.updated_at ||
          updatedTenant.created_at) as Date,
        deletedAt: this.convertNullToUndefined(updatedTenant.deleted_at),
      });
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.tenant.delete({
        where: { tenant_id: id },
      });
      return true;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.tenant.update({
        where: { tenant_id: id },
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
      await this.prisma.tenant.update({
        where: { tenant_id: id },
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
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        tenant_id: id,
        deleted_at: null,
      },
      select: { tenant_id: true },
    });

    return tenant !== null;
  }

  async existsByCNPJ(cnpj: string, excludeId?: string): Promise<boolean> {
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        cnpj,
        deleted_at: null,
        ...(excludeId && { tenant_id: { not: excludeId } }),
      },
      select: { tenant_id: true },
    });

    return tenant !== null;
  }

  async count(filters?: TenantFilters): Promise<number> {
    const whereClause = this.buildWhereClause(filters);

    return await this.prisma.tenant.count({
      where: whereClause,
    });
  }

  private buildWhereClause(filters?: TenantFilters): any {
    const whereClause: any = {};

    if (filters) {
      if (filters.name) {
        whereClause.name = {
          contains: filters.name,
          mode: 'insensitive',
        };
      }

      if (filters.cnpj) {
        whereClause.cnpj = filters.cnpj;
      }

      if (filters.isActive !== undefined) {
        whereClause.is_active = filters.isActive;
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
