import { UserRole } from '../../domain/entities/UserRole';

export interface CreateUserRoleData {
  userId: string;
  roleId: string;
}

export interface UserRoleWithDetails {
  userId: string;
  roleId: string;
  userName: string;
  userEmail: string;
  roleName: string;
  roleDescription: string;
}

export interface IUserRoleRepository {
  create(data: CreateUserRoleData): Promise<UserRole>;
  findByUserId(userId: string): Promise<UserRole[]>;
  findByRoleId(roleId: string): Promise<UserRole[]>;
  findByUserAndRole(userId: string, roleId: string): Promise<UserRole | null>;
  findAllWithDetails(): Promise<UserRoleWithDetails[]>;
  findByUserIdWithDetails(userId: string): Promise<UserRoleWithDetails[]>;
  findByRoleIdWithDetails(roleId: string): Promise<UserRoleWithDetails[]>;
  delete(userId: string, roleId: string): Promise<boolean>;
  deleteAllByUserId(userId: string): Promise<boolean>;
  deleteAllByRoleId(roleId: string): Promise<boolean>;
  exists(userId: string, roleId: string): Promise<boolean>;
}
