import { Machine } from '../../domain/entities/Machine';
import { SpeedMeasureTech } from '../../domain/value-objects/SpeedMeasureTech';

export interface CreateMachineData {
  operationalSector: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  yearOfManufacture: string;
  yearOfInstallation: string;
  maxPerformance: number;
  speedMeasureTech: SpeedMeasureTech;
  tenantId: string;
}

export interface UpdateMachineData {
  operationalSector?: string | undefined;
  name?: string | undefined;
  manufacturer?: string | undefined;
  serialNumber?: string | undefined;
  yearOfManufacture?: string | undefined;
  yearOfInstallation?: string | undefined;
  maxPerformance?: number | undefined;
  speedMeasureTech?: SpeedMeasureTech | undefined;
}

export interface MachineFilters {
  operationalSector?: string | undefined;
  name?: string | undefined;
  manufacturer?: string | undefined;
  isDeleted?: boolean | undefined;
  tenantId: string;
}

export interface IMachineRepository {
  create(data: CreateMachineData): Promise<Machine>;
  findById(id: string, tenantId: string): Promise<Machine | null>;
  findBySerialNumber(
    serialNumber: string,
    tenantId: string
  ): Promise<Machine | null>;
  findAll(filters: MachineFilters): Promise<Machine[]>;
  update(
    id: string,
    data: UpdateMachineData,
    tenantId: string
  ): Promise<Machine>;
  delete(id: string, tenantId: string): Promise<boolean>;
  restore(id: string, tenantId: string): Promise<boolean>;
  count(filters: MachineFilters): Promise<number>;
}
