import { PrismaClient } from '@prisma/client';

import { IEventDescriptionRepository } from '../../../application/interfaces/IEventDescriptionRepository';
import {
  CreateEventDescriptionRequest,
  EventDescription,
  EventDescriptionFilters,
  EventDescriptionStatistics,
  EventDescriptionWithRelations,
  PaginatedEventDescriptionsResponse,
  UpdateEventDescriptionRequest,
} from '../../../domain/entities/EventDescription';

export class PrismaEventDescriptionRepository
  implements IEventDescriptionRepository
{
  constructor(private prisma: PrismaClient) {}

  async create(
    data: CreateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.prisma.eventDescription.create({
      data: {
        title: data.title,
        message: data.message,
        app: data.app,
        viewed: data.viewed || false,
        job_run_data_id: data.jobRunDataId || null,
        stop_cause_id: data.stopCauseId || null,
        sensor_id: data.sensorId || null,
        responsible_id: data.responsibleId || null,
        process_order_id: data.processOrderId,
        tenant_id: tenantId,
      },
    });

    return this.mapToEntity(eventDescription);
  }

  async findById(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription | null> {
    const eventDescription = await this.prisma.eventDescription.findFirst({
      where: {
        event_description_id: eventDescriptionId,
        tenant_id: tenantId,
      },
    });

    return eventDescription ? this.mapToEntity(eventDescription) : null;
  }

  async findAll(
    params: {
      page?: number;
      limit?: number;
      filters?: EventDescriptionFilters;
      includeRelations?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedEventDescriptionsResponse> {
    const { page = 1, limit = 10, filters, includeRelations = false } = params;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (filters) {
      if (filters.search) {
        where.OR = [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { message: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      if (filters.app) {
        where.app = filters.app;
      }

      if (filters.viewed !== undefined) {
        where.viewed = filters.viewed;
      }

      if (filters.stopCauseId) {
        where.stop_cause_id = filters.stopCauseId;
      }

      if (filters.sensorId) {
        where.sensor_id = filters.sensorId;
      }

      if (filters.responsibleId) {
        where.responsible_id = filters.responsibleId;
      }

      if (filters.processOrderId) {
        where.process_order_id = filters.processOrderId;
      }

      if (filters.dateFrom || filters.dateTo) {
        where.created_at = {};
        if (filters.dateFrom) {
          where.created_at.gte = filters.dateFrom;
        }
        if (filters.dateTo) {
          where.created_at.lte = filters.dateTo;
        }
      }
    }

    const [eventDescriptions, total] = await Promise.all([
      this.prisma.eventDescription.findMany({
        where,
        skip,
        take: limit,
        include: includeRelations
          ? {
              stopCause: {
                select: {
                  stop_cause_id: true,
                  description: true,
                },
              },
              sensor: {
                select: {
                  sensor_id: true,
                  name: true,
                },
              },
              responsible: {
                select: {
                  responsible_id: true,
                  name: true,
                  code_responsible: true,
                },
              },
              processOrder: {
                select: {
                  process_order_id: true,
                  name: true,
                },
              },
            }
          : undefined,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.eventDescription.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      eventDescriptions: eventDescriptions.map(eventDescription =>
        this.mapToEntityWithRelations(eventDescription)
      ),
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(
    eventDescriptionId: string,
    data: UpdateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.prisma.eventDescription.update({
      where: {
        event_description_id: eventDescriptionId,
        tenant_id: tenantId,
      },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.message !== undefined && { message: data.message }),
        ...(data.app !== undefined && { app: data.app }),
        ...(data.viewed !== undefined && { viewed: data.viewed }),
        ...(data.jobRunDataId !== undefined && {
          job_run_data_id: data.jobRunDataId || null,
        }),
        ...(data.stopCauseId !== undefined && {
          stop_cause_id: data.stopCauseId || null,
        }),
        ...(data.sensorId !== undefined && {
          sensor_id: data.sensorId || null,
        }),
        ...(data.responsibleId !== undefined && {
          responsible_id: data.responsibleId || null,
        }),
        ...(data.processOrderId !== undefined && {
          process_order_id: data.processOrderId,
        }),
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(eventDescription);
  }

  async delete(eventDescriptionId: string, tenantId: string): Promise<void> {
    await this.prisma.eventDescription.update({
      where: {
        event_description_id: eventDescriptionId,
        tenant_id: tenantId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async restore(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.prisma.eventDescription.update({
      where: {
        event_description_id: eventDescriptionId,
        tenant_id: tenantId,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(eventDescription);
  }

  async findByApp(app: string, tenantId: string): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        app,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async findByStopCause(
    stopCauseId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        stop_cause_id: stopCauseId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async findBySensor(
    sensorId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        sensor_id: sensorId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async findByResponsible(
    responsibleId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        responsible_id: responsibleId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async findByProcessOrder(
    processOrderId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        process_order_id: processOrderId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async findUnviewed(tenantId: string): Promise<EventDescription[]> {
    const eventDescriptions = await this.prisma.eventDescription.findMany({
      where: {
        tenant_id: tenantId,
        viewed: false,
        deleted_at: null,
      },
      orderBy: { created_at: 'desc' },
    });

    return eventDescriptions.map(eventDescription =>
      this.mapToEntity(eventDescription)
    );
  }

  async markAsViewed(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.prisma.eventDescription.update({
      where: {
        event_description_id: eventDescriptionId,
        tenant_id: tenantId,
      },
      data: {
        viewed: true,
        updated_at: new Date(),
      },
    });

    return this.mapToEntity(eventDescription);
  }

  async markAllAsViewed(tenantId: string): Promise<void> {
    await this.prisma.eventDescription.updateMany({
      where: {
        tenant_id: tenantId,
        viewed: false,
        deleted_at: null,
      },
      data: {
        viewed: true,
        updated_at: new Date(),
      },
    });
  }

  async getStatistics(tenantId: string): Promise<EventDescriptionStatistics> {
    const [
      totalEvents,
      activeEvents,
      deletedEvents,
      viewedEvents,
      unviewedEvents,
      eventsByApp,
      eventsByStopCause,
      eventsByResponsible,
    ] = await Promise.all([
      this.prisma.eventDescription.count({ where: { tenant_id: tenantId } }),
      this.prisma.eventDescription.count({
        where: { tenant_id: tenantId, deleted_at: null },
      }),
      this.prisma.eventDescription.count({
        where: { tenant_id: tenantId, deleted_at: { not: null } },
      }),
      this.prisma.eventDescription.count({
        where: { tenant_id: tenantId, deleted_at: null, viewed: true },
      }),
      this.prisma.eventDescription.count({
        where: { tenant_id: tenantId, deleted_at: null, viewed: false },
      }),
      this.prisma.eventDescription.groupBy({
        by: ['app'],
        where: { tenant_id: tenantId, deleted_at: null },
        _count: { event_description_id: true },
      }),
      this.prisma.eventDescription.groupBy({
        by: ['stop_cause_id'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          stop_cause_id: { not: null },
        },
        _count: { event_description_id: true },
      }),
      this.prisma.eventDescription.groupBy({
        by: ['responsible_id'],
        where: {
          tenant_id: tenantId,
          deleted_at: null,
          responsible_id: { not: null },
        },
        _count: { event_description_id: true },
      }),
    ]);

    // Buscar nomes das stop causes
    const stopCauseIds = eventsByStopCause
      .map(item => item.stop_cause_id)
      .filter(Boolean) as string[];
    const stopCauses = await this.prisma.stopCause.findMany({
      where: { stop_cause_id: { in: stopCauseIds } },
      select: { stop_cause_id: true, description: true },
    });

    // Buscar nomes dos responsáveis
    const responsibleIds = eventsByResponsible
      .map(item => item.responsible_id)
      .filter(Boolean) as string[];
    const responsibles = await this.prisma.responsible.findMany({
      where: { responsible_id: { in: responsibleIds } },
      select: { responsible_id: true, name: true },
    });

    const eventsByStopCauseWithNames = eventsByStopCause.map(item => {
      const stopCause = stopCauses.find(
        sc => sc.stop_cause_id === item.stop_cause_id
      );
      return {
        stopCauseName: stopCause?.description || 'Stop Cause não encontrada',
        count: item._count.event_description_id,
      };
    });

    const eventsByResponsibleWithNames = eventsByResponsible.map(item => {
      const responsible = responsibles.find(
        r => r.responsible_id === item.responsible_id
      );
      return {
        responsibleName: responsible?.name || 'Responsável não encontrado',
        count: item._count.event_description_id,
      };
    });

    return {
      totalEvents,
      activeEvents,
      deletedEvents,
      viewedEvents,
      unviewedEvents,
      eventsByApp: eventsByApp.map(item => ({
        app: item.app,
        count: item._count.event_description_id,
      })),
      eventsByStopCause: eventsByStopCauseWithNames,
      eventsByResponsible: eventsByResponsibleWithNames,
    };
  }

  async existsByJobRunData(
    jobRunDataId: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean> {
    const where: any = {
      job_run_data_id: jobRunDataId,
      tenant_id: tenantId,
    };

    if (excludeId) {
      where.event_description_id = { not: excludeId };
    }

    const count = await this.prisma.eventDescription.count({ where });
    return count > 0;
  }

  private mapToEntity(data: any): EventDescription {
    return {
      eventDescriptionId: data.event_description_id,
      title: data.title,
      message: data.message,
      app: data.app,
      viewed: data.viewed,
      jobRunDataId: data.job_run_data_id,
      stopCauseId: data.stop_cause_id,
      sensorId: data.sensor_id,
      responsibleId: data.responsible_id,
      processOrderId: data.process_order_id,
      tenantId: data.tenant_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    };
  }

  private mapToEntityWithRelations(data: any): EventDescriptionWithRelations {
    const eventDescription = this.mapToEntity(data);
    return {
      ...eventDescription,
      stopCause: data.stopCause
        ? {
            stopCauseId: data.stopCause.stop_cause_id,
            name: data.stopCause.name,
            description: data.stopCause.description,
          }
        : undefined,
      sensor: data.sensor
        ? {
            sensorId: data.sensor.sensor_id,
            name: data.sensor.name,
            code: data.sensor.code,
          }
        : undefined,
      responsible: data.responsible
        ? {
            responsibleId: data.responsible.responsible_id,
            name: data.responsible.name,
            codeResponsible: data.responsible.code_responsible,
          }
        : undefined,
      processOrder: data.processOrder
        ? {
            processOrderId: data.processOrder.process_order_id,
            name: data.processOrder.name,
            code: data.processOrder.code,
          }
        : undefined,
    };
  }
}
