export interface EventDescription {
  eventDescriptionId: string;
  title: string;
  message: string;
  app: string;
  viewed: boolean;
  jobRunDataId?: string;
  stopCauseId?: string;
  sensorId?: string;
  responsibleId?: string;
  processOrderId: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateEventDescriptionRequest {
  title: string;
  message: string;
  app: string;
  viewed?: boolean;
  jobRunDataId?: string;
  stopCauseId?: string;
  sensorId?: string;
  responsibleId?: string;
  processOrderId: string;
}

export interface UpdateEventDescriptionRequest {
  title?: string;
  message?: string;
  app?: string;
  viewed?: boolean;
  jobRunDataId?: string;
  stopCauseId?: string;
  sensorId?: string;
  responsibleId?: string;
  processOrderId?: string;
}

export interface EventDescriptionWithRelations extends EventDescription {
  stopCause?: {
    stopCauseId: string;
    name: string;
    description?: string;
  };
  sensor?: {
    sensorId: string;
    name: string;
    code: string;
  };
  responsible?: {
    responsibleId: string;
    name: string;
    codeResponsible: string;
  };
  processOrder?: {
    processOrderId: string;
    name: string;
    code: string;
  };
}

export interface PaginatedEventDescriptionsResponse {
  eventDescriptions: EventDescriptionWithRelations[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventDescriptionStatistics {
  totalEvents: number;
  activeEvents: number;
  deletedEvents: number;
  viewedEvents: number;
  unviewedEvents: number;
  eventsByApp: Array<{
    app: string;
    count: number;
  }>;
  eventsByStopCause: Array<{
    stopCauseName: string;
    count: number;
  }>;
  eventsByResponsible: Array<{
    responsibleName: string;
    count: number;
  }>;
}

export interface EventDescriptionFilters {
  search?: string;
  app?: string;
  viewed?: boolean;
  stopCauseId?: string;
  sensorId?: string;
  responsibleId?: string;
  processOrderId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}
