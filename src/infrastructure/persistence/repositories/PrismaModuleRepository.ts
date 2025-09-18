import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateModuleData,
  IModuleRepository,
  ModuleFilters,
  UpdateModuleData,
} from '../../../application/interfaces/IModuleRepository';
import { Module } from '../../../domain/entities/Module';

export class PrismaModuleRepository implements IModuleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateModuleData): Promise<Module> {
    const moduleData = await this.prisma.module.create({
      data: {
        module_id: uuidv4(),
        customer: data.customer,
        country: data.country,
        city: data.city,
        blueprint: data.blueprint,
        sector: data.sector,
        machine_name: data.machineName,
        tenant_id: data.tenantId,
        machine_id: data.machineId || null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return Module.fromPersistence({
      id: moduleData.module_id,
      customer: moduleData.customer,
      country: moduleData.country,
      city: moduleData.city,
      blueprint: moduleData.blueprint,
      sector: moduleData.sector,
      machineName: moduleData.machine_name,
      tenantId: moduleData.tenant_id,
      machineId: moduleData.machine_id || undefined,
      createdAt: moduleData.created_at,
      updatedAt: moduleData.updated_at || moduleData.created_at,
      ...(moduleData.deleted_at && { deletedAt: moduleData.deleted_at }),
    });
  }

  async findById(id: string, tenantId: string): Promise<Module | null> {
    const moduleData = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!moduleData) {
      return null;
    }

    return Module.fromPersistence({
      id: moduleData.module_id,
      customer: moduleData.customer,
      country: moduleData.country,
      city: moduleData.city,
      blueprint: moduleData.blueprint,
      sector: moduleData.sector,
      machineName: moduleData.machine_name,
      tenantId: moduleData.tenant_id,
      machineId: moduleData.machine_id || undefined,
      createdAt: moduleData.created_at,
      updatedAt: moduleData.updated_at || moduleData.created_at,
      ...(moduleData.deleted_at && { deletedAt: moduleData.deleted_at }),
    });
  }

  async findByMachineId(
    machineId: string,
    tenantId: string
  ): Promise<Module[]> {
    const modulesData = await this.prisma.module.findMany({
      where: {
        machine_id: machineId,
        tenant_id: tenantId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return modulesData.map(moduleData =>
      Module.fromPersistence({
        id: moduleData.module_id,
        customer: moduleData.customer,
        country: moduleData.country,
        city: moduleData.city,
        blueprint: moduleData.blueprint,
        sector: moduleData.sector,
        machineName: moduleData.machine_name,
        tenantId: moduleData.tenant_id,
        machineId: moduleData.machine_id || undefined,
        createdAt: moduleData.created_at,
        updatedAt: moduleData.updated_at || moduleData.created_at,
        ...(moduleData.deleted_at && { deletedAt: moduleData.deleted_at }),
      })
    );
  }

  async findAllModules(): Promise<Module[]> {
    const moduleData = await this.prisma.module.findMany({
      where: {
        deleted_at: null, // Apenas módulos não deletados
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    return moduleData.map(data =>
      Module.fromPersistence({
        id: data.module_id,
        customer: data.customer,
        country: data.country,
        city: data.city,
        blueprint: data.blueprint,
        sector: data.sector,
        machineName: data.machine_name,
        tenantId: data.tenant_id,
        machineId: data.machine_id || undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at || data.created_at,
        ...(data.deleted_at && { deletedAt: data.deleted_at }),
      })
    );
  }

  async findAll(filters: ModuleFilters): Promise<Module[]> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.customer) {
      where.customer = {
        contains: filters.customer,
        mode: 'insensitive',
      };
    }

    if (filters.country) {
      where.country = {
        contains: filters.country,
        mode: 'insensitive',
      };
    }

    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.sector) {
      where.sector = {
        contains: filters.sector,
        mode: 'insensitive',
      };
    }

    if (filters.machineName) {
      where.machine_name = {
        contains: filters.machineName,
        mode: 'insensitive',
      };
    }

    if (filters.machineId) {
      where.machine_id = filters.machineId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    const modulesData = await this.prisma.module.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return modulesData.map(moduleData =>
      Module.fromPersistence({
        id: moduleData.module_id,
        customer: moduleData.customer,
        country: moduleData.country,
        city: moduleData.city,
        blueprint: moduleData.blueprint,
        sector: moduleData.sector,
        machineName: moduleData.machine_name,
        tenantId: moduleData.tenant_id,
        machineId: moduleData.machine_id || undefined,
        createdAt: moduleData.created_at,
        updatedAt: moduleData.updated_at || moduleData.created_at,
        ...(moduleData.deleted_at && { deletedAt: moduleData.deleted_at }),
      })
    );
  }

  async update(
    id: string,
    data: UpdateModuleData,
    tenantId: string
  ): Promise<Module> {
    const existingModule = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    if (existingModule.deleted_at) {
      throw new Error('Cannot update deleted module');
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.customer !== undefined) {
      updateData.customer = data.customer;
    }
    if (data.country !== undefined) {
      updateData.country = data.country;
    }
    if (data.city !== undefined) {
      updateData.city = data.city;
    }
    if (data.blueprint !== undefined) {
      updateData.blueprint = data.blueprint;
    }
    if (data.sector !== undefined) {
      updateData.sector = data.sector;
    }
    if (data.machineName !== undefined) {
      updateData.machine_name = data.machineName;
    }
    if (data.machineId !== undefined) {
      updateData.machine_id = data.machineId;
    }

    const updatedModule = await this.prisma.module.update({
      where: {
        module_id: id,
      },
      data: updateData,
    });

    return Module.fromPersistence({
      id: updatedModule.module_id,
      customer: updatedModule.customer,
      country: updatedModule.country,
      city: updatedModule.city,
      blueprint: updatedModule.blueprint,
      sector: updatedModule.sector,
      machineName: updatedModule.machine_name,
      tenantId: updatedModule.tenant_id,
      machineId: updatedModule.machine_id || undefined,
      createdAt: updatedModule.created_at,
      updatedAt: updatedModule.updated_at || updatedModule.created_at,
      ...(updatedModule.deleted_at && { deletedAt: updatedModule.deleted_at }),
    });
  }

  async delete(id: string, tenantId: string): Promise<boolean> {
    const existingModule = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    await this.prisma.module.update({
      where: {
        module_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return true;
  }

  async restore(id: string, tenantId: string): Promise<boolean> {
    const existingModule = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    if (!existingModule.deleted_at) {
      throw new Error('Module is not deleted');
    }

    await this.prisma.module.update({
      where: {
        module_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return true;
  }

  async count(filters: ModuleFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.customer) {
      where.customer = {
        contains: filters.customer,
        mode: 'insensitive',
      };
    }

    if (filters.country) {
      where.country = {
        contains: filters.country,
        mode: 'insensitive',
      };
    }

    if (filters.city) {
      where.city = {
        contains: filters.city,
        mode: 'insensitive',
      };
    }

    if (filters.sector) {
      where.sector = {
        contains: filters.sector,
        mode: 'insensitive',
      };
    }

    if (filters.machineName) {
      where.machine_name = {
        contains: filters.machineName,
        mode: 'insensitive',
      };
    }

    if (filters.machineId) {
      where.machine_id = filters.machineId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    return this.prisma.module.count({ where });
  }

  async assignToMachine(
    id: string,
    machineId: string,
    tenantId: string
  ): Promise<Module> {
    const existingModule = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    if (existingModule.deleted_at) {
      throw new Error('Cannot assign deleted module to machine');
    }

    // Verify machine exists and belongs to the same tenant
    const machine = await this.prisma.machine.findFirst({
      where: {
        machine_id: machineId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!machine) {
      throw new Error('Machine not found or is deleted');
    }

    const updatedModule = await this.prisma.module.update({
      where: {
        module_id: id,
      },
      data: {
        machine_id: machineId,
        updated_at: new Date(),
      },
    });

    return Module.fromPersistence({
      id: updatedModule.module_id,
      customer: updatedModule.customer,
      country: updatedModule.country,
      city: updatedModule.city,
      blueprint: updatedModule.blueprint,
      sector: updatedModule.sector,
      machineName: updatedModule.machine_name,
      tenantId: updatedModule.tenant_id,
      machineId: updatedModule.machine_id || undefined,
      createdAt: updatedModule.created_at,
      updatedAt: updatedModule.updated_at || updatedModule.created_at,
      ...(updatedModule.deleted_at && { deletedAt: updatedModule.deleted_at }),
    });
  }

  async unassignFromMachine(id: string, tenantId: string): Promise<Module> {
    const existingModule = await this.prisma.module.findFirst({
      where: {
        module_id: id,
        tenant_id: tenantId,
      },
    });

    if (!existingModule) {
      throw new Error('Module not found');
    }

    if (existingModule.deleted_at) {
      throw new Error('Cannot unassign deleted module from machine');
    }

    const updatedModule = await this.prisma.module.update({
      where: {
        module_id: id,
      },
      data: {
        machine_id: null,
        updated_at: new Date(),
      },
    });

    return Module.fromPersistence({
      id: updatedModule.module_id,
      customer: updatedModule.customer,
      country: updatedModule.country,
      city: updatedModule.city,
      blueprint: updatedModule.blueprint,
      sector: updatedModule.sector,
      machineName: updatedModule.machine_name,
      tenantId: updatedModule.tenant_id,
      machineId: updatedModule.machine_id || undefined,
      createdAt: updatedModule.created_at,
      updatedAt: updatedModule.updated_at || updatedModule.created_at,
      ...(updatedModule.deleted_at && { deletedAt: updatedModule.deleted_at }),
    });
  }
}
