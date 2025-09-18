export interface RoleResponseDTO {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  isDeleted: boolean;
  permissions?: Array<{
    id: string;
    name: string;
    displayName: string;
    module: string;
    description?: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    email: string;
    accessType: string;
  }>;
}

export interface CreateRoleRequestDTO {
  name: string;
  description: string;
  tenantId: string;
}

export interface UpdateRoleRequestDTO {
  name?: string;
  description?: string;
}

export interface RoleFiltersDTO {
  name?: string;
  description?: string;
  tenantId?: string;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
}

export interface RoleStatsDTO {
  total: number;
  active: number;
  inactive: number;
  deleted: number;
}
