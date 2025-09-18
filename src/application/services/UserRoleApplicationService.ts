import { UserRole } from '../../domain/entities/UserRole';
import {
  IUserRoleRepository,
  UserRoleWithDetails,
} from '../interfaces/IUserRoleRepository';

export class UserRoleApplicationService {
  constructor(private userRoleRepository: IUserRoleRepository) {}

  async assignRole(data: {
    userId: string;
    roleId: string;
  }): Promise<UserRole> {
    try {
      return await this.userRoleRepository.create(data);
    } catch (error: any) {
      throw error;
    }
  }

  async removeRole(userId: string, roleId: string): Promise<boolean> {
    try {
      return await this.userRoleRepository.delete(userId, roleId);
    } catch (error: any) {
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    try {
      return await this.userRoleRepository.findByUserId(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async getUserRolesWithDetails(
    userId: string
  ): Promise<UserRoleWithDetails[]> {
    try {
      return await this.userRoleRepository.findByUserIdWithDetails(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleUsers(roleId: string): Promise<UserRole[]> {
    try {
      return await this.userRoleRepository.findByRoleId(roleId);
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleUsersWithDetails(
    roleId: string
  ): Promise<UserRoleWithDetails[]> {
    try {
      return await this.userRoleRepository.findByRoleIdWithDetails(roleId);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllUserRolesWithDetails(): Promise<UserRoleWithDetails[]> {
    try {
      return await this.userRoleRepository.findAllWithDetails();
    } catch (error: any) {
      throw error;
    }
  }

  async hasRole(userId: string, roleId: string): Promise<boolean> {
    try {
      return await this.userRoleRepository.exists(userId, roleId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeAllUserRoles(userId: string): Promise<boolean> {
    try {
      return await this.userRoleRepository.deleteAllByUserId(userId);
    } catch (error: any) {
      throw error;
    }
  }

  async removeAllRoleAssignments(roleId: string): Promise<boolean> {
    try {
      return await this.userRoleRepository.deleteAllByRoleId(roleId);
    } catch (error: any) {
      throw error;
    }
  }

  async assignMultipleRoles(
    userId: string,
    roleIds: string[]
  ): Promise<UserRole[]> {
    try {
      const results: UserRole[] = [];

      for (const roleId of roleIds) {
        try {
          const userRole = await this.userRoleRepository.create({
            userId,
            roleId,
          });
          results.push(userRole);
        } catch (error: any) {
          if (error.message === 'User already has this role') {
            continue;
          }
          throw error;
        }
      }

      return results;
    } catch (error: any) {
      throw error;
    }
  }

  async replaceUserRoles(
    userId: string,
    roleIds: string[]
  ): Promise<UserRole[]> {
    try {
      await this.userRoleRepository.deleteAllByUserId(userId);

      return await this.assignMultipleRoles(userId, roleIds);
    } catch (error: any) {
      throw error;
    }
  }
}
