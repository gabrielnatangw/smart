import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateViewCardData,
  IViewCardRepository,
  UpdateViewCardData,
  ViewCardFilters,
} from '../../../application/interfaces/IViewCardRepository';
import { ViewCard } from '../../../domain/entities/ViewCard';

export class PrismaViewCardRepository implements IViewCardRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToViewCard(cardData: any): ViewCard {
    return ViewCard.fromPersistence({
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
    });
  }

  async create(data: CreateViewCardData): Promise<ViewCard> {
    const cardData = await this.prisma.viewCard.create({
      data: {
        card_id: uuidv4(),
        view_id: data.viewId,
        sensor_id: data.sensorId,
        module_id: data.moduleId,
        machine_id: data.machineId,
        position_x: data.positionX,
        position_y: data.positionY,
        width: data.width,
        height: data.height,
        chart_type: data.chartType as any,
        title: data.title,
        sort_order: data.sortOrder ?? 0,
        tenant_id: data.tenantId,
        created_by: data.createdBy,
        updated_by: data.updatedBy,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.mapDatabaseToViewCard(cardData);
  }

  async findById(id: string): Promise<ViewCard | null> {
    const cardData = await this.prisma.viewCard.findFirst({
      where: {
        card_id: id,
        deleted_at: null,
      },
    });

    if (!cardData) {
      return null;
    }

    return this.mapDatabaseToViewCard(cardData);
  }

  async findByIdIncludingDeleted(id: string): Promise<ViewCard | null> {
    const cardData = await this.prisma.viewCard.findUnique({
      where: {
        card_id: id,
      },
    });

    if (!cardData) {
      return null;
    }

    return this.mapDatabaseToViewCard(cardData);
  }

  async findByView(viewId: string, tenantId: string): Promise<ViewCard[]> {
    const cardsData = await this.prisma.viewCard.findMany({
      where: {
        view_id: viewId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: {
        sort_order: 'asc',
      },
    });

    return cardsData.map(cardData => this.mapDatabaseToViewCard(cardData));
  }

  async findBySensor(sensorId: string, tenantId: string): Promise<ViewCard[]> {
    const cardsData = await this.prisma.viewCard.findMany({
      where: {
        sensor_id: sensorId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return cardsData.map(cardData => this.mapDatabaseToViewCard(cardData));
  }

  async findByViewAndSensor(
    viewId: string,
    sensorId: string
  ): Promise<ViewCard | null> {
    const cardData = await this.prisma.viewCard.findFirst({
      where: {
        view_id: viewId,
        sensor_id: sensorId,
        deleted_at: null,
      },
    });

    if (!cardData) {
      return null;
    }

    return this.mapDatabaseToViewCard(cardData);
  }

  async findByViewSensorAndChartType(
    viewId: string,
    sensorId: string,
    chartType: string
  ): Promise<ViewCard | null> {
    const cardData = await this.prisma.viewCard.findFirst({
      where: {
        view_id: viewId,
        sensor_id: sensorId,
        chart_type: chartType as any,
        deleted_at: null,
      },
    });

    if (!cardData) {
      return null;
    }

    return this.mapDatabaseToViewCard(cardData);
  }

  async update(id: string, data: UpdateViewCardData): Promise<ViewCard> {
    const existingCard = await this.prisma.viewCard.findUnique({
      where: {
        card_id: id,
      },
    });

    if (!existingCard) {
      throw new Error('View card not found');
    }

    if (existingCard.deleted_at) {
      throw new Error('Cannot update deleted view card');
    }

    const updateData: any = {
      updated_at: new Date(),
      updated_by: data.updatedBy,
    };

    if (data.positionX !== undefined) updateData.position_x = data.positionX;
    if (data.positionY !== undefined) updateData.position_y = data.positionY;
    if (data.width !== undefined) updateData.width = data.width;
    if (data.height !== undefined) updateData.height = data.height;
    if (data.chartType !== undefined)
      updateData.chart_type = data.chartType as any;
    if (data.title !== undefined) updateData.title = data.title;
    if (data.sortOrder !== undefined) updateData.sort_order = data.sortOrder;

    const updatedCard = await this.prisma.viewCard.update({
      where: {
        card_id: id,
      },
      data: updateData,
    });

    return this.mapDatabaseToViewCard(updatedCard);
  }

  async delete(id: string): Promise<boolean> {
    console.log('🔍 [DEBUG] Repository: Iniciando exclusão do card:', id);

    const existingCard = await this.prisma.viewCard.findUnique({
      where: {
        card_id: id,
      },
    });

    console.log(
      '🔍 [DEBUG] Repository: Card encontrado:',
      existingCard ? 'Sim' : 'Não'
    );

    if (!existingCard) {
      throw new Error('View card not found');
    }

    console.log(
      '🔍 [DEBUG] Repository: Card já deletado?',
      !!existingCard.deleted_at
    );

    if (existingCard.deleted_at) {
      throw new Error('View card is already deleted');
    }

    console.log('🔍 [DEBUG] Repository: Executando update no banco...');

    const result = await this.prisma.viewCard.update({
      where: {
        card_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    console.log('🔍 [DEBUG] Repository: Update executado com sucesso:', {
      deleted_at: result.deleted_at,
    });

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const existingCard = await this.prisma.viewCard.findUnique({
      where: {
        card_id: id,
      },
    });

    if (!existingCard) {
      throw new Error('View card not found');
    }

    if (!existingCard.deleted_at) {
      throw new Error('View card is not deleted');
    }

    await this.prisma.viewCard.update({
      where: {
        card_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return true;
  }

  async count(filters: ViewCardFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
      deleted_at: null,
    };

    if (filters.viewId) {
      where.view_id = filters.viewId;
    }

    if (filters.sensorId) {
      where.sensor_id = filters.sensorId;
    }

    if (filters.moduleId) {
      where.module_id = filters.moduleId;
    }

    if (filters.machineId) {
      where.machine_id = filters.machineId;
    }

    return this.prisma.viewCard.count({ where });
  }

  async updatePositions(
    cards: Array<{
      id: string;
      positionX: number;
      positionY: number;
      width: number;
      height: number;
    }>,
    updatedBy: string
  ): Promise<void> {
    await Promise.all(
      cards.map(card =>
        this.prisma.viewCard.updateMany({
          where: {
            card_id: card.id,
            deleted_at: null, // Só atualiza cards que não foram deletados
          },
          data: {
            position_x: card.positionX,
            position_y: card.positionY,
            width: card.width,
            height: card.height,
            updated_at: new Date(),
            updated_by: updatedBy,
          },
        })
      )
    );
  }
}
