import {
  Application,
  ApplicationStatistics,
  CreateApplicationRequest,
  PaginatedApplicationsResponse,
  UpdateApplicationRequest,
} from '../../domain/entities/Application';

export interface IApplicationRepository {
  // CRUD Operations
  create(data: CreateApplicationRequest): Promise<Application>;
  findById(applicationId: string): Promise<Application | null>;
  findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    isActive?: boolean;
  }): Promise<PaginatedApplicationsResponse>;
  update(
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<Application>;
  delete(applicationId: string): Promise<void>;
  restore(applicationId: string): Promise<Application>;

  // Business Operations
  findByName(name: string): Promise<Application | null>;
  findByDisplayName(displayName: string): Promise<Application[]>;
  findActive(): Promise<Application[]>;
  findInactive(): Promise<Application[]>;

  // Statistics
  getStatistics(): Promise<ApplicationStatistics>;

  // Validation
  existsByName(name: string, excludeId?: string): Promise<boolean>;
  existsByDisplayName(
    displayName: string,
    excludeId?: string
  ): Promise<boolean>;
}
