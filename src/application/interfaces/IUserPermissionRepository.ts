import { UserPermission } from '../../domain/entities/UserPermission';

export interface CreateUserPermissionData {
  userId: string;
  permissionId: string;
  granted?: boolean;
  grantedBy?: string;
}

export interface UpdateUserPermissionData {
  granted?: boolean;
  grantedBy?: string;
}

export interface UserPermissionFilters {
  userId?: string;
  permissionId?: string;
  granted?: boolean;
  grantedBy?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface IUserPermissionRepository {
  create(data: CreateUserPermissionData): Promise<UserPermission>;

  findById(
    id: string,
    includeDeleted?: boolean
  ): Promise<UserPermission | null>;

  findByUserAndPermission(
    userId: string,
    permissionId: string
  ): Promise<UserPermission | null>;

  findByUser(
    userId: string,
    filters?: UserPermissionFilters
  ): Promise<UserPermission[]>;

  findByPermission(
    permissionId: string,
    filters?: UserPermissionFilters
  ): Promise<UserPermission[]>;

  findAll(filters?: UserPermissionFilters): Promise<UserPermission[]>;

  update(
    id: string,
    data: UpdateUserPermissionData
  ): Promise<UserPermission | null>;

  delete(id: string): Promise<boolean>;

  softDelete(id: string): Promise<boolean>;

  restore(id: string): Promise<boolean>;

  exists(id: string): Promise<boolean>;

  existsByUserAndPermission(
    userId: string,
    permissionId: string
  ): Promise<boolean>;

  count(filters?: UserPermissionFilters): Promise<number>;

  countByUser(userId: string, filters?: UserPermissionFilters): Promise<number>;

  countByPermission(
    permissionId: string,
    filters?: UserPermissionFilters
  ): Promise<number>;

  // Métodos específicos para gerenciar permissões de usuário
  grantPermission(
    userId: string,
    permissionId: string,
    grantedBy?: string
  ): Promise<UserPermission>;

  revokePermission(userId: string, permissionId: string): Promise<boolean>;

  getUserPermissions(userId: string): Promise<UserPermission[]>;

  hasPermission(
    userId: string,
    functionName: string,
    permissionLevel: string
  ): Promise<boolean>;

  // Métodos para gerenciar permissões em lote
  grantMultiplePermissions(
    userId: string,
    permissionIds: string[],
    grantedBy?: string
  ): Promise<UserPermission[]>;

  revokeMultiplePermissions(
    userId: string,
    permissionIds: string[]
  ): Promise<boolean>;

  replaceUserPermissions(
    userId: string,
    permissionIds: string[],
    grantedBy?: string
  ): Promise<UserPermission[]>;
}
