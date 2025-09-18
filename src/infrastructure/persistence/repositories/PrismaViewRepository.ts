import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateViewData,
  IViewRepository,
  UpdateViewData,
  ViewFilters,
} from '../../../application/interfaces/IViewRepository';
import { View } from '../../../domain/entities/View';

export class PrismaViewRepository implements IViewRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToView(viewData: any): View {
    return View.fromPersistence({
      id: viewData.view_id,
      name: viewData.name,
      isDefault: viewData.is_default,
      isPublic: viewData.is_public,
      isActive: viewData.is_active,
      createdAt: viewData.created_at,
      updatedAt: viewData.updated_at,
      deletedAt: viewData.deleted_at,
      tenantId: viewData.tenant_id,
      userId: viewData.user_id,
      createdBy: viewData.created_by,
      updatedBy: viewData.updated_by,
    });
  }

  private mapDatabaseToViewWithCards(viewData: any): View {
    const view = View.fromPersistence({
      id: viewData.view_id,
      name: viewData.name,
      isDefault: viewData.is_default,
      isPublic: viewData.is_public,
      isActive: viewData.is_active,
      createdAt: viewData.created_at,
      updatedAt: viewData.updated_at,
      deletedAt: viewData.deleted_at,
      tenantId: viewData.tenant_id,
      userId: viewData.user_id,
      createdBy: viewData.created_by,
      updatedBy: viewData.updated_by,
    });

    // Adicionar cards se existirem (apenas os não deletados)
    if (viewData.cards && viewData.cards.length > 0) {
      const cards = viewData.cards
        .filter((cardData: any) => !cardData.deleted_at) // Filtrar cards deletados
        .map((cardData: any) => ({
          id: cardData.card_id,
          viewId: cardData.view_id,
          sensorId: cardData.sensor_id,
          moduleId: cardData.module_id,
          machineId: cardData.machine_id,
          positionX: cardData.position_x,
          positionY: cardData.position_y,
          width: cardData.width,
          height: cardData.height,
          chartType: cardData.chart_type,
          title: cardData.title,
          sortOrder: cardData.sort_order,
          createdAt: cardData.created_at,
          updatedAt: cardData.updated_at,
          deletedAt: cardData.deleted_at,
          tenantId: cardData.tenant_id,
          createdBy: cardData.created_by,
          updatedBy: cardData.updated_by,
        }));

      (view as any).cards = cards;
    }

    return view;
  }

  async create(data: CreateViewData): Promise<View> {
    const viewData = await this.prisma.view.create({
      data: {
        view_id: uuidv4(),
        name: data.name,
        is_default: data.isDefault ?? false,
        is_public: data.isPublic ?? false,
        is_active: data.isActive ?? true,
        tenant_id: data.tenantId,
        user_id: data.userId,
        created_by: data.createdBy,
        updated_by: data.updatedBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.mapDatabaseToView(viewData);
  }

  async findById(id: string): Promise<View | null> {
    const viewData = await this.prisma.view.findFirst({
      where: {
        view_id: id,
        deleted_at: null, // Só retorna views que não foram deletadas
      },
    });

    if (!viewData) {
      return null;
    }

    return this.mapDatabaseToView(viewData);
  }

  async findByTenant(tenantId: string, filters?: ViewFilters): Promise<View[]> {
    const where: any = {
      tenant_id: tenantId,
      deleted_at: null,
    };

    if (filters?.userId) {
      where.user_id = filters.userId;
    }

    if (filters?.isPublic !== undefined) {
      where.is_public = filters.isPublic;
    }

    if (filters?.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (filters?.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    const viewsData = await this.prisma.view.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return viewsData.map(viewData => this.mapDatabaseToView(viewData));
  }

  async findByUser(userId: string, tenantId: string): Promise<View[]> {
    const viewsData = await this.prisma.view.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return viewsData.map(viewData => this.mapDatabaseToView(viewData));
  }

  async findByUserWithCards(userId: string, tenantId: string): Promise<View[]> {
    const viewsData = await this.prisma.view.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      include: {
        cards: {
          where: {
            deleted_at: null,
          },
          orderBy: {
            sort_order: 'asc',
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return viewsData.map(viewData => this.mapDatabaseToViewWithCards(viewData));
  }

  async update(id: string, data: UpdateViewData): Promise<View> {
    const existingView = await this.prisma.view.findUnique({
      where: {
        view_id: id,
      },
    });

    if (!existingView) {
      throw new Error('View not found');
    }

    if (existingView.deleted_at) {
      throw new Error('Cannot update deleted view');
    }

    const updateData: any = {
      updated_at: new Date(),
      updated_by: data.updatedBy,
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.isDefault !== undefined) updateData.is_default = data.isDefault;
    if (data.isPublic !== undefined) updateData.is_public = data.isPublic;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;

    const updatedView = await this.prisma.view.update({
      where: {
        view_id: id,
      },
      data: updateData,
    });

    return this.mapDatabaseToView(updatedView);
  }

  async delete(id: string): Promise<boolean> {
    const existingView = await this.prisma.view.findUnique({
      where: {
        view_id: id,
      },
    });

    if (!existingView) {
      throw new Error('View not found');
    }

    if (existingView.deleted_at) {
      throw new Error('View is already deleted');
    }

    await this.prisma.view.update({
      where: {
        view_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
        is_active: false,
      },
    });

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const existingView = await this.prisma.view.findUnique({
      where: {
        view_id: id,
      },
    });

    if (!existingView) {
      throw new Error('View not found');
    }

    if (!existingView.deleted_at) {
      throw new Error('View is not deleted');
    }

    await this.prisma.view.update({
      where: {
        view_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
        is_active: true,
      },
    });

    return true;
  }

  async count(filters: ViewFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
      deleted_at: null,
    };

    if (filters.userId) {
      where.user_id = filters.userId;
    }

    if (filters.isPublic !== undefined) {
      where.is_public = filters.isPublic;
    }

    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    return this.prisma.view.count({ where });
  }
}
