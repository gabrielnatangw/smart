import { Tenant } from '../../domain/entities/Tenant';

export interface CreateTenantData {
  name: string;
  cnpj?: string | undefined;
  address?: string | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateTenantData {
  name?: string | undefined;
  cnpj?: string | undefined;
  address?: string | undefined;
  isActive?: boolean | undefined;
}

export interface TenantFilters {
  name?: string | undefined;
  cnpj?: string | undefined;
  isActive?: boolean | undefined;
  includeDeleted?: boolean | undefined;
}

export interface ITenantRepository {
  create(data: CreateTenantData): Promise<Tenant>;

  findById(id: string, includeDeleted?: boolean): Promise<Tenant | null>;

  findByCNPJ(cnpj: string, includeDeleted?: boolean): Promise<Tenant | null>;

  findAll(filters?: TenantFilters): Promise<Tenant[]>;

  update(id: string, data: UpdateTenantData): Promise<Tenant | null>;

  delete(id: string): Promise<boolean>;

  softDelete(id: string): Promise<boolean>;

  restore(id: string): Promise<boolean>;

  exists(id: string): Promise<boolean>;

  existsByCNPJ(cnpj: string, excludeId?: string): Promise<boolean>;

  count(filters?: TenantFilters): Promise<number>;
}
