import { PrismaClient } from '@prisma/client';

import { ITenantSubscriptionRepository } from '../../../application/interfaces/ITenantSubscriptionRepository';
import {
  CreateTenantSubscriptionRequest,
  PaginatedTenantSubscriptionsResponse,
  TenantSubscription,
  TenantSubscriptionFilters,
  TenantSubscriptionStatistics,
  TenantSubscriptionWithRelations,
  UpdateTenantSubscriptionRequest,
} from '../../../domain/entities/TenantSubscription';

export class PrismaTenantSubscriptionRepository
  implements ITenantSubscriptionRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateTenantSubscriptionRequest
  ): Promise<TenantSubscription> {
    const tenantSubscription = await this.prisma.tenantSubscription.create({
      data: {
        isActive: data.isActive ?? true,
        subscriptionPlan: data.subscriptionPlan,
        ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
        ...(data.expiresAt !== undefined && { expiresAt: data.expiresAt }),
        tenant_id: data.tenantId,
        application_id: data.applicationId,
      },
    });

    return this.mapToDomain(tenantSubscription);
  }

  async findById(
    tenantSubscriptionId: string
  ): Promise<TenantSubscriptionWithRelations | null> {
    const tenantSubscription = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenantSubscription_id: tenantSubscriptionId,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscription
      ? this.mapToDomainWithRelations(tenantSubscription)
      : null;
  }

  async findAll(
    params: TenantSubscriptionFilters
  ): Promise<PaginatedTenantSubscriptionsResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      isActive,
      subscriptionPlan,
      tenantId,
      applicationId,
      expiresBefore,
      expiresAfter,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = params;

    const skip = (page - 1) * limit;

    const where: any = {
      deleted_at: null,
    };

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (subscriptionPlan) {
      where.subscriptionPlan = subscriptionPlan;
    }

    if (tenantId) {
      where.tenant_id = tenantId;
    }

    if (applicationId) {
      where.application_id = applicationId;
    }

    if (expiresBefore) {
      where.expiresAt = {
        ...where.expiresAt,
        lte: expiresBefore,
      };
    }

    if (expiresAfter) {
      where.expiresAt = {
        ...where.expiresAt,
        gte: expiresAfter,
      };
    }

    if (search) {
      where.OR = [
        {
          subscriptionPlan: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          tenant: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
        {
          application: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    const [tenantSubscriptions, total] = await Promise.all([
      this.prisma.tenantSubscription.findMany({
        where,
        include: {
          tenant: {
            select: {
              tenant_id: true,
              name: true,
            },
          },
          application: {
            select: {
              application_id: true,
              name: true,
              displayName: true,
            },
          },
        },
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip,
        take: limit,
      }),
      this.prisma.tenantSubscription.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: tenantSubscriptions.map(this.mapToDomainWithRelations),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(
    tenantSubscriptionId: string,
    data: UpdateTenantSubscriptionRequest
  ): Promise<TenantSubscription> {
    const updateData: any = {};

    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.subscriptionPlan !== undefined) {
      updateData.subscriptionPlan = data.subscriptionPlan;
    }
    if (data.maxUsers !== undefined) {
      updateData.maxUsers = data.maxUsers;
    }
    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt;
    }
    updateData.updated_at = new Date();

    const tenantSubscription = await this.prisma.tenantSubscription.update({
      where: {
        tenantSubscription_id: tenantSubscriptionId,
      },
      data: updateData,
    });

    return this.mapToDomain(tenantSubscription);
  }

  async delete(tenantSubscriptionId: string): Promise<void> {
    await this.prisma.tenantSubscription.update({
      where: {
        tenantSubscription_id: tenantSubscriptionId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async restore(tenantSubscriptionId: string): Promise<TenantSubscription> {
    const tenantSubscription = await this.prisma.tenantSubscription.update({
      where: {
        tenantSubscription_id: tenantSubscriptionId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return this.mapToDomain(tenantSubscription);
  }

  // Business Operations
  async findByTenantId(
    tenantId: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findByApplicationId(
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        application_id: applicationId,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findByTenantAndApplication(
    tenantId: string,
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations | null> {
    const tenantSubscription = await this.prisma.tenantSubscription.findFirst({
      where: {
        tenant_id: tenantId,
        application_id: applicationId,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscription
      ? this.mapToDomainWithRelations(tenantSubscription)
      : null;
  }

  async findActiveSubscriptions(): Promise<TenantSubscriptionWithRelations[]> {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        isActive: true,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findInactiveSubscriptions(): Promise<
    TenantSubscriptionWithRelations[]
  > {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        isActive: false,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findExpiringSubscriptions(
    days: number
  ): Promise<TenantSubscriptionWithRelations[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        isActive: true,
        expiresAt: {
          not: null,
          lte: futureDate,
          gt: new Date(),
        },
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findExpiredSubscriptions(): Promise<TenantSubscriptionWithRelations[]> {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        expiresAt: {
          not: null,
          lt: new Date(),
        },
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  async findBySubscriptionPlan(
    plan: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    const tenantSubscriptions = await this.prisma.tenantSubscription.findMany({
      where: {
        subscriptionPlan: plan,
        deleted_at: null,
      },
      include: {
        tenant: {
          select: {
            tenant_id: true,
            name: true,
          },
        },
        application: {
          select: {
            application_id: true,
            name: true,
            displayName: true,
          },
        },
      },
    });

    return tenantSubscriptions.map(this.mapToDomainWithRelations);
  }

  // Statistics
  async getStatistics(): Promise<TenantSubscriptionStatistics> {
    const [
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions,
      expiredSubscriptions,
      expiringSubscriptions,
      subscriptionsByPlan,
      averageUsersPerSubscription,
    ] = await Promise.all([
      this.prisma.tenantSubscription.count({
        where: { deleted_at: null },
      }),
      this.prisma.tenantSubscription.count({
        where: { isActive: true, deleted_at: null },
      }),
      this.prisma.tenantSubscription.count({
        where: { isActive: false, deleted_at: null },
      }),
      this.prisma.tenantSubscription.count({
        where: {
          expiresAt: {
            not: null,
            lt: new Date(),
          },
          deleted_at: null,
        },
      }),
      this.prisma.tenantSubscription.count({
        where: {
          isActive: true,
          expiresAt: {
            not: null,
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            gt: new Date(),
          },
          deleted_at: null,
        },
      }),
      this.prisma.tenantSubscription.groupBy({
        by: ['subscriptionPlan'],
        where: { deleted_at: null },
        _count: {
          subscriptionPlan: true,
        },
      }),
      this.prisma.tenantSubscription.aggregate({
        where: { deleted_at: null },
        _avg: {
          maxUsers: true,
        },
      }),
    ]);

    const planStats: { [plan: string]: number } = {};
    subscriptionsByPlan.forEach(item => {
      planStats[item.subscriptionPlan] = item._count.subscriptionPlan;
    });

    return {
      totalSubscriptions,
      activeSubscriptions,
      inactiveSubscriptions,
      subscriptionsByPlan: planStats,
      expiringSubscriptions,
      expiredSubscriptions,
      averageUsersPerSubscription:
        averageUsersPerSubscription._avg.maxUsers || 0,
    };
  }

  // Validation
  async existsByTenantAndApplication(
    tenantId: string,
    applicationId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      tenant_id: tenantId,
      application_id: applicationId,
      deleted_at: null,
    };

    if (excludeId) {
      where.tenantSubscription_id = { not: excludeId };
    }

    const count = await this.prisma.tenantSubscription.count({ where });
    return count > 0;
  }

  async countActiveSubscriptionsByTenant(tenantId: string): Promise<number> {
    return this.prisma.tenantSubscription.count({
      where: {
        tenant_id: tenantId,
        isActive: true,
        deleted_at: null,
      },
    });
  }

  async countActiveSubscriptionsByApplication(
    applicationId: string
  ): Promise<number> {
    return this.prisma.tenantSubscription.count({
      where: {
        application_id: applicationId,
        isActive: true,
        deleted_at: null,
      },
    });
  }

  private mapToDomain(prismaModel: any): TenantSubscription {
    return {
      tenantSubscriptionId: prismaModel.tenantSubscription_id,
      isActive: prismaModel.isActive,
      subscriptionPlan: prismaModel.subscriptionPlan,
      maxUsers: prismaModel.maxUsers,
      expiresAt: prismaModel.expiresAt,
      createdAt: prismaModel.created_at,
      updatedAt: prismaModel.updated_at,
      deletedAt: prismaModel.deleted_at,
      tenantId: prismaModel.tenant_id,
      applicationId: prismaModel.application_id,
    };
  }

  private mapToDomainWithRelations(
    prismaModel: any
  ): TenantSubscriptionWithRelations {
    const result: TenantSubscriptionWithRelations = {
      ...this.mapToDomain(prismaModel),
    };

    if (prismaModel.tenant) {
      result.tenant = {
        tenantId: prismaModel.tenant.tenant_id,
        name: prismaModel.tenant.name,
        domain: prismaModel.tenant.name, // Fallback since domain doesn't exist
      };
    }

    if (prismaModel.application) {
      result.application = {
        applicationId: prismaModel.application.application_id,
        name: prismaModel.application.name,
        displayName: prismaModel.application.displayName,
      };
    }

    return result;
  }
}
