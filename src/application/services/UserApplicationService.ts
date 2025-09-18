import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

import { User, UserType } from '../../domain/entities/User';
import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { IUserPermissionRepository } from '../interfaces/IUserPermissionRepository';
import {
  CreateUserData,
  IUserRepository,
  UpdateUserData,
  UserFilters,
} from '../interfaces/IUserRepository';
import { AdminPermissionService } from './AdminPermissionService';

export class UserApplicationService {
  private adminPermissionService: AdminPermissionService;

  constructor(
    private userRepository: IUserRepository,
    private userPermissionRepository: IUserPermissionRepository,
    private permissionRepository: IPermissionRepository,
    private prisma: PrismaClient
  ) {
    this.adminPermissionService = new AdminPermissionService(prisma);
  }

  async createUser(data: CreateUserData): Promise<User> {
    const existingUser = await this.userRepository.existsByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const user = User.create({
      id: randomUUID(),
      ...data,
    });

    const createdUser = await this.userRepository.create({
      name: user.name,
      email: user.email,
      password: user.password,
      userType: user.userType,
      tenantId: user.tenantId,
      firstLogin: user.firstLogin,
      isActive: user.isActive,
    });

    // Se o usuário é admin, verifica se deve receber permissões padrão automaticamente
    if (user.userType === UserType.ADMIN) {
      try {
        await this.adminPermissionService.grantFullAccessToFirstAdmin(
          createdUser.id,
          createdUser.tenantId
        );
      } catch (error) {
        console.error(
          'Erro ao conceder permissões automáticas ao admin:',
          error
        );
        // Não falha a criação do usuário se houver erro nas permissões
      }
    }

    // Criar view padrão "Dashboard" para todos os usuários
    try {
      await this.createDefaultDashboardView(
        createdUser.id,
        createdUser.tenantId
      );
    } catch (error) {
      console.error('Erro ao criar view padrão Dashboard:', error);
      // Não falha a criação do usuário se houver erro na view
    }

    return createdUser;
  }

  async createTenantAdmin(data: {
    name: string;
    email: string;
    password: string;
    tenantId: string;
  }): Promise<User> {
    return this.createUser({
      ...data,
      userType: UserType.ADMIN,
      firstLogin: true,
      isActive: true,
    });
  }

