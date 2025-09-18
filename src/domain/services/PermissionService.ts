import { PermissionLevel, User, UserType } from '../entities/User';
// import { Permission } from '../entities/Permission';
import { UserPermission } from '../entities/UserPermission';

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

export class PermissionService {
  /**
   * Verifica se um usuário pode executar uma ação específica
   */
  static canUserExecute(
    user: User,
    functionName: string,
    permissionLevel: PermissionLevel,
    userPermissions?: UserPermission[]
  ): PermissionCheckResult {
    // ROOT pode tudo
    if (user.isRoot) {
      return { hasPermission: true, reason: 'Root user has all permissions' };
    }

    // ADMIN pode tudo no seu tenant
    if (user.isAdmin) {
      return {
        hasPermission: true,
        reason: 'Admin user has all permissions in their tenant',
      };
    }

    // USER precisa ter a permissão específica
    if (user.isUser) {
      if (!userPermissions || userPermissions.length === 0) {
        return {
          hasPermission: false,
          reason: 'No permissions assigned to user',
        };
      }

      const hasPermission = userPermissions.some(
        userPerm =>
          userPerm.granted &&
          this.matchesPermission(userPerm, functionName, permissionLevel)
      );

      if (!hasPermission) {
        return {
          hasPermission: false,
          reason: `User does not have ${permissionLevel} permission for ${functionName}`,
        };
      }

      return { hasPermission: true, reason: 'User has specific permission' };
    }

    return { hasPermission: false, reason: 'Invalid user type' };
  }

  /**
   * Verifica se um usuário pode criar outro usuário do tipo especificado
   */
  static canCreateUserType(
    creator: User,
    targetUserType: UserType,
    targetTenantId?: string
  ): PermissionCheckResult {
    // ROOT pode criar qualquer tipo de usuário
    if (creator.isRoot) {
      return { hasPermission: true, reason: 'Root can create any user type' };
    }

    // ADMIN pode criar apenas USER no seu tenant
    if (creator.isAdmin) {
      if (targetUserType === UserType.ROOT) {
        return {
          hasPermission: false,
          reason: 'Admin cannot create root users',
        };
      }

      if (targetUserType === UserType.ADMIN) {
        return {
          hasPermission: false,
          reason: 'Admin cannot create other admin users',
        };
      }

      if (targetUserType === UserType.USER) {
        if (!targetTenantId || targetTenantId !== creator.tenantId) {
          return {
            hasPermission: false,
            reason: 'Admin can only create users in their own tenant',
          };
        }
        return {
          hasPermission: true,
          reason: 'Admin can create users in their tenant',
        };
      }
    }

    // USER não pode criar outros usuários
    if (creator.isUser) {
      return {
        hasPermission: false,
        reason: 'Regular users cannot create other users',
      };
    }

    return { hasPermission: false, reason: 'Invalid creator user type' };
  }

  /**
   * Verifica se um usuário pode gerenciar outro usuário
   */
  static canManageUser(manager: User, targetUser: User): PermissionCheckResult {
    // ROOT pode gerenciar qualquer usuário
    if (manager.isRoot) {
      return { hasPermission: true, reason: 'Root can manage any user' };
    }

    // ADMIN pode gerenciar apenas usuários do seu tenant
    if (manager.isAdmin) {
      if (targetUser.isRoot) {
        return {
          hasPermission: false,
          reason: 'Admin cannot manage root users',
        };
      }

      if (targetUser.tenantId !== manager.tenantId) {
        return {
          hasPermission: false,
          reason: 'Admin can only manage users in their own tenant',
        };
      }

      return {
        hasPermission: true,
        reason: 'Admin can manage users in their tenant',
      };
    }

    // USER não pode gerenciar outros usuários
    if (manager.isUser) {
      return {
        hasPermission: false,
        reason: 'Regular users cannot manage other users',
      };
    }

    return { hasPermission: false, reason: 'Invalid manager user type' };
  }

  /**
   * Verifica se um usuário pode acessar dados de um tenant específico
   */
  static canAccessTenant(user: User, tenantId: string): PermissionCheckResult {
    // ROOT pode acessar qualquer tenant
    if (user.isRoot) {
      return { hasPermission: true, reason: 'Root can access any tenant' };
    }

    // ADMIN e USER só podem acessar seu próprio tenant
    if (user.tenantId === tenantId) {
      return {
        hasPermission: true,
        reason: 'User can access their own tenant',
      };
    }

    return { hasPermission: false, reason: 'User cannot access other tenants' };
  }

  /**
   * Gera permissões padrão para um usuário USER
   */
  static getDefaultUserPermissions(): Array<{
    functionName: string;
    permissionLevel: PermissionLevel;
  }> {
    return [
      { functionName: 'dashboard', permissionLevel: PermissionLevel.READ },
      { functionName: 'sensors', permissionLevel: PermissionLevel.READ },
      { functionName: 'modules', permissionLevel: PermissionLevel.READ },
      { functionName: 'reports', permissionLevel: PermissionLevel.READ },
    ];
  }

  /**
   * Verifica se uma permissão de usuário corresponde à função e nível solicitados
   */
  private static matchesPermission(
    userPermission: UserPermission,
    _functionName: string,
    _permissionLevel: PermissionLevel
  ): boolean {
    // Esta função seria implementada com base na estrutura real das permissões
    // Por enquanto, assumimos que userPermission tem as propriedades necessárias
    return userPermission.granted;
  }

  /**
   * Valida se um conjunto de permissões é válido
   */
  static validatePermissions(
    permissions: Array<{
      functionName: string;
      permissionLevel: PermissionLevel;
    }>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validFunctions = [
      'users',
      'modules',
      'sensors',
      'machines',
      'reports',
      'settings',
      'dashboard',
      'alerts',
      'exports',
      'audit',
    ];
    const validLevels = Object.values(PermissionLevel);

    for (const permission of permissions) {
      if (!validFunctions.includes(permission.functionName)) {
        errors.push(`Invalid function name: ${permission.functionName}`);
      }

      if (!validLevels.includes(permission.permissionLevel)) {
        errors.push(`Invalid permission level: ${permission.permissionLevel}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
