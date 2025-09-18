import { PrismaClient } from '@prisma/client';

import {
  CreateUserRoleData,
  IUserRoleRepository,
  UserRoleWithDetails,
} from '../../../application/interfaces/IUserRoleRepository';
import { UserRole } from '../../../domain/entities/UserRole';

export class PrismaUserRoleRepository implements IUserRoleRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToUserRole(userRoleData: any): UserRole {
    return UserRole.fromPersistence({
      userId: userRoleData.user_id,
      roleId: userRoleData.role_id,
    });
  }

  private mapDatabaseToUserRoleWithDetails(data: any): UserRoleWithDetails {
    return {
      userId: data.user_id,
      roleId: data.role_id,
      userName: data.user.name,
      userEmail: data.user.email,
      roleName: data.role.name,
      roleDescription: data.role.description,
    };
  }

  async create(data: CreateUserRoleData): Promise<UserRole> {
    try {
      // Check if user exists and is not deleted
      const user = await this.prisma.user.findUnique({
        where: { user_id: data.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      if (user.deleted_at !== null) {
        throw new Error('Cannot assign role to deleted user');
      }

      // Check if role exists and is not deleted
      const role = await this.prisma.role.findUnique({
        where: { role_id: data.roleId },
      });

      if (!role) {
        throw new Error('Role not found');
      }

      if (role.deleted_at !== null) {
        throw new Error('Cannot assign deleted role');
      }

      // Check if user-role assignment already exists
      const existingUserRole = await this.prisma.userRole.findUnique({
        where: {
          user_id_role_id: {
            user_id: data.userId,
            role_id: data.roleId,
          },
        },
      });

      if (existingUserRole) {
        throw new Error('User already has this role');
      }

      const userRoleData = await this.prisma.userRole.create({
        data: {
          user_id: data.userId,
          role_id: data.roleId,
        },
      });

      return this.mapDatabaseToUserRole(userRoleData);
    } catch (error: any) {
      if (
        error.message === 'User not found' ||
        error.message === 'Role not found' ||
        error.message === 'Cannot assign role to deleted user' ||
        error.message === 'Cannot assign deleted role' ||
        error.message === 'User already has this role'
      ) {
        throw error;
      }
      throw new Error(`Failed to create user role: ${error.message}`);
    }
  }

  async findByUserId(userId: string): Promise<UserRole[]> {
    try {
      const userRolesData = await this.prisma.userRole.findMany({
        where: {
          user_id: userId,
        },
      });

      return userRolesData.map(userRoleData =>
        this.mapDatabaseToUserRole(userRoleData)
      );
    } catch (error: any) {
      throw new Error(`Failed to find user roles by user id: ${error.message}`);
    }
  }

  async findByRoleId(roleId: string): Promise<UserRole[]> {
    try {
      const userRolesData = await this.prisma.userRole.findMany({
        where: {
          role_id: roleId,
        },
      });

      return userRolesData.map(userRoleData =>
        this.mapDatabaseToUserRole(userRoleData)
      );
    } catch (error: any) {
      throw new Error(`Failed to find user roles by role id: ${error.message}`);
    }
  }

  async findByUserAndRole(
    userId: string,
    roleId: string
  ): Promise<UserRole | null> {
    try {
      const userRoleData = await this.prisma.userRole.findUnique({
        where: {
          user_id_role_id: {
            user_id: userId,
            role_id: roleId,
          },
        },
      });

      return userRoleData ? this.mapDatabaseToUserRole(userRoleData) : null;
    } catch (error: any) {
      throw new Error(`Failed to find user role: ${error.message}`);
    }
  }

  async findAllWithDetails(): Promise<UserRoleWithDetails[]> {
    try {
      const userRolesData = await this.prisma.userRole.findMany({
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          role: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: [{ user: { name: 'asc' } }, { role: { name: 'asc' } }],
      });

      return userRolesData.map(data =>
        this.mapDatabaseToUserRoleWithDetails(data)
      );
    } catch (error: any) {
      throw new Error(
        `Failed to find all user roles with details: ${error.message}`
      );
    }
  }

  async findByUserIdWithDetails(
    userId: string
  ): Promise<UserRoleWithDetails[]> {
    try {
      const userRolesData = await this.prisma.userRole.findMany({
        where: {
          user_id: userId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          role: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          role: { name: 'asc' },
        },
      });

      return userRolesData.map(data =>
        this.mapDatabaseToUserRoleWithDetails(data)
      );
    } catch (error: any) {
      throw new Error(
        `Failed to find user roles with details by user id: ${error.message}`
      );
    }
  }

  async findByRoleIdWithDetails(
    roleId: string
  ): Promise<UserRoleWithDetails[]> {
    try {
      const userRolesData = await this.prisma.userRole.findMany({
        where: {
          role_id: roleId,
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          role: {
            select: {
              name: true,
              description: true,
            },
          },
        },
        orderBy: {
          user: { name: 'asc' },
        },
      });

      return userRolesData.map(data =>
        this.mapDatabaseToUserRoleWithDetails(data)
      );
    } catch (error: any) {
      throw new Error(
        `Failed to find user roles with details by role id: ${error.message}`
      );
    }
  }

  async delete(userId: string, roleId: string): Promise<boolean> {
    try {
      const existingUserRole = await this.prisma.userRole.findUnique({
        where: {
          user_id_role_id: {
            user_id: userId,
            role_id: roleId,
          },
        },
      });

      if (!existingUserRole) {
        throw new Error('User role assignment not found');
      }

      await this.prisma.userRole.delete({
        where: {
          user_id_role_id: {
            user_id: userId,
            role_id: roleId,
          },
        },
      });

      return true;
    } catch (error: any) {
      if (error.message === 'User role assignment not found') {
        throw error;
      }
      throw new Error(`Failed to delete user role: ${error.message}`);
    }
  }

  async deleteAllByUserId(userId: string): Promise<boolean> {
    try {
      await this.prisma.userRole.deleteMany({
        where: {
          user_id: userId,
        },
      });

      return true;
    } catch (error: any) {
      throw new Error(
        `Failed to delete all user roles by user id: ${error.message}`
      );
    }
  }

  async deleteAllByRoleId(roleId: string): Promise<boolean> {
    try {
      await this.prisma.userRole.deleteMany({
        where: {
          role_id: roleId,
        },
      });

      return true;
    } catch (error: any) {
      throw new Error(
        `Failed to delete all user roles by role id: ${error.message}`
      );
    }
  }

  async exists(userId: string, roleId: string): Promise<boolean> {
    try {
      const userRole = await this.prisma.userRole.findUnique({
        where: {
          user_id_role_id: {
            user_id: userId,
            role_id: roleId,
          },
        },
      });

      return userRole !== null;
    } catch (error: any) {
      throw new Error(`Failed to check if user role exists: ${error.message}`);
    }
  }
}
