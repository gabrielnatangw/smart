import { PrismaClient } from '@prisma/client';

import { IApplicationRepository } from '../../../application/interfaces/IApplicationRepository';
import {
  Application,
  ApplicationStatistics,
  CreateApplicationRequest,
  PaginatedApplicationsResponse,
  UpdateApplicationRequest,
} from '../../../domain/entities/Application';

export class PrismaApplicationRepository implements IApplicationRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateApplicationRequest): Promise<Application> {
    const application = await this.prisma.application.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        description: data.description || null,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    return this.mapToEntity(application);
  }

  async findById(applicationId: string): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: {
        application_id: applicationId,
      },
    });

    return application ? this.mapToEntity(application) : null;
  }

  async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    isActive?: boolean;
  }): Promise<PaginatedApplicationsResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      includeDeleted = false,
      isActive,
    } = params;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.application.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      applications: applications.map(application =>
        this.mapToEntity(application)
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<Application> {
    const application = await this.prisma.application.update({
      where: {
        application_id: applicationId,
      },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.displayName !== undefined && {
          displayName: data.displayName,
        }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(application);
  }

  async delete(applicationId: string): Promise<void> {
    await this.prisma.application.update({
      where: {
        application_id: applicationId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async restore(applicationId: string): Promise<Application> {
    const application = await this.prisma.application.update({
      where: {
        application_id: applicationId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(application);
  }

  async findByName(name: string): Promise<Application | null> {
    const application = await this.prisma.application.findUnique({
      where: {
        name: name,
      },
    });

    return application ? this.mapToEntity(application) : null;
  }

  async findByDisplayName(displayName: string): Promise<Application[]> {
    const applications = await this.prisma.application.findMany({
      where: {
        displayName: { contains: displayName, mode: 'insensitive' },
        deleted_at: null,
      },
      orderBy: { displayName: 'asc' },
    });

    return applications.map(application => this.mapToEntity(application));
  }

  async findActive(): Promise<Application[]> {
    const applications = await this.prisma.application.findMany({
      where: {
        isActive: true,
        deleted_at: null,
      },
      orderBy: { displayName: 'asc' },
    });

    return applications.map(application => this.mapToEntity(application));
  }

  async findInactive(): Promise<Application[]> {
    const applications = await this.prisma.application.findMany({
      where: {
        isActive: false,
        deleted_at: null,
      },
      orderBy: { displayName: 'asc' },
    });

    return applications.map(application => this.mapToEntity(application));
  }

  async getStatistics(): Promise<ApplicationStatistics> {
    const [
      totalApplications,
      activeApplications,
      deletedApplications,
      applicationsWithDescription,
      applicationsWithoutDescription,
    ] = await Promise.all([
      this.prisma.application.count(),
      this.prisma.application.count({
        where: { isActive: true, deleted_at: null },
      }),
      this.prisma.application.count({ where: { deleted_at: { not: null } } }),
      this.prisma.application.count({
        where: { description: { not: null }, deleted_at: null },
      }),
      this.prisma.application.count({
        where: { description: null, deleted_at: null },
      }),
    ]);

    return {
      totalApplications,
      activeApplications,
      deletedApplications,
      applicationsWithDescription,
      applicationsWithoutDescription,
    };
  }

  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const where: any = {
      name: name,
    };

    if (excludeId) {
      where.application_id = { not: excludeId };
    }

    const count = await this.prisma.application.count({ where });
    return count > 0;
  }

  async existsByDisplayName(
    displayName: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      displayName: displayName,
    };

    if (excludeId) {
      where.application_id = { not: excludeId };
    }

    const count = await this.prisma.application.count({ where });
    return count > 0;
  }

  private mapToEntity(data: any): Application {
    return {
      applicationId: data.application_id,
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      isActive: data.isActive,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    };
  }
}
