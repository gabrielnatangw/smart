import {
  CreateEventDescriptionRequest,
  EventDescription,
  EventDescriptionFilters,
  EventDescriptionStatistics,
  PaginatedEventDescriptionsResponse,
  UpdateEventDescriptionRequest,
} from '../../domain/entities/EventDescription';

export interface IEventDescriptionRepository {
  // CRUD Operations
  create(
    data: CreateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription>;
  findById(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription | null>;
  findAll(
    params: {
      page?: number;
      limit?: number;
      filters?: EventDescriptionFilters;
      includeRelations?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedEventDescriptionsResponse>;
  update(
    eventDescriptionId: string,
    data: UpdateEventDescriptionRequest,
    tenantId: string
  ): Promise<EventDescription>;
  delete(eventDescriptionId: string, tenantId: string): Promise<void>;
  restore(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription>;

  // Business Operations
  findByApp(app: string, tenantId: string): Promise<EventDescription[]>;
  findByStopCause(
    stopCauseId: string,
    tenantId: string
  ): Promise<EventDescription[]>;
  findBySensor(sensorId: string, tenantId: string): Promise<EventDescription[]>;
  findByResponsible(
    responsibleId: string,
    tenantId: string
  ): Promise<EventDescription[]>;
  findByProcessOrder(
    processOrderId: string,
    tenantId: string
  ): Promise<EventDescription[]>;
  findUnviewed(tenantId: string): Promise<EventDescription[]>;
  markAsViewed(
    eventDescriptionId: string,
    tenantId: string
  ): Promise<EventDescription>;
  markAllAsViewed(tenantId: string): Promise<void>;

  // Statistics
  getStatistics(tenantId: string): Promise<EventDescriptionStatistics>;

  // Validation
  existsByJobRunData(
    jobRunDataId: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
}
