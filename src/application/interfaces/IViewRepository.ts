import { View } from '../../domain/entities/View';

export interface CreateViewData {
  name: string;
  isDefault?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
  tenantId: string;
  userId: string;
  createdBy: string;
  updatedBy: string;
}

export interface UpdateViewData {
  name?: string;
  isDefault?: boolean;
  isPublic?: boolean;
  isActive?: boolean;
  updatedBy: string;
}

export interface ViewFilters {
  tenantId: string;
  userId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  name?: string;
}

export interface IViewRepository {
  create(data: CreateViewData): Promise<View>;
  findById(id: string): Promise<View | null>;
  findByTenant(tenantId: string, filters?: ViewFilters): Promise<View[]>;
  findByUser(userId: string, tenantId: string): Promise<View[]>;
  findByUserWithCards(userId: string, tenantId: string): Promise<View[]>;
  update(id: string, data: UpdateViewData): Promise<View>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filters: ViewFilters): Promise<number>;
}
