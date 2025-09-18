import { Role } from '../../domain/entities/Role';
import {
  IRoleRepository,
  RoleFilters,
  UpdateRoleData,
} from '../interfaces/IRoleRepository';

export class RoleApplicationService {
  constructor(private roleRepository: IRoleRepository) {}

  async createRole(data: {
    name: string;
    description: string;
    tenantId: string;
    isActive?: boolean;
  }): Promise<Role> {
    try {
      const roleData = {
        name: data.name.trim(),
        description: data.description.trim(),
        tenantId: data.tenantId,
        isActive: data.isActive ?? true,
      };

      return await this.roleRepository.create(roleData);
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleById(id: string, tenantId?: string): Promise<Role> {
    try {
      const role = await this.roleRepository.findById(id, tenantId);

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleByIdWithRelations(id: string): Promise<any> {
    try {
      // Buscar role específica com relações diretamente
      const role = await this.roleRepository.findByIdWithRelations(id);

      if (!role) {
        throw new Error('Role not found');
      }

      return role;
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleByName(name: string, tenantId?: string): Promise<Role | null> {
    try {
      return await this.roleRepository.findByName(name, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllRoles(filters: RoleFilters): Promise<Role[]> {
    try {
      return await this.roleRepository.findAll(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getAllRolesWithRelations(filters: RoleFilters): Promise<any[]> {
    try {
      return await this.roleRepository.findAllWithRelations(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getRolesByTenant(tenantId: string): Promise<Role[]> {
    try {
      return await this.roleRepository.findByTenantId(tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async updateRole(
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
      isActive?: boolean | undefined;
    }
  ): Promise<Role> {
    try {
      const updateData: UpdateRoleData = {};

      if (data.name !== undefined) {
        updateData.name = data.name.trim();
      }

      if (data.description !== undefined) {
        updateData.description = data.description.trim();
      }

      if (data.isActive !== undefined) {
        updateData.isActive = data.isActive;
      }

      return await this.roleRepository.update(id, updateData);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteRole(id: string): Promise<boolean> {
    try {
      return await this.roleRepository.delete(id);
    } catch (error: any) {
      throw error;
    }
  }

  async restoreRole(id: string): Promise<boolean> {
    try {
      return await this.roleRepository.restore(id);
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleCount(filters: RoleFilters): Promise<number> {
    try {
      return await this.roleRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getRoleStats(_filters: Record<string, unknown> = {}): Promise<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  }> {
    try {
      const [total, active, inactive, deleted] = await Promise.all([
        this.roleRepository.count({ isDeleted: false }),
        this.roleRepository.count({ isDeleted: false, isActive: true }),
        this.roleRepository.count({ isDeleted: false, isActive: false }),
        this.roleRepository.count({ isDeleted: true }),
      ]);

      return {
        total,
        active,
        inactive,
        deleted,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
