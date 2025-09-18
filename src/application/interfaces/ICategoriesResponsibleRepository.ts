import { CategoriesResponsible } from '../../domain/entities/CategoriesResponsible';

// DTOs para requests
export interface CreateCategoriesResponsibleRequest {
  categoryResponsible: string;
  tenantId: string;
}

export interface UpdateCategoriesResponsibleRequest {
  categoryResponsibleId: string;
  categoryResponsible?: string;
  tenantId: string;
}

export interface GetCategoriesResponsibleByIdRequest {
  categoryResponsibleId: string;
  tenantId: string;
}

export interface GetAllCategoriesResponsibleRequest {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

export interface DeleteCategoriesResponsibleRequest {
  categoryResponsibleId: string;
  tenantId: string;
}

export interface RestoreCategoriesResponsibleRequest {
  categoryResponsibleId: string;
  tenantId: string;
}

// DTOs para responses
export interface CategoriesResponsibleResponse {
  categoryResponsibleId: string;
  categoryResponsible: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  responsibleCount?: number;
}

export interface GetAllCategoriesResponsibleResponse {
  categoriesResponsible: CategoriesResponsibleResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponsibleStatisticsResponse {
  totalCategoriesResponsible: number;
  activeCategoriesResponsible: number;
  deletedCategoriesResponsible: number;
  categoriesWithResponsible: number;
  categoriesWithoutResponsible: number;
  averageResponsiblePerCategory: number;
}

// Interface principal do repositório
export interface ICategoriesResponsibleRepository {
  // CRUD Operations
  create(
    data: CreateCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible>;
  findById(
    data: GetCategoriesResponsibleByIdRequest
  ): Promise<CategoriesResponsible | null>;
  findAll(
    data: GetAllCategoriesResponsibleRequest
  ): Promise<GetAllCategoriesResponsibleResponse>;
  update(
    data: UpdateCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible>;
  delete(data: DeleteCategoriesResponsibleRequest): Promise<void>;
  restore(
    data: RestoreCategoriesResponsibleRequest
  ): Promise<CategoriesResponsible>;

  // Business Operations
  findCategoriesResponsibleByName(
    name: string,
    tenantId: string
  ): Promise<CategoriesResponsible[]>;
  findCategoriesWithResponsible(
    tenantId: string
  ): Promise<CategoriesResponsible[]>;
  findCategoriesWithoutResponsible(
    tenantId: string
  ): Promise<CategoriesResponsible[]>;

  // Validation Operations
  existsByIdAndTenant(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<boolean>;
  existsByNameAndTenant(name: string, tenantId: string): Promise<boolean>;
  hasResponsible(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<boolean>;

  // Statistics Operations
  getStatistics(
    tenantId: string
  ): Promise<CategoriesResponsibleStatisticsResponse>;
}
