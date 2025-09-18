import { IPermissionRepository } from '../interfaces/IPermissionRepository';
import { IRolePermissionRepository } from '../interfaces/IRolePermissionRepository';
import { IRoleRepository } from '../interfaces/IRoleRepository';

export interface AddPermissionToRoleData {
  roleId: string;
  permissionId: string;
  tenantId: string;
}

export interface RemovePermissionFromRoleData {
  roleId: string;
  permissionId: string;
  tenantId: string;
}

export interface GetRolePermissionsData {
  roleId: string;
  tenantId: string;
}

export class RolePermissionApplicationService {
  constructor(
    private rolePermissionRepository: IRolePermissionRepository,
    private permissionRepository: IPermissionRepository,
    private roleRepository: IRoleRepository
  ) {}

  async addPermissionToRole(data: AddPermissionToRoleData): Promise<any> {
    try {
      // Verificar se a role existe (sem filtro de tenant para administradores)
      const role = await this.roleRepository.findById(data.roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Verificar se a permissão existe
      const permission = await this.permissionRepository.findById(
        data.permissionId
      );
      if (!permission) {
        throw new Error('Permission not found');
      }

      // Verificar se a permissão já existe na role
      const exists = await this.rolePermissionRepository.exists(
        data.roleId,
        data.permissionId
      );
      if (exists) {
        throw new Error('Permission already exists for this role');
      }

      // Adicionar permissão à role
      const rolePermission = await this.rolePermissionRepository.create({
        roleId: data.roleId,
        permissionId: data.permissionId,
      });

      return rolePermission;
    } catch (error: any) {
      throw error;
    }
  }

  async removePermissionFromRole(
    data: RemovePermissionFromRoleData
  ): Promise<boolean> {
    try {
      // Verificar se a role existe (sem filtro de tenant para administradores)
      const role = await this.roleRepository.findById(data.roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Remover permissão da role
      const result = await this.rolePermissionRepository.delete(
        data.roleId,
        data.permissionId
      );

      if (!result) {
        throw new Error('Permission not found in this role');
      }

      return result;
    } catch (error: any) {
      throw error;
    }
  }

  async getRolePermissions(data: GetRolePermissionsData): Promise<any[]> {
    try {
      // Verificar se a role existe (sem filtro de tenant para administradores)
      const role = await this.roleRepository.findById(data.roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Buscar permissões da role
      const rolePermissions = await this.rolePermissionRepository.findByRoleId(
        data.roleId
      );

      return rolePermissions.map(rp => ({
        id: rp.permission.permission_id,
        name: rp.permission.name,
        displayName: rp.permission.displayName,
        module: rp.permission.module,
        description: rp.permission.description,
        addedAt: rp.created_at,
      }));
    } catch (error: any) {
      throw error;
    }
  }

  async updateRolePermissions(
    roleId: string,
    permissionIds: string[],
    _tenantId: string
  ): Promise<any[]> {
    try {
      // Verificar se a role existe (sem filtro de tenant para administradores)
      const role = await this.roleRepository.findById(roleId);
      if (!role) {
        throw new Error('Role not found');
      }

      // Remover todas as permissões existentes
      await this.rolePermissionRepository.deleteByRoleId(roleId);

      // Adicionar novas permissões
      const newPermissions = [];
      for (const permissionId of permissionIds) {
        // Verificar se a permissão existe
        const permission =
          await this.permissionRepository.findById(permissionId);
        if (!permission) {
          console.warn(`Permission ${permissionId} not found, skipping...`);
          continue;
        }

        try {
          const rolePermission = await this.rolePermissionRepository.create({
            roleId,
            permissionId,
          });
          newPermissions.push(rolePermission);
        } catch (error: any) {
          console.warn(
            `Failed to add permission ${permissionId}: ${error.message}`
          );
        }
      }

      return newPermissions;
    } catch (error: any) {
      throw error;
    }
  }
}
