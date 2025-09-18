import { Permission, PermissionLevel } from '../../domain/entities/Permission';
import { UserType } from '../../domain/entities/User';
import { UserPermission } from '../../domain/entities/UserPermission';
import { PermissionService } from '../../domain/services/PermissionService';
import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { IUserPermissionRepository } from '../interfaces/IUserPermissionRepository';
import { IUserRepository } from '../interfaces/IUserRepository';

export interface CreatePermissionRequest {
  functionName: string;
  permissionLevel: PermissionLevel;
  displayName: string;
  description?: string;
  applicationId: string;
}

export interface UpdatePermissionRequest {
  displayName?: string;
  description?: string;
}

export interface GrantPermissionRequest {
  userId: string;
  permissionId: string;
  grantedBy?: string;
}

export interface RevokePermissionRequest {
  userId: string;
  permissionId: string;
}

export interface SetUserPermissionsRequest {
  userId: string;
  permissionIds: string[];
  grantedBy?: string;
}

export interface CheckPermissionRequest {
  userId: string;
  functionName: string;
  permissionLevel: PermissionLevel;
}

export class PermissionApplicationService {
  constructor(
    private permissionRepository: IPermissionRepository,
    private userPermissionRepository: IUserPermissionRepository,
    private userRepository: IUserRepository
  ) {}

  async createPermission(data: CreatePermissionRequest): Promise<Permission> {
    // Verificar se a permissão já existe
    const existing = await this.permissionRepository.findByFunctionAndLevel(
      data.functionName,
      data.permissionLevel,
      data.applicationId
    );

    if (existing) {
      throw new Error(
        `Permission already exists for function ${data.functionName} with level ${data.permissionLevel}`
      );
    }

    return this.permissionRepository.create({
      functionName: data.functionName,
      permissionLevel: data.permissionLevel,
      displayName: data.displayName,
      description: data.description,
      applicationId: data.applicationId,
    });
  }

  async getPermissionById(id: string): Promise<Permission | null> {
    return this.permissionRepository.findById(id);
  }

  async getPermissionsByFunction(
    functionName: string,
    applicationId: string
  ): Promise<Permission[]> {
    return this.permissionRepository.getPermissionsByFunction(
      functionName,
      applicationId
    );
  }

  async getAllPermissions(applicationId: string): Promise<Permission[]> {
    return this.permissionRepository.findByApplication(applicationId);
  }

  async getPermissionsByTenant(tenantId: string): Promise<Permission[]> {
    return this.permissionRepository.findByTenant(tenantId);
  }

  async getTenantApplications(_tenantId: string): Promise<string[]> {
    // Este método será implementado para buscar aplicações do tenant
    // Por enquanto, vou retornar uma aplicação padrão
    return ['0f0e6d72-b140-4bf3-925e-9d51ecb468ae'];
  }

  async updatePermission(
    id: string,
    data: UpdatePermissionRequest
  ): Promise<Permission | null> {
    return this.permissionRepository.update(id, data);
  }

  async deletePermission(id: string): Promise<boolean> {
    return this.permissionRepository.softDelete(id);
  }

  async grantPermission(data: GrantPermissionRequest): Promise<UserPermission> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se a permissão existe
    const permission = await this.permissionRepository.findById(
      data.permissionId
    );
    if (!permission) {
      throw new Error('Permission not found');
    }

