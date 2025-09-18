export interface Responsible {
  responsibleId: string;
  name: string;
  codeResponsible: string;
  tenantId?: string;
  categoryResponsibleId?: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface CreateResponsibleRequest {
  name: string;
  codeResponsible: string;
  categoryResponsibleId?: string;
}

export interface UpdateResponsibleRequest {
  name?: string;
  codeResponsible?: string;
  categoryResponsibleId?: string;
}

export interface ResponsibleWithCategory extends Responsible {
  categoryResponsible?: {
    categoryResponsibleId: string;
    name: string;
    description?: string;
  };
}

export interface PaginatedResponsiblesResponse {
  responsibles: ResponsibleWithCategory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ResponsibleStatistics {
  totalResponsibles: number;
  activeResponsibles: number;
  deletedResponsibles: number;
  responsiblesWithCategory: number;
  responsiblesWithoutCategory: number;
  responsiblesByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
}