  async getUserById(id: string, includeDeleted = false): Promise<User | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    return await this.userRepository.findById(id, includeDeleted);
  }

  async getUserWithTenantById(
    id: string,
    includeDeleted = false
  ): Promise<{
    user: User;
    tenant: any;
  } | null> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id, includeDeleted);
    if (!user) {
      return null;
    }

    // Buscar dados do tenant usando Prisma diretamente
    const tenantData = await this.prisma.tenant.findUnique({
      where: { tenant_id: user.tenantId },
      select: {
        tenant_id: true,
        name: true,
        cnpj: true,
        address: true,
        is_active: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!tenantData) {
      throw new Error('Tenant not found');
    }

    return {
      user,
      tenant: {
        id: tenantData.tenant_id,
        name: tenantData.name,
        cnpj: tenantData.cnpj,
        address: tenantData.address,
        isActive: tenantData.is_active,
        createdAt: tenantData.created_at,
        updatedAt: tenantData.updated_at,
      },
    };
  }

  async getUserByEmail(
    email: string,
    includeDeleted = false
  ): Promise<User | null> {
    if (!email) {
      throw new Error('Email is required');
    }

    return await this.userRepository.findByEmail(email, includeDeleted);
  }

  async getUsersByTenant(
    tenantId: string,
    filters?: UserFilters
  ): Promise<User[]> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return await this.userRepository.findByTenant(tenantId, filters);
  }

  async getAllUsers(filters?: UserFilters): Promise<User[]> {
    return await this.userRepository.findAll(filters);
  }

  async getUsers(
    filters?: UserFilters & { page?: number; limit?: number }
  ): Promise<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const { page = 1, limit = 10, ...userFilters } = filters || {};
    const offset = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userRepository.findAll({ ...userFilters, offset, limit }),
      this.userRepository.count(userFilters),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
    };
  }

  async getUserStats(tenantId?: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    firstLogin: number;
    byTenant: Array<{ tenantId: string; count: number }>;
  }> {
    if (tenantId) {
      const tenantStats = await this.getTenantUserStats(tenantId);
      return {
        ...tenantStats,
        byTenant: [{ tenantId, count: tenantStats.total }],
      };
    }

    const [total, active, inactive, admins, firstLogin] = await Promise.all([
      this.userRepository.count({ includeDeleted: false }),
      this.userRepository.count({ isActive: true, includeDeleted: false }),
      this.userRepository.count({ isActive: false, includeDeleted: false }),
      this.userRepository.count({
        userType: UserType.ADMIN,
        includeDeleted: false,
      }),
      this.userRepository.count({ firstLogin: true, includeDeleted: false }),
    ]);

    // Para estatísticas globais, agrupar por tenant
    const allUsers = await this.userRepository.findAll({
      includeDeleted: false,
    });
    const byTenant = allUsers.reduce(
      (acc, user) => {
        const existing = acc.find(item => item.tenantId === user.tenantId);
        if (existing) {
          existing.count++;
        } else {
          acc.push({ tenantId: user.tenantId, count: 1 });
        }
        return acc;
      },
      [] as Array<{ tenantId: string; count: number }>
    );

    return {
      total,
      active,
      inactive,
      admins,
      firstLogin,
      byTenant,
    };
  }

  async updateUser(
    id: string,
    data: UpdateUserData,
    tenantId?: string
  ): Promise<User> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.isDeleted) {
      throw new Error('Cannot update deleted user');
    }

    // Verificar se o usuário pertence ao tenant (se especificado)
    if (tenantId && existingUser.tenantId !== tenantId) {
      throw new Error('User not found in this tenant');
    }

    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.userRepository.existsByEmail(
        data.email,
        id
      );
      if (emailExists) {
        throw new Error('Email already registered by another user');
      }
    }

    const updatedUser = await this.userRepository.update(id, data);
    if (!updatedUser) {
      throw new Error('Failed to update user');
    }

    return updatedUser;
  }

  async activateUser(id: string, tenantId?: string): Promise<User> {
    return await this.updateUser(id, { isActive: true }, tenantId);
  }

  async deactivateUser(id: string, tenantId?: string): Promise<User> {
    return await this.updateUser(id, { isActive: false }, tenantId);
  }

  async deleteUser(
    id: string,
    tenantId?: string,
    permanent = false
  ): Promise<boolean> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se o usuário pertence ao tenant (se especificado)
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('User not found in this tenant');
    }

    if (permanent) {
      return await this.userRepository.delete(id);
    } else {
      return await this.userRepository.softDelete(id);
    }
  }

  async restoreUser(id: string, tenantId?: string): Promise<boolean> {
    if (!id) {
      throw new Error('User ID is required');
    }

    const user = await this.userRepository.findById(id, true);
    if (!user) {
      throw new Error('User not found');
    }

    if (!user.isDeleted) {
      throw new Error('User is not deleted');
    }

    // Verificar se o usuário pertence ao tenant (se especificado)
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('User not found in this tenant');
    }

    return await this.userRepository.restore(id);
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<User | null> {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error('User account is deactivated');
    }

    if (user.isDeleted) {
      throw new Error('User account not found');
    }

    if (!user.verifyPassword(password)) {
      return null;
    }

    return user;
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
    tenantId?: string
  ): Promise<User> {
    if (!id || !currentPassword || !newPassword) {
      throw new Error(
        'User ID, current password, and new password are required'
      );
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se o usuário pertence ao tenant (se especificado)
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('User not found in this tenant');
    }

    if (!user.verifyPassword(currentPassword)) {
      throw new Error('Current password is incorrect');
    }

    // Fazer hash da nova senha antes de salvar
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    return await this.updateUser(id, { password: hashedPassword }, tenantId);
  }

  async setPassword(
    id: string,
    newPassword: string,
    tenantId?: string
  ): Promise<User> {
    if (!id || !newPassword) {
      throw new Error('User ID and new password are required');
    }

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se o usuário pertence ao tenant (se especificado)
    if (tenantId && user.tenantId !== tenantId) {
      throw new Error('User not found in this tenant');
    }

    // Fazer hash da nova senha antes de salvar
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    const updatedUser = await this.updateUser(
      id,
      {
        password: hashedPassword,
        firstLogin: false,
      },
      tenantId
    );

    return updatedUser;
  }

  async userExists(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }

    return await this.userRepository.exists(id);
  }

  async getUserCount(filters?: UserFilters): Promise<number> {
    return await this.userRepository.count(filters);
  }

  async getTenantUserCount(
    tenantId: string,
    filters?: UserFilters
  ): Promise<number> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return await this.userRepository.countByTenant(tenantId, filters);
  }

  async getTenantAdmins(tenantId: string): Promise<User[]> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return await this.userRepository.findTenantAdmins(tenantId);
  }

  async getFirstTenantAdmin(tenantId: string): Promise<User | null> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    return await this.userRepository.findFirstTenantAdmin(tenantId);
  }

  async getTenantUserStats(tenantId: string): Promise<{
    total: number;
    active: number;
    inactive: number;
    admins: number;
    firstLogin: number;
  }> {
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }

    const [total, active, inactive, admins, firstLogin] = await Promise.all([
      this.userRepository.countByTenant(tenantId, { includeDeleted: false }),
      this.userRepository.countByTenant(tenantId, {
        isActive: true,
        includeDeleted: false,
      }),
      this.userRepository.countByTenant(tenantId, {
        isActive: false,
        includeDeleted: false,
      }),
      this.userRepository.countByTenant(tenantId, {
        userType: UserType.ADMIN,
        includeDeleted: false,
      }),
      this.userRepository.countByTenant(tenantId, {
        firstLogin: true,
        includeDeleted: false,
      }),
    ]);

    return {
      total,
      active,
      inactive,
      admins,
      firstLogin,
    };
  }

  async searchUsers(searchParams: {
    searchTerm: string;
    page?: number;
    limit?: number;
    userType?: UserType;
    isActive?: boolean;
    tenantId?: string;
  }): Promise<User[]> {
    const { searchTerm, page = 1, limit = 10, ...filters } = searchParams;

    if (!searchTerm || searchTerm.trim().length === 0) {
      return await this.getAllUsers(filters);
    }

    const searchFilters: UserFilters = {
      ...filters,
      name: searchTerm.trim(),
    };

    const usersByName = await this.userRepository.findAll(searchFilters);

    const emailFilters: UserFilters = {
      ...filters,
      email: searchTerm.trim(),
    };

    const usersByEmail = await this.userRepository.findAll(emailFilters);

    const combinedUsers = [...usersByName, ...usersByEmail];
    const uniqueUsers = combinedUsers.filter(
      (user, index, self) => index === self.findIndex(u => u.id === user.id)
    );

    // Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return uniqueUsers.slice(startIndex, endIndex);
  }

  async getUsersByRole(_roleId: string, _tenantId?: string): Promise<User[]> {
    // Este método precisaria ser implementado no repositório
    // Por enquanto, retornamos um array vazio
    // TODO: Implementar busca por role
    return [];
  }

  /**
   * Cria uma view padrão "Dashboard" para o usuário
   */
  private async createDefaultDashboardView(
    userId: string,
    tenantId: string
  ): Promise<void> {
    try {
      // Verificar se já existe uma view "Dashboard" para este usuário
      const existingView = await this.prisma.view.findFirst({
        where: {
          user_id: userId,
          name: 'Dashboard',
        },
      });

      if (existingView) {
        return; // Já existe, não criar novamente
      }

      // Criar view padrão "Dashboard"
      await this.prisma.view.create({
        data: {
          name: 'Dashboard',
          user_id: userId,
          tenant_id: tenantId,
          is_default: true,
          is_public: false,
          created_by: userId,
          updated_by: userId,
        },
      });

      console.log(`✅ View padrão "Dashboard" criada para usuário ${userId}`);
    } catch (error: any) {
      console.error('Erro ao criar view padrão Dashboard:', error);
      throw error;
    }
  }
}
