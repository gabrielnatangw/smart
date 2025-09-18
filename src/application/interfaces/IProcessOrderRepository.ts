import { ProcessOrder } from '../../domain/entities/ProcessOrder';

export interface CreateProcessOrderData {
  name: string;
  jobRun: number;
  plannedSpeed: number;
  startProduction: Date;
  expectedRunTime: Date;
  programmedMultiplier?: number;
  realMultiplier?: number;
  zeroSpeedThreshold?: number;
  productionSpeedThreshold?: number;
  zeroSpeedTimeout?: number;
  productionSpeedTimeout?: number;
  cycleToRun?: number;
  cycleTime?: number;
  machineId?: string;
  userId?: string;
  productOrderId: string;
}

export interface UpdateProcessOrderData {
  name?: string;
  jobRun?: number;
  plannedSpeed?: number;
  startProduction?: Date;
  expectedRunTime?: Date;
  programmedMultiplier?: number;
  realMultiplier?: number;
  zeroSpeedThreshold?: number;
  productionSpeedThreshold?: number;
  zeroSpeedTimeout?: number;
  productionSpeedTimeout?: number;
  cycleToRun?: number;
  cycleTime?: number;
  machineId?: string;
  userId?: string;
}

export interface ProcessOrderFilters {
  name?: string;
  jobRun?: number;
  plannedSpeedMin?: number;
  plannedSpeedMax?: number;
  startProductionFrom?: Date;
  startProductionTo?: Date;
  expectedRunTimeFrom?: Date;
  expectedRunTimeTo?: Date;
  machineId?: string;
  userId?: string;
  productOrderId?: string;
  includeDeleted?: boolean;
}

export interface IProcessOrderRepository {
  create(data: CreateProcessOrderData): Promise<ProcessOrder>;
  findById(id: string, includeDeleted?: boolean): Promise<ProcessOrder | null>;
  findByName(
    name: string,
    productOrderId: string,
    includeDeleted?: boolean
  ): Promise<ProcessOrder | null>;
  findAll(filters?: ProcessOrderFilters): Promise<ProcessOrder[]>;
  findByProductOrder(
    productOrderId: string,
    includeDeleted?: boolean
  ): Promise<ProcessOrder[]>;
  findByMachine(
    machineId: string,
    includeDeleted?: boolean
  ): Promise<ProcessOrder[]>;
  findByUser(userId: string, includeDeleted?: boolean): Promise<ProcessOrder[]>;
  update(
    id: string,
    data: UpdateProcessOrderData
  ): Promise<ProcessOrder | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  existsByName(
    name: string,
    productOrderId: string,
    excludeId?: string
  ): Promise<boolean>;
  count(filters?: ProcessOrderFilters): Promise<number>;
}
