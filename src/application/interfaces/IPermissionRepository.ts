import { Permission } from '../../domain/entities/Permission';

export interface CreatePermissionData {
  functionName: string;
  permissionLevel: string;
  displayName: string;
  description?: string;
  applicationId: string;
}

export interface UpdatePermissionData {
  displayName?: string;
  description?: string;
}

export interface PermissionFilters {
  functionName?: string;
  permissionLevel?: string;
  applicationId?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface IPermissionRepository {
  create(data: CreatePermissionData): Promise<Permission>;

  findById(id: string, includeDeleted?: boolean): Promise<Permission | null>;

  findByFunctionAndLevel(
    functionName: string,
    permissionLevel: string,
    applicationId: string
  ): Promise<Permission | null>;

  findByApplication(
    applicationId: string,
    filters?: PermissionFilters
  ): Promise<Permission[]>;

  findByTenant(
    tenantId: string,
    filters?: PermissionFilters
  ): Promise<Permission[]>;

  findAll(filters?: PermissionFilters): Promise<Permission[]>;

  update(id: string, data: UpdatePermissionData): Promise<Permission | null>;

  delete(id: string): Promise<boolean>;

  softDelete(id: string): Promise<boolean>;

  restore(id: string): Promise<boolean>;

  exists(id: string): Promise<boolean>;

  existsByFunctionAndLevel(
    functionName: string,
    permissionLevel: string,
    applicationId: string
  ): Promise<boolean>;

  count(filters?: PermissionFilters): Promise<number>;

  countByApplication(
    applicationId: string,
    filters?: PermissionFilters
  ): Promise<number>;

  // Métodos para gerenciar permissões por função
  getPermissionsByFunction(
    functionName: string,
    applicationId: string
  ): Promise<Permission[]>;

  getAvailableFunctions(applicationId: string): Promise<string[]>;

  getAvailableLevels(
    functionName: string,
    applicationId: string
  ): Promise<string[]>;
}
