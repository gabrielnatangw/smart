import { Module } from '../../domain/entities/Module';

export interface CreateModuleData {
  customer: string;
  country: string;
  city: string;
  blueprint: string;
  sector: string;
  machineName: string;
  tenantId: string;
  machineId?: string | undefined;
}

export interface UpdateModuleData {
  customer?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
  blueprint?: string | undefined;
  sector?: string | undefined;
  machineName?: string | undefined;
  machineId?: string | undefined;
}

export interface ModuleFilters {
  customer?: string | undefined;
  country?: string | undefined;
  city?: string | undefined;
  sector?: string | undefined;
  machineName?: string | undefined;
  machineId?: string | undefined;
  isDeleted?: boolean | undefined;
  tenantId: string;
}

export interface IModuleRepository {
  create(data: CreateModuleData): Promise<Module>;
  findById(id: string, tenantId: string): Promise<Module | null>;
  findByMachineId(machineId: string, tenantId: string): Promise<Module[]>;
  findAll(filters: ModuleFilters): Promise<Module[]>;
  findAllModules(): Promise<Module[]>; // Novo método para buscar todos os módulos
  update(id: string, data: UpdateModuleData, tenantId: string): Promise<Module>;
  delete(id: string, tenantId: string): Promise<boolean>;
  restore(id: string, tenantId: string): Promise<boolean>;
  count(filters: ModuleFilters): Promise<number>;
  assignToMachine(
    id: string,
    machineId: string,
    tenantId: string
  ): Promise<Module>;
  unassignFromMachine(id: string, tenantId: string): Promise<Module>;
}
