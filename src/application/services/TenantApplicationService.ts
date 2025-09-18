import { randomUUID } from 'crypto';

import { Tenant } from '../../domain/entities/Tenant';
import { UserType } from '../../domain/entities/User';
import {
  CreateTenantData,
  ITenantRepository,
  TenantFilters,
  UpdateTenantData,
} from '../interfaces/ITenantRepository';
import { UserApplicationService } from './UserApplicationService';

export interface CreateTenantWithAdminData extends CreateTenantData {
  adminUser: {
    name: string;
    email: string;
    password: string;
    accessType?: string;
  };
}

export class TenantApplicationService {
  constructor(
    private tenantRepository: ITenantRepository,
    private userService?: UserApplicationService
  ) {}

  async createTenant(data: CreateTenantData): Promise<Tenant> {
    if (data.cnpj) {
      const existingTenant = await this.tenantRepository.existsByCNPJ(
        data.cnpj
      );
      if (existingTenant) {
        throw new Error('CNPJ already registered');
      }
    }

    const tenant = Tenant.create({
      id: randomUUID(),
      ...data,
    });

    return await this.tenantRepository.create({
      name: tenant.name,
      cnpj: tenant.cnpj,
      address: tenant.address,
      isActive: tenant.isActive,
    });
  }

  async createTenantWithAdmin(data: CreateTenantWithAdminData): Promise<{
    tenant: Tenant;
    adminUser: any;
  }> {
    if (!this.userService) {
      throw new Error(
        'UserApplicationService is required for creating tenant with admin'
      );
    }

    // Verify admin email is not already in use
    const existingUser = await this.userService.getUserByEmail(
      data.adminUser.email
    );
    if (existingUser) {
      throw new Error('Admin email already registered');
    }

    // Verify tenant CNPJ is not already in use
    if (data.cnpj) {
      const existingTenant = await this.tenantRepository.existsByCNPJ(
        data.cnpj
      );
      if (existingTenant) {
        throw new Error('CNPJ already registered');
      }
    }

    let createdTenant: Tenant | null = null;
    let createdAdmin: any = null;

    try {
      // Create tenant first
      const tenant = Tenant.create({
        id: randomUUID(),
        name: data.name,
        cnpj: data.cnpj,
        address: data.address,
        isActive: data.isActive,
      });

      createdTenant = await this.tenantRepository.create({
        name: tenant.name,
        cnpj: tenant.cnpj,
        address: tenant.address,
        isActive: tenant.isActive,
      });

      // Map accessType to UserType
      const userType =
        data.adminUser.accessType === 'root'
          ? UserType.ROOT
          : data.adminUser.accessType === 'user'
            ? UserType.USER
            : UserType.ADMIN; // default to admin

      // Create admin user for the tenant
      createdAdmin = await this.userService.createUser({
        name: data.adminUser.name,
        email: data.adminUser.email,
        password: data.adminUser.password,
        userType: userType,
        tenantId: createdTenant.id,
        firstLogin: true,
        isActive: true,
      });

      return {
        tenant: createdTenant,
        adminUser: createdAdmin,
      };
    } catch (error) {
      // Rollback: delete tenant if admin creation failed
      if (createdTenant && !createdAdmin) {
        try {
          await this.tenantRepository.delete(createdTenant.id);
        } catch (rollbackError) {
          console.error('Failed to rollback tenant creation:', rollbackError);
        }
      }

      throw error;
    }
  }

  async getTenantById(
    id: string,
    includeDeleted = false
  ): Promise<Tenant | null> {
    if (!id) {
      throw new Error('Tenant ID is required');
    }

    return await this.tenantRepository.findById(id, includeDeleted);
  }

  async getTenantByCNPJ(
    cnpj: string,
    includeDeleted = false
  ): Promise<Tenant | null> {
    if (!cnpj) {
      throw new Error('CNPJ is required');
    }

    return await this.tenantRepository.findByCNPJ(cnpj, includeDeleted);
  }

  async getAllTenants(filters?: TenantFilters): Promise<Tenant[]> {
    return await this.tenantRepository.findAll(filters);
  }

  async updateTenant(id: string, data: UpdateTenantData): Promise<Tenant> {
    if (!id) {
      throw new Error('Tenant ID is required');
    }

    const existingTenant = await this.tenantRepository.findById(id);
    if (!existingTenant) {
      throw new Error('Tenant not found');
    }

    if (existingTenant.isDeleted) {
      throw new Error('Cannot update deleted tenant');
    }

    if (data.cnpj && data.cnpj !== existingTenant.cnpj) {
      const cnpjExists = await this.tenantRepository.existsByCNPJ(
        data.cnpj,
        id
      );
      if (cnpjExists) {
        throw new Error('CNPJ already registered by another tenant');
      }
    }

    const updatedTenant = await this.tenantRepository.update(id, data);
    if (!updatedTenant) {
      throw new Error('Failed to update tenant');
    }

    return updatedTenant;
  }

  async activateTenant(id: string): Promise<Tenant> {
    return await this.updateTenant(id, { isActive: true });
  }

  async deactivateTenant(id: string): Promise<Tenant> {
    return await this.updateTenant(id, { isActive: false });
  }

  async deleteTenant(id: string, permanent = false): Promise<boolean> {
    if (!id) {
      throw new Error('Tenant ID is required');
    }

    const tenant = await this.tenantRepository.findById(id);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (permanent) {
      return await this.tenantRepository.delete(id);
    } else {
      return await this.tenantRepository.softDelete(id);
    }
  }

  async restoreTenant(id: string): Promise<boolean> {
    if (!id) {
      throw new Error('Tenant ID is required');
    }

    const tenant = await this.tenantRepository.findById(id, true);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (!tenant.isDeleted) {
      throw new Error('Tenant is not deleted');
    }

    return await this.tenantRepository.restore(id);
  }

  async tenantExists(id: string): Promise<boolean> {
    if (!id) {
      return false;
    }

    return await this.tenantRepository.exists(id);
  }

  async getTenantCount(filters?: TenantFilters): Promise<number> {
    return await this.tenantRepository.count(filters);
  }

  async getTenantStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    deleted: number;
  }> {
    const [total, active, inactive, totalWithDeleted, totalWithoutDeleted] =
      await Promise.all([
        this.tenantRepository.count({ includeDeleted: false }),
        this.tenantRepository.count({ isActive: true, includeDeleted: false }),
        this.tenantRepository.count({ isActive: false, includeDeleted: false }),
        this.tenantRepository.count({ includeDeleted: true }),
        this.tenantRepository.count({ includeDeleted: false }),
      ]);

    const deleted = totalWithDeleted - totalWithoutDeleted;

    return {
      total,
      active,
      inactive,
      deleted,
    };
  }

  async searchTenants(
    searchTerm: string,
    filters?: TenantFilters
  ): Promise<Tenant[]> {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return await this.getAllTenants(filters);
    }

    const searchFilters: TenantFilters = {
      ...filters,
      name: searchTerm.trim(),
    };

    return await this.tenantRepository.findAll(searchFilters);
  }
}
