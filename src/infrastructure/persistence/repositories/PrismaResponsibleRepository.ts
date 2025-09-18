import { PrismaClient } from '@prisma/client';

import { IResponsibleRepository } from '../../../application/interfaces/IResponsibleRepository';
import {
  CreateResponsibleRequest,
  PaginatedResponsiblesResponse,
  Responsible,
  ResponsibleStatistics,
  ResponsibleWithCategory,
  UpdateResponsibleRequest,
} from '../../../domain/entities/Responsible';

export class PrismaResponsibleRepository implements IResponsibleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible> {
    const responsible = await this.prisma.responsible.create({
      data: {
        name: data.name,
        code_responsible: data.codeResponsible,
        tenant_id: tenantId,
        category_responsible_id: data.categoryResponsibleId || null,
      },
    });

    return this.mapToEntity(responsible);
  }

  async findById(
    responsibleId: string,
    tenantId: string
  ): Promise<Responsible | null> {
    const responsible = await this.prisma.responsible.findFirst({
      where: {
        responsible_id: responsibleId,
        tenant_id: tenantId,
      },
    });

    return responsible ? this.mapToEntity(responsible) : null;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      includeDeleted?: boolean;
      includeCategory?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedResponsiblesResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      includeDeleted = false,
      includeCategory = false,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code_responsible: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [responsibles, total] = await Promise.all([
      this.prisma.responsible.findMany({
        where,
        skip,
        take: limit,
        include: includeCategory
          ? {
              categoryResponsible: {
                select: {
                  category_responsible_id: true,
                  category_responsible: true,
                },
              },
            }
          : undefined,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.responsible.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      responsibles: responsibles.map(responsible =>
        this.mapToEntityWithCategory(responsible)
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    responsibleId: string,
    data: UpdateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible> {
    const responsible = await this.prisma.responsible.update({
      where: {
        responsible_id: responsibleId,
        tenant_id: tenantId,
      },
      data: {
        name: data.name,
        code_responsible: data.codeResponsible,
        category_responsible_id: data.categoryResponsibleId || null,
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(responsible);
  }

  async delete(responsibleId: string, tenantId: string): Promise<void> {
    await this.prisma.responsible.update({
      where: {
        responsible_id: responsibleId,
        tenant_id: tenantId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async restore(responsibleId: string, tenantId: string): Promise<Responsible> {
    const responsible = await this.prisma.responsible.update({
      where: {
        responsible_id: responsibleId,
        tenant_id: tenantId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(responsible);
  }

  async findByCategory(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<Responsible[]> {
    const responsibles = await this.prisma.responsible.findMany({
      where: {
        category_responsible_id: categoryResponsibleId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { name: 'asc' },
    });

    return responsibles.map(responsible => this.mapToEntity(responsible));
  }

  async findWithoutCategory(tenantId: string): Promise<Responsible[]> {
    const responsibles = await this.prisma.responsible.findMany({
      where: {
        category_responsible_id: null,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { name: 'asc' },
    });

    return responsibles.map(responsible => this.mapToEntity(responsible));
  }

  async findByCode(
    codeResponsible: string,
    tenantId: string
  ): Promise<Responsible | null> {
    const responsible = await this.prisma.responsible.findFirst({
      where: {
        code_responsible: codeResponsible,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return responsible ? this.mapToEntity(responsible) : null;
  }

  async findByName(name: string, tenantId: string): Promise<Responsible[]> {
    const responsibles = await this.prisma.responsible.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' },
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { name: 'asc' },
    });

    return responsibles.map(responsible => this.mapToEntity(responsible));
  }

  async getStatistics(tenantId: string): Promise<ResponsibleStatistics> {
    const [
      totalResponsibles,
      activeResponsibles,
      deletedResponsibles,
      responsiblesWithCategory,
      responsiblesWithoutCategory,
      responsiblesByCategory,
    ] = await Promise.all([
      this.prisma.responsible.count({ where: { tenant_id: tenantId } }),
      this.prisma.responsible.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      this.prisma.responsible.count({
        where: { tenant_id: tenantId, deleted_at: { not: null } },
      }),
      this.prisma.responsible.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          category_responsible_id: { not: null },
        },
      }),
      this.prisma.responsible.count({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          category_responsible_id: null,
        },
      }),
      this.prisma.responsible.groupBy({
        by: ['category_responsible_id'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          category_responsible_id: { not: null },
        },
        _count: { responsible_id: true },
      }),
    ]);

    // Buscar nomes das categorias
    const categoryIds = responsiblesByCategory
      .map(item => item.category_responsible_id)
      .filter(Boolean);
    const categories = await this.prisma.categoriesResponsible.findMany({
      where: {
        category_responsible_id: {
          in: categoryIds.filter((id): id is string => id !== null),
        },
      },
      select: { category_responsible_id: true, category_responsible: true },
    });

    const responsiblesByCategoryWithNames = responsiblesByCategory.map(item => {
      const category = categories.find(
        cat => cat.category_responsible_id === item.category_responsible_id
      );
      return {
        categoryName:
          category?.category_responsible || 'Categoria não encontrada',
        count: item._count.responsible_id,
      };
    });

    return {
      totalResponsibles,
      activeResponsibles,
      deletedResponsibles,
      responsiblesWithCategory,
      responsiblesWithoutCategory,
      responsiblesByCategory: responsiblesByCategoryWithNames,
    };
  }

  async existsByCode(
    codeResponsible: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      code_responsible: codeResponsible,
      tenant_id: tenantId,
    };

    if (excludeId) {
      where.responsible_id = { not: excludeId };
    }

    const count = await this.prisma.responsible.count({ where });
    return count > 0;
  }

  async existsByName(
    name: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      name: name,
      tenant_id: tenantId,
    };

    if (excludeId) {
      where.responsible_id = { not: excludeId };
    }

    const count = await this.prisma.responsible.count({ where });
    return count > 0;
  }

  private mapToEntity(data: any): Responsible {
    return {
      responsibleId: data.responsible_id,
      name: data.name,
      codeResponsible: data.code_responsible,
      tenantId: data.tenant_id,
      categoryResponsibleId: data.category_responsible_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    };
  }

  private mapToEntityWithCategory(data: any): ResponsibleWithCategory {
    const responsible = this.mapToEntity(data);
    return {
      ...responsible,
      categoryResponsible: data.categoryResponsible
        ? {
            categoryResponsibleId:
              data.categoryResponsible.category_responsible_id,
            name: data.categoryResponsible.category_responsible,
          }
        : undefined,
    };
  }
}
