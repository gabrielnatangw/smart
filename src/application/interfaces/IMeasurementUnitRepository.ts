import { MeasurementUnit } from '../../domain/entities/MeasurementUnit';

export interface CreateMeasurementUnitData {
  label: string;
  unitSymbol: string;
  tenantId: string;
}

export interface UpdateMeasurementUnitData {
  label?: string | undefined;
  unitSymbol?: string | undefined;
}

export interface MeasurementUnitFilters {
  label?: string | undefined;
  unitSymbol?: string | undefined;
  tenantId?: string | undefined;
  isDeleted?: boolean | undefined;
}

export interface IMeasurementUnitRepository {
  create(data: CreateMeasurementUnitData): Promise<MeasurementUnit>;
  findById(id: string): Promise<MeasurementUnit | null>;
  findByLabel(label: string, tenantId: string): Promise<MeasurementUnit | null>;
  findAll(filters: MeasurementUnitFilters): Promise<MeasurementUnit[]>;
  findByTenant(tenantId: string): Promise<MeasurementUnit[]>;
  update(id: string, data: UpdateMeasurementUnitData): Promise<MeasurementUnit>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filters: MeasurementUnitFilters): Promise<number>;
}
