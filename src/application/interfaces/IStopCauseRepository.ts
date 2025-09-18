import { StopCause } from '../../domain/entities/StopCause';

// DTOs para requests
export interface CreateStopCauseRequest {
  description: string;
  parentId?: string;
  tenantId: string;
}

export interface UpdateStopCauseRequest {
  stopCauseId: string;
  description?: string;
  parentId?: string;
  tenantId: string;
}

export interface GetStopCauseByIdRequest {
  stopCauseId: string;
  tenantId: string;
}

export interface GetAllStopCausesRequest {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
  includeHierarchy?: boolean;
}

export interface DeleteStopCauseRequest {
  stopCauseId: string;
  tenantId: string;
}

export interface RestoreStopCauseRequest {
  stopCauseId: string;
  tenantId: string;
}

export interface GetHierarchyRequest {
  tenantId: string;
  includeDeleted?: boolean;
}

export interface MoveStopCauseRequest {
  stopCauseId: string;
  newParentId?: string;
  tenantId: string;
}

// DTOs para responses
export interface StopCauseResponse {
  stopCauseId: string;
  description: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  parentId?: string;
  parent?: StopCauseResponse;
  children?: StopCauseResponse[];
  level: number;
  isRoot: boolean;
  isLeaf: boolean;
}

export interface GetAllStopCausesResponse {
  stopCauses: StopCauseResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StopCauseHierarchyResponse {
  stopCauses: StopCauseResponse[];
  total: number;
  rootCount: number;
  maxDepth: number;
}

export interface StopCauseStatisticsResponse {
  totalStopCauses: number;
  activeStopCauses: number;
  deletedStopCauses: number;
  rootStopCauses: number;
  leafStopCauses: number;
  averageDepth: number;
  maxDepth: number;
  stopCausesByLevel: Record<number, number>;
}

// Interface principal do repositório
export interface IStopCauseRepository {
  // CRUD Operations
  create(data: CreateStopCauseRequest): Promise<StopCause>;
  findById(data: GetStopCauseByIdRequest): Promise<StopCause | null>;
  findAll(data: GetAllStopCausesRequest): Promise<GetAllStopCausesResponse>;
  update(data: UpdateStopCauseRequest): Promise<StopCause>;
  delete(data: DeleteStopCauseRequest): Promise<void>;
  restore(data: RestoreStopCauseRequest): Promise<StopCause>;

  // Hierarchy Operations
  getHierarchy(data: GetHierarchyRequest): Promise<StopCauseHierarchyResponse>;
  getRootStopCauses(
    tenantId: string,
    includeDeleted?: boolean
  ): Promise<StopCause[]>;
  getChildren(stopCauseId: string, tenantId: string): Promise<StopCause[]>;
  getParent(stopCauseId: string, tenantId: string): Promise<StopCause | null>;
  getAncestors(stopCauseId: string, tenantId: string): Promise<StopCause[]>;
  getDescendants(stopCauseId: string, tenantId: string): Promise<StopCause[]>;
  moveStopCause(data: MoveStopCauseRequest): Promise<StopCause>;

  // Business Operations
  findRootStopCauses(tenantId: string): Promise<StopCause[]>;
  findLeafStopCauses(tenantId: string): Promise<StopCause[]>;
  findStopCausesByLevel(level: number, tenantId: string): Promise<StopCause[]>;
  findStopCausesByDescription(
    description: string,
    tenantId: string
  ): Promise<StopCause[]>;

  // Validation Operations
  existsByIdAndTenant(stopCauseId: string, tenantId: string): Promise<boolean>;
  existsByDescriptionAndTenant(
    description: string,
    tenantId: string
  ): Promise<boolean>;
  hasChildren(stopCauseId: string, tenantId: string): Promise<boolean>;
  hasParent(stopCauseId: string, tenantId: string): Promise<boolean>;
  isDescendantOf(
    descendantId: string,
    ancestorId: string,
    tenantId: string
  ): Promise<boolean>;

  // Statistics Operations
  getStatistics(tenantId: string): Promise<StopCauseStatisticsResponse>;
}
