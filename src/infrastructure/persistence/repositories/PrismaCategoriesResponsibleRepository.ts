import { PrismaClient } from '@prisma/client';

import {
  CategoriesResponsibleResponse,
  CategoriesResponsibleStatisticsResponse,
  CreateCategoriesResponsibleRequest,
  DeleteCategoriesResponsibleRequest,
  GetAllCategoriesResponsibleRequest,
  GetAllCategoriesResponsibleResponse,
  GetCategoriesResponsibleByIdRequest,
  ICategoriesResponsibleRepository,
  RestoreCategoriesResponsibleRequest,
  UpdateCategoriesResponsibleRequest,
} from '../../../application/interfaces/ICategoriesResponsibleRepository';
import { CategoriesResponsible } from '../../../domain/entities/CategoriesResponsible';

export class PrismaCategoriesResponsibleRepository
  implements ICategoriesResponsibleRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible> {
    const categoryResponsibleData =
      await this.prisma.categoriesResponsible.create({
        data: {
          category_responsible: data.categoryResponsible,
          tenant_id: data.tenantId,
        },
      });

    return this.mapToEntity(categoryResponsibleData);
  }

  async findById(
    data: GetCategoriesResponsibleByIdRequest
  ): Promise<CategoriesResponsible | null> {
    const categoryResponsibleData =
      await this.prisma.categoriesResponsible.findFirst({
        where: {
          category_responsible_id: data.categoryResponsibleId,
          tenant_id: data.tenantId,
        },
      });

    if (!categoryResponsibleData) {
      return null;
    }

    return this.mapToEntity(categoryResponsibleData);
  }

  async findAll(
    data: GetAllCategoriesResponsibleRequest
  ): Promise<GetAllCategoriesResponsibleResponse> {
    const { page = 1, limit = 10, search, includeDeleted = false } = data;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: data.tenantId,
    };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    if (search) {
      where.category_responsible = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const [categoriesResponsible, total] = await Promise.all([
      this.prisma.categoriesResponsible.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include: {
          _count: {
            select: {
              responsible: true,
            },
          },
        },
      }),
      this.prisma.categoriesResponsible.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      categoriesResponsible: categoriesResponsible.map(category =>
        this.mapToResponse(category)
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    data: UpdateCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible> {
    const updateData: any = {};

    if (data.categoryResponsible !== undefined) {
      updateData.category_responsible = data.categoryResponsible;
    }

    updateData.updated_at = new Date();

    const categoryResponsibleData =
      await this.prisma.categoriesResponsible.update({
        where: {
          category_responsible_id: data.categoryResponsibleId,
        },
        data: updateData,
      });

    return this.mapToEntity(categoryResponsibleData);
  }

  async delete(data: DeleteCategoriesResponsibleRequest): Promise<void> {
    await this.prisma.categoriesResponsible.update({
      where: {
        category_responsible_id: data.categoryResponsibleId,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async restore(
    data: RestoreCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible> {
    const categoryResponsibleData =
      await this.prisma.categoriesResponsible.update({
        where: {
          category_responsible_id: data.categoryResponsibleId,
        },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });

    return this.mapToEntity(categoryResponsibleData);
  }

  async findCategoriesResponsibleByName(
    name: string,
    tenantId: string
  ): Promise<CategoriesResponsible[]> {
    const categoriesResponsibleData =
      await this.prisma.categoriesResponsible.findMany({
        where: {
          category_responsible: {
            contains: name,
            mode: 'insensitive',
          },
          tenant_id: tenantId,
          deleted_at: null,
        },
      });

    return categoriesResponsibleData.map(category =>
      this.mapToEntity(category)
    );
  }

  async findCategoriesWithResponsible(
    tenantId: string
  ): Promise<CategoriesResponsible[]> {
    const categoriesResponsibleData =
      await this.prisma.categoriesResponsible.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          responsible: {
            some: {
              deleted_at: null,
            },
          },
        },
      });

    return categoriesResponsibleData.map(category =>
      this.mapToEntity(category)
    );
  }

  async findCategoriesWithoutResponsible(
    tenantId: string
  ): Promise<CategoriesResponsible[]> {
    const categoriesResponsibleData =
      await this.prisma.categoriesResponsible.findMany({
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          responsible: {
            none: {
              deleted_at: null,
            },
          },
        },
      });

    return categoriesResponsibleData.map(category =>
      this.mapToEntity(category)
    );
  }

  async existsByIdAndTenant(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.categoriesResponsible.count({
      where: {
        category_responsible_id: categoryResponsibleId,
        tenant_id: tenantId,
      },
    });

    return count > 0;
  }

  async existsByNameAndTenant(
    name: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.categoriesResponsible.count({
      where: {
        category_responsible: name,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async hasResponsible(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.responsible.count({
      where: {
        category_responsible_id: categoryResponsibleId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async getStatistics(
    tenantId: string
  ): Promise<CategoriesResponsibleStatisticsResponse> {
    const allCategories = await this.prisma.categoriesResponsible.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        _count: {
          select: {
            responsible: {
              where: {
                deleted_at: null,
              },
            },
          },
        },
      },
    });

    const totalCategoriesResponsible = allCategories.length;
    const activeCategoriesResponsible = allCategories.filter(
      cat => !cat.deleted_at
    ).length;
    const deletedCategoriesResponsible =
      totalCategoriesResponsible - activeCategoriesResponsible;

    const categoriesWithResponsible = allCategories.filter(
      cat => !cat.deleted_at && cat._count.responsible > 0
    ).length;

    const categoriesWithoutResponsible = allCategories.filter(
      cat => !cat.deleted_at && cat._count.responsible === 0
    ).length;

    const totalResponsible = allCategories
      .filter(cat => !cat.deleted_at)
      .reduce((sum, cat) => sum + cat._count.responsible, 0);

    const averageResponsiblePerCategory =
      activeCategoriesResponsible > 0
        ? totalResponsible / activeCategoriesResponsible
        : 0;

    return {
      totalCategoriesResponsible,
      activeCategoriesResponsible,
      deletedCategoriesResponsible,
      categoriesWithResponsible,
      categoriesWithoutResponsible,
      averageResponsiblePerCategory:
        Math.round(averageResponsiblePerCategory * 100) / 100,
    };
  }

  private mapToEntity(categoryResponsibleData: any): CategoriesResponsible {
    return CategoriesResponsible.restore(
      categoryResponsibleData.category_responsible_id,
      categoryResponsibleData.category_responsible,
      categoryResponsibleData.tenant_id,
      categoryResponsibleData.created_at,
      categoryResponsibleData.updated_at,
      categoryResponsibleData.deleted_at
    );
  }

  private mapToResponse(
    categoryResponsibleData: any
  ): CategoriesResponsibleResponse {
    return {
      categoryResponsibleId: categoryResponsibleData.category_responsible_id,
      categoryResponsible: categoryResponsibleData.category_responsible,
      tenantId: categoryResponsibleData.tenant_id,
      createdAt: categoryResponsibleData.created_at,
      updatedAt: categoryResponsibleData.updated_at,
      deletedAt: categoryResponsibleData.deleted_at,
      responsibleCount: categoryResponsibleData._count?.responsible || 0,
    };
  }
}
