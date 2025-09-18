import { SensorCurrentValue } from '../../domain/entities/SensorCurrentValue';

export interface CreateSensorCurrentValueData {
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  metadata?: any;
  tenantId: string;
}

export interface UpdateSensorCurrentValueData {
  value?: number;
  rawValue?: number;
  unit?: string;
  quality?: string;
  metadata?: any;
}

export interface SensorCurrentValueFilters {
  sensorId?: string;
  tenantId: string;
  quality?: string;
}

export interface ISensorCurrentValueRepository {
  create(data: CreateSensorCurrentValueData): Promise<SensorCurrentValue>;
  findBySensor(
    sensorId: string,
    tenantId: string
  ): Promise<SensorCurrentValue | null>;
  findByTenant(
    tenantId: string,
    filters?: SensorCurrentValueFilters
  ): Promise<SensorCurrentValue[]>;
  upsert(
    sensorId: string,
    data: CreateSensorCurrentValueData
  ): Promise<SensorCurrentValue>;
  update(
    sensorId: string,
    data: UpdateSensorCurrentValueData
  ): Promise<SensorCurrentValue>;
  delete(sensorId: string): Promise<boolean>;
  count(filters: SensorCurrentValueFilters): Promise<number>;
}
