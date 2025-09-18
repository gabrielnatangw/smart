import { Role } from '../../domain/entities/Role';

export interface CreateRoleData {
  name: string;
  description: string;
  tenantId: string;
  isActive?: boolean;
}

export interface UpdateRoleData {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface RoleFilters {
  name?: string;
  description?: string;
  tenantId?: string;
  isDeleted?: boolean;
  isActive?: boolean;
}

export interface IRoleRepository {
  create(data: CreateRoleData): Promise<Role>;
  findById(id: string, tenantId?: string): Promise<Role | null>;
  findByName(name: string, tenantId?: string): Promise<Role | null>;
  findAll(filters: RoleFilters): Promise<Role[]>;
  findByIdWithRelations(id: string): Promise<any>;
  findAllWithRelations(filters: RoleFilters): Promise<any[]>;
  findByTenantId(tenantId: string): Promise<Role[]>;
  update(id: string, data: UpdateRoleData): Promise<Role>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filters: RoleFilters): Promise<number>;
}
