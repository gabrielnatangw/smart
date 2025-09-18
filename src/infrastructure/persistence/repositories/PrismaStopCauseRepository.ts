import { PrismaClient } from '@prisma/client';

import {
  CreateStopCauseRequest,
  DeleteStopCauseRequest,
  GetAllStopCausesRequest,
  GetAllStopCausesResponse,
  GetHierarchyRequest,
  GetStopCauseByIdRequest,
  IStopCauseRepository,
  MoveStopCauseRequest,
  RestoreStopCauseRequest,
  StopCauseHierarchyResponse,
  StopCauseResponse,
  StopCauseStatisticsResponse,
  UpdateStopCauseRequest,
} from '../../../application/interfaces/IStopCauseRepository';
import { StopCause } from '../../../domain/entities/StopCause';

export class PrismaStopCauseRepository implements IStopCauseRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateStopCauseRequest): Promise<StopCause> {
    const stopCauseData = await this.prisma.stopCause.create({
      data: {
        description: data.description,
        parent_id: data.parentId,
        tenant_id: data.tenantId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return this.mapToEntity(stopCauseData);
  }

  async findById(data: GetStopCauseByIdRequest): Promise<StopCause | null> {
    const stopCauseData = await this.prisma.stopCause.findFirst({
      where: {
        stop_cause_id: data.stopCauseId,
        tenant_id: data.tenantId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    if (!stopCauseData) {
      return null;
    }

    return this.mapToEntity(stopCauseData);
  }

  async findAll(
    data: GetAllStopCausesRequest
  ): Promise<GetAllStopCausesResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      includeDeleted = false,
      includeHierarchy = false,
    } = data;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: data.tenantId,
    };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    if (search) {
      where.description = {
        contains: search,
        mode: 'insensitive',
      };
    }

    const include: any = {};
    if (includeHierarchy) {
      include.parent = true;
      include.children = true;
    }

    const [stopCauses, total] = await Promise.all([
      this.prisma.stopCause.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          created_at: 'desc',
        },
        include,
      }),
      this.prisma.stopCause.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      stopCauses: stopCauses.map(stopCause => this.mapToResponse(stopCause)),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(data: UpdateStopCauseRequest): Promise<StopCause> {
    const updateData: any = {};

    if (data.description !== undefined) {
      updateData.description = data.description;
    }
    if (data.parentId !== undefined) {
      updateData.parent_id = data.parentId;
    }

    updateData.updated_at = new Date();

    const stopCauseData = await this.prisma.stopCause.update({
      where: {
        stop_cause_id: data.stopCauseId,
      },
      data: updateData,
      include: {
        parent: true,
        children: true,
      },
    });

    return this.mapToEntity(stopCauseData);
  }

  async delete(data: DeleteStopCauseRequest): Promise<void> {
    await this.prisma.stopCause.update({
      where: {
        stop_cause_id: data.stopCauseId,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async restore(data: RestoreStopCauseRequest): Promise<StopCause> {
    const stopCauseData = await this.prisma.stopCause.update({
      where: {
        stop_cause_id: data.stopCauseId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return this.mapToEntity(stopCauseData);
  }

  async getHierarchy(
    data: GetHierarchyRequest
  ): Promise<StopCauseHierarchyResponse> {
    const where: any = {
      tenant_id: data.tenantId,
    };

    if (!data.includeDeleted) {
      where.deleted_at = null;
    }

    const stopCauses = await this.prisma.stopCause.findMany({
      where,
      include: {
        parent: true,
        children: true,
      },
      orderBy: [{ parent_id: 'asc' }, { description: 'asc' }],
    });

    const rootStopCauses = stopCauses.filter(sc => !sc.parent_id);
    const maxDepth = this.calculateMaxDepth(stopCauses);

    return {
      stopCauses: stopCauses.map(stopCause => this.mapToResponse(stopCause)),
      total: stopCauses.length,
      rootCount: rootStopCauses.length,
      maxDepth,
    };
  }

  async getRootStopCauses(
    tenantId: string,
    includeDeleted = false
  ): Promise<StopCause[]> {
    const where: any = {
      tenant_id: tenantId,
      parent_id: null,
    };

    if (!includeDeleted) {
      where.deleted_at = null;
    }

    const stopCausesData = await this.prisma.stopCause.findMany({
      where,
      include: {
        children: true,
      },
      orderBy: {
        description: 'asc',
      },
    });

    return stopCausesData.map(stopCause => this.mapToEntity(stopCause));
  }

  async getChildren(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCause[]> {
    const childrenData = await this.prisma.stopCause.findMany({
      where: {
        parent_id: stopCauseId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        children: true,
      },
      orderBy: {
        description: 'asc',
      },
    });

    return childrenData.map(stopCause => this.mapToEntity(stopCause));
  }

  async getParent(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCause | null> {
    const stopCauseData = await this.prisma.stopCause.findFirst({
      where: {
        stop_cause_id: stopCauseId,
        tenant_id: tenantId,
      },
      include: {
        parent: true,
      },
    });

    if (!stopCauseData || !stopCauseData.parent) {
      return null;
    }

    return this.mapToEntity(stopCauseData.parent);
  }

  async getAncestors(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCause[]> {
    const ancestors: StopCause[] = [];
    let currentStopCause = await this.findById({ stopCauseId, tenantId });

    while (currentStopCause && currentStopCause.parentId) {
      const parent = await this.getParent(
        currentStopCause.stopCauseId,
        tenantId
      );
      if (parent) {
        ancestors.unshift(parent);
        currentStopCause = parent;
      } else {
        break;
      }
    }

    return ancestors;
  }

  async getDescendants(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCause[]> {
    const descendants: StopCause[] = [];
    const children = await this.getChildren(stopCauseId, tenantId);

    for (const child of children) {
      descendants.push(child);
      const childDescendants = await this.getDescendants(
        child.stopCauseId,
        tenantId
      );
      descendants.push(...childDescendants);
    }

    return descendants;
  }

  async moveStopCause(data: MoveStopCauseRequest): Promise<StopCause> {
    const stopCauseData = await this.prisma.stopCause.update({
      where: {
        stop_cause_id: data.stopCauseId,
      },
      data: {
        parent_id: data.newParentId,
        updated_at: new Date(),
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return this.mapToEntity(stopCauseData);
  }

  async findRootStopCauses(tenantId: string): Promise<StopCause[]> {
    return this.getRootStopCauses(tenantId, false);
  }

  async findLeafStopCauses(tenantId: string): Promise<StopCause[]> {
    const allStopCauses = await this.prisma.stopCause.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        children: true,
      },
    });

    return allStopCauses
      .filter(sc => !sc.children || sc.children.length === 0)
      .map(stopCause => this.mapToEntity(stopCause));
  }

  async findStopCausesByLevel(
    level: number,
    tenantId: string
  ): Promise<StopCause[]> {
    const allStopCauses = await this.prisma.stopCause.findMany({
      where: {
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return allStopCauses
      .map(stopCause => this.mapToEntity(stopCause))
      .filter(stopCause => stopCause.getLevel() === level);
  }

  async findStopCausesByDescription(
    description: string,
    tenantId: string
  ): Promise<StopCause[]> {
    const stopCausesData = await this.prisma.stopCause.findMany({
      where: {
        description: {
          contains: description,
          mode: 'insensitive',
        },
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    return stopCausesData.map(stopCause => this.mapToEntity(stopCause));
  }

  async existsByIdAndTenant(
    stopCauseId: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.stopCause.count({
      where: {
        stop_cause_id: stopCauseId,
        tenant_id: tenantId,
      },
    });

    return count > 0;
  }

  async existsByDescriptionAndTenant(
    description: string,
    tenantId: string
  ): Promise<boolean> {
    const count = await this.prisma.stopCause.count({
      where: {
        description: description,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async hasChildren(stopCauseId: string, tenantId: string): Promise<boolean> {
    const count = await this.prisma.stopCause.count({
      where: {
        parent_id: stopCauseId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    return count > 0;
  }

  async hasParent(stopCauseId: string, tenantId: string): Promise<boolean> {
    const stopCause = await this.prisma.stopCause.findFirst({
      where: {
        stop_cause_id: stopCauseId,
        tenant_id: tenantId,
      },
    });

    return stopCause ? !!stopCause.parent_id : false;
  }

  async isDescendantOf(
    descendantId: string,
    ancestorId: string,
    tenantId: string
  ): Promise<boolean> {
    const descendants = await this.getDescendants(ancestorId, tenantId);
    return descendants.some(
      descendant => descendant.stopCauseId === descendantId
    );
  }

  async getStatistics(tenantId: string): Promise<StopCauseStatisticsResponse> {
    const allStopCauses = await this.prisma.stopCause.findMany({
      where: {
        tenant_id: tenantId,
      },
      include: {
        parent: true,
        children: true,
      },
    });

    const totalStopCauses = allStopCauses.length;
    const activeStopCauses = allStopCauses.filter(sc => !sc.deleted_at).length;
    const deletedStopCauses = totalStopCauses - activeStopCauses;
    const rootStopCauses = allStopCauses.filter(
      sc => !sc.parent_id && !sc.deleted_at
    ).length;
    const leafStopCauses = allStopCauses.filter(
      sc => (!sc.children || sc.children.length === 0) && !sc.deleted_at
    ).length;

    const stopCausesWithLevel = allStopCauses
      .filter(sc => !sc.deleted_at)
      .map(stopCause => this.mapToEntity(stopCause));

    const levels = stopCausesWithLevel.map(sc => sc.getLevel());
    const averageDepth =
      levels.length > 0
        ? levels.reduce((sum, level) => sum + level, 0) / levels.length
        : 0;
    const maxDepth = levels.length > 0 ? Math.max(...levels) : 0;

    const stopCausesByLevel: Record<number, number> = {};
    levels.forEach(level => {
      stopCausesByLevel[level] = (stopCausesByLevel[level] || 0) + 1;
    });

    return {
      totalStopCauses,
      activeStopCauses,
      deletedStopCauses,
      rootStopCauses,
      leafStopCauses,
      averageDepth: Math.round(averageDepth * 100) / 100,
      maxDepth,
      stopCausesByLevel,
    };
  }

  private mapToEntity(stopCauseData: any): StopCause {
    const parent = stopCauseData.parent
      ? this.mapToEntity(stopCauseData.parent)
      : undefined;
    const children = stopCauseData.children
      ? stopCauseData.children.map((child: any) => this.mapToEntity(child))
      : undefined;

    return StopCause.restore(
      stopCauseData.stop_cause_id,
      stopCauseData.description,
      stopCauseData.tenant_id,
      stopCauseData.created_at,
      stopCauseData.updated_at,
      stopCauseData.deleted_at,
      stopCauseData.parent_id,
      parent,
      children
    );
  }

  private mapToResponse(stopCauseData: any): StopCauseResponse {
    const parent = stopCauseData.parent
      ? this.mapToResponse(stopCauseData.parent)
      : undefined;
    const children = stopCauseData.children
      ? stopCauseData.children.map((child: any) => this.mapToResponse(child))
      : undefined;

    const stopCause = this.mapToEntity(stopCauseData);

    return {
      stopCauseId: stopCause.stopCauseId,
      description: stopCause.description,
      tenantId: stopCause.tenantId,
      createdAt: stopCause.createdAt,
      updatedAt: stopCause.updatedAt,
      deletedAt: stopCause.deletedAt,
      parentId: stopCause.parentId,
      parent,
      children,
      level: stopCause.getLevel(),
      isRoot: stopCause.isRoot(),
      isLeaf: stopCause.isLeaf(),
    };
  }

  private calculateMaxDepth(stopCauses: any[]): number {
    const stopCauseEntities = stopCauses.map(sc => this.mapToEntity(sc));
    const levels = stopCauseEntities.map(sc => sc.getLevel());
    return levels.length > 0 ? Math.max(...levels) : 0;
  }
}
