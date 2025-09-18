import { User, UserType } from '../../domain/entities/User';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  userType: UserType;
  tenantId?: string;
  firstLogin?: boolean | undefined;
  isActive?: boolean | undefined;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  userType?: UserType;
  tenantId?: string;
  isActive?: boolean;
  firstLogin?: boolean;
}

export interface UserFilters {
  name?: string;
  email?: string;
  userType?: UserType;
  isActive?: boolean;
  firstLogin?: boolean;
  tenantId?: string;
  includeDeleted?: boolean;
  page?: number;
  limit?: number;
  offset?: number;
}

export interface IUserRepository {
  create(data: CreateUserData): Promise<User>;

  findById(id: string, includeDeleted?: boolean): Promise<User | null>;

  findByEmail(email: string, includeDeleted?: boolean): Promise<User | null>;

  findByTenant(tenantId: string, filters?: UserFilters): Promise<User[]>;

  findAll(filters?: UserFilters): Promise<User[]>;

  update(id: string, data: UpdateUserData): Promise<User | null>;

  delete(id: string): Promise<boolean>;

  softDelete(id: string): Promise<boolean>;

  restore(id: string): Promise<boolean>;

  exists(id: string): Promise<boolean>;

  existsByEmail(email: string, excludeId?: string): Promise<boolean>;

  count(filters?: UserFilters): Promise<number>;

  countByTenant(tenantId: string, filters?: UserFilters): Promise<number>;

  findTenantAdmins(tenantId: string): Promise<User[]>;

  findFirstTenantAdmin(tenantId: string): Promise<User | null>;
}
