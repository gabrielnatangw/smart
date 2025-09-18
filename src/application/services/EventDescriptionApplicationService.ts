import {
  CreateEventDescriptionRequest,
  EventDescription,
  EventDescriptionFilters,
  EventDescriptionStatistics,
  PaginatedEventDescriptionsResponse,
  UpdateEventDescriptionRequest,
} from '../../domain/entities/EventDescription';
import { IEventDescriptionRepository } from '../interfaces/IEventDescriptionRepository';

export class EventDescriptionApplicationService {
  constructor(
    private eventDescriptionRepository: IEventDescriptionRepository
  ) {}

  // CRUD Operations
  async createEventDescription(
    data: CreateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription> {
    // Validações de negócio
    if (
      data.jobRunDataId &&
      (await this.eventDescriptionRepository.existsByJobRunData(
        data.jobRunDataId,
        tenantId
      ))
    ) {
      throw new Error('Evento com jobRunDataId já existe');
    }

    return this.eventDescriptionRepository.create(data, tenantId);
  }

  async getEventDescriptionById(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.eventDescriptionRepository.findById(
      eventDescriptionId,
      tenantId
    );
    if (!eventDescription) {
      throw new Error('Descrição de evento não encontrada');
    }
    return eventDescription;
  }

  async getAllEventDescriptions(
    params: {
      page?: number;
      limit?: number;
      filters?: EventDescriptionFilters;
      includeRelations?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedEventDescriptionsResponse> {
    return this.eventDescriptionRepository.findAll(params, tenantId);
  }

  async updateEventDescription(
    eventDescriptionId: string,
    data: UpdateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription> {
    // Verificar se o evento existe
    const existingEvent = await this.eventDescriptionRepository.findById(
      eventDescriptionId,
      tenantId
    );
    if (!existingEvent) {
      throw new Error('Descrição de evento não encontrada');
    }

    // Validações de negócio para atualização
    if (
      data.jobRunDataId &&
      (await this.eventDescriptionRepository.existsByJobRunData(
        data.jobRunDataId,
        tenantId,
        eventDescriptionId
      ))
    ) {
      throw new Error('Evento com jobRunDataId já existe');
    }

    return this.eventDescriptionRepository.update(
      eventDescriptionId,
      data,
      tenantId
    );
  }

  async deleteEventDescription(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<void> {
    const eventDescription = await this.eventDescriptionRepository.findById(
      eventDescriptionId,
      tenantId
    );
    if (!eventDescription) {
      throw new Error('Descrição de evento não encontrada');
    }

    if (eventDescription.deletedAt) {
      throw new Error('Descrição de evento já está excluída');
    }

    await this.eventDescriptionRepository.delete(eventDescriptionId, tenantId);
  }

  async restoreEventDescription(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.eventDescriptionRepository.findById(
      eventDescriptionId,
      tenantId
    );
    if (!eventDescription) {
      throw new Error('Descrição de evento não encontrada');
    }

    if (!eventDescription.deletedAt) {
      throw new Error('Descrição de evento não está excluída');
    }

    return this.eventDescriptionRepository.restore(
      eventDescriptionId,
      tenantId
    );
  }

  // Business Operations
  async getEventDescriptionsByApp(
    app: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findByApp(app, tenantId);
  }

  async getEventDescriptionsByStopCause(
    stopCauseId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findByStopCause(
      stopCauseId,
      tenantId
    );
  }

  async getEventDescriptionsBySensor(
    sensorId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findBySensor(sensorId, tenantId);
  }

  async getEventDescriptionsByResponsible(
    responsibleId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findByResponsible(
      responsibleId,
      tenantId
    );
  }

  async getEventDescriptionsByProcessOrder(
    processOrderId: string,
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findByProcessOrder(
      processOrderId,
      tenantId
    );
  }

  async getUnviewedEventDescriptions(
    tenantId: string
  ): Promise<EventDescription[]> {
    return this.eventDescriptionRepository.findUnviewed(tenantId);
  }

  async markEventDescriptionAsViewed(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription> {
    const eventDescription = await this.eventDescriptionRepository.findById(
      eventDescriptionId,
      tenantId
    );
    if (!eventDescription) {
      throw new Error('Descrição de evento não encontrada');
    }

    if (eventDescription.viewed) {
      throw new Error('Descrição de evento já foi visualizada');
    }

    return this.eventDescriptionRepository.markAsViewed(
      eventDescriptionId,
      tenantId
    );
  }

  async markAllEventDescriptionsAsViewed(tenantId: string): Promise<void> {
    await this.eventDescriptionRepository.markAllAsViewed(tenantId);
  }

  // Statistics
  async getEventDescriptionStatistics(
    tenantId: string
  ): Promise<EventDescriptionStatistics> {
    return this.eventDescriptionRepository.getStatistics(tenantId);
  }
}
