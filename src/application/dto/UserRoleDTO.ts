export interface UserRoleResponseDTO {
  userId: string;
  roleId: string;
}

export interface UserRoleWithDetailsResponseDTO {
  userId: string;
  roleId: string;
  userName: string;
  userEmail: string;
  roleName: string;
  roleDescription: string;
}

export interface AssignRoleRequestDTO {
  userId: string;
  roleId: string;
}

export interface AssignMultipleRolesRequestDTO {
  userId: string;
  roleIds: string[];
}

export interface ReplaceUserRolesRequestDTO {
  userId: string;
  roleIds: string[];
}

export interface RemoveRoleRequestDTO {
  userId: string;
  roleId: string;
}
