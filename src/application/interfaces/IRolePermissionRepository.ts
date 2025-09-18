export interface CreateRolePermissionData {
  roleId: string;
  permissionId: string;
}

export interface RolePermissionFilters {
  roleId?: string;
  permissionId?: string;
}

export interface IRolePermissionRepository {
  create(data: CreateRolePermissionData): Promise<any>;
  findByRoleId(roleId: string): Promise<any[]>;
  findByPermissionId(permissionId: string): Promise<any[]>;
  delete(roleId: string, permissionId: string): Promise<boolean>;
  deleteByRoleId(roleId: string): Promise<boolean>;
  exists(roleId: string, permissionId: string): Promise<boolean>;
}
