export interface AddPermissionToRoleRequestDTO {
  permissionId: string;
}

export interface RemovePermissionFromRoleRequestDTO {
  permissionId: string;
}

export interface UpdateRolePermissionsRequestDTO {
  permissionIds: string[];
}

export interface RolePermissionResponseDTO {
  id: string;
  name: string;
  displayName: string;
  module: string;
  description?: string;
  addedAt: Date;
}

export interface RolePermissionsResponseDTO {
  roleId: string;
  roleName: string;
  permissions: RolePermissionResponseDTO[];
}
