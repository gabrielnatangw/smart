import {
  CreateResponsibleRequest,
  PaginatedResponsiblesResponse,
  Responsible,
  ResponsibleStatistics,
  UpdateResponsibleRequest,
} from '../../domain/entities/Responsible';

export interface IResponsibleRepository {
  // CRUD Operations
  create(
    data: CreateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible>;
  findById(
    responsibleId: string,
    tenantId: string
  ): Promise<Responsible | null>;
  findAll(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      includeDeleted?: boolean;
      includeCategory?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedResponsiblesResponse>;
  update(
    responsibleId: string,
    data: UpdateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible>;
  delete(responsibleId: string, tenantId: string): Promise<void>;
  restore(responsibleId: string, tenantId: string): Promise<Responsible>;

  // Business Operations
  findByCategory(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<Responsible[]>;
  findWithoutCategory(tenantId: string): Promise<Responsible[]>;
  findByCode(
    codeResponsible: string,
    tenantId: string
  ): Promise<Responsible | null>;
  findByName(name: string, tenantId: string): Promise<Responsible[]>;

  // Statistics
  getStatistics(tenantId: string): Promise<ResponsibleStatistics>;

  // Validation
  existsByCode(
    codeResponsible: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
  existsByName(
    name: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
}