    return this.userPermissionRepository.grantPermission(
      data.userId,
      data.permissionId,
      data.grantedBy
    );
  }

  async revokePermission(data: RevokePermissionRequest): Promise<boolean> {
    return this.userPermissionRepository.revokePermission(
      data.userId,
      data.permissionId
    );
  }

  async getUserPermissions(userId: string): Promise<UserPermission[]> {
    return this.userPermissionRepository.getUserPermissions(userId);
  }

  async setUserPermissions(
    data: SetUserPermissionsRequest
  ): Promise<UserPermission[]> {
    // Verificar se o usuário existe
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verificar se todas as permissões existem
    for (const permissionId of data.permissionIds) {
      const permission = await this.permissionRepository.findById(permissionId);
      if (!permission) {
        throw new Error(`Permission ${permissionId} not found`);
      }
    }

    return this.userPermissionRepository.replaceUserPermissions(
      data.userId,
      data.permissionIds,
      data.grantedBy
    );
  }

  async checkPermission(data: CheckPermissionRequest): Promise<boolean> {
    const user = await this.userRepository.findById(data.userId);
    if (!user) {
      return false;
    }

    // Usar o serviço de domínio para verificar permissões
    const userPermissions =
      await this.userPermissionRepository.getUserPermissions(data.userId);

    const result = PermissionService.canUserExecute(
      user,
      data.functionName,
      data.permissionLevel,
      userPermissions
    );

    return result.hasPermission;
  }

  async canUserCreateUserType(
    creatorId: string,
    targetUserType: UserType,
    targetTenantId?: string
  ): Promise<boolean> {
    const creator = await this.userRepository.findById(creatorId);
    if (!creator) {
      return false;
    }

    const result = PermissionService.canCreateUserType(
      creator,
      targetUserType,
      targetTenantId
    );
    return result.hasPermission;
  }

  async canUserManageUser(
    managerId: string,
    targetUserId: string
  ): Promise<boolean> {
    const manager = await this.userRepository.findById(managerId);
    const targetUser = await this.userRepository.findById(targetUserId);

    if (!manager || !targetUser) {
      return false;
    }

    const result = PermissionService.canManageUser(manager, targetUser);
    return result.hasPermission;
  }

  async canUserAccessTenant(
    userId: string,
    tenantId: string
  ): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return false;
    }

    const result = PermissionService.canAccessTenant(user, tenantId);
    return result.hasPermission;
  }

  async getAvailableFunctions(applicationId: string): Promise<string[]> {
    return this.permissionRepository.getAvailableFunctions(applicationId);
  }

  async getAvailableLevels(
    functionName: string,
    applicationId: string
  ): Promise<string[]> {
    return this.permissionRepository.getAvailableLevels(
      functionName,
      applicationId
    );
  }

  async getDefaultUserPermissions(): Promise<
    Array<{ functionName: string; permissionLevel: PermissionLevel }>
  > {
    return PermissionService.getDefaultUserPermissions();
  }

  async validatePermissions(
    permissions: Array<{
      functionName: string;
      permissionLevel: PermissionLevel;
    }>
  ): Promise<{ isValid: boolean; errors: string[] }> {
    return PermissionService.validatePermissions(permissions);
  }

  // Método para obter permissões de um usuário formatadas por função
  async getUserPermissionsByFunction(
    userId: string
  ): Promise<Record<string, string[]>> {
    const userPermissions = await this.getUserPermissions(userId);
    const permissionsByFunction: Record<string, string[]> = {};

    for (const userPermission of userPermissions) {
      const permission = await this.permissionRepository.findById(
        userPermission.permissionId
      );
      if (permission) {
        if (!permissionsByFunction[permission.functionName]) {
          permissionsByFunction[permission.functionName] = [];
        }
        permissionsByFunction[permission.functionName].push(
          permission.permissionLevel
        );
      }
    }

    return permissionsByFunction;
  }

  // Método para obter todas as permissões disponíveis formatadas por função
  async getAllPermissionsByFunction(
    applicationId: string
  ): Promise<Record<string, Permission[]>> {
    const permissions = await this.getAllPermissions(applicationId);
    const permissionsByFunction: Record<string, Permission[]> = {};

    for (const permission of permissions) {
      if (!permissionsByFunction[permission.functionName]) {
        permissionsByFunction[permission.functionName] = [];
      }
      permissionsByFunction[permission.functionName].push(permission);
    }

    return permissionsByFunction;
  }
}
