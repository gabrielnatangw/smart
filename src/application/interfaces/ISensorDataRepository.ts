import { SensorData } from '../../domain/entities/SensorData';

export interface CreateSensorDataData {
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  metadata?: any;
  tenantId: string;
}

export interface SensorDataFilters {
  sensorId?: string;
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  quality?: string;
  limit?: number;
}

export interface ISensorDataRepository {
  create(data: CreateSensorDataData): Promise<SensorData>;
  findBySensor(
    sensorId: string,
    tenantId: string,
    filters?: SensorDataFilters
  ): Promise<SensorData[]>;
  findLatest(
    sensorId: string,
    tenantId: string,
    limit?: number
  ): Promise<SensorData[]>;
  count(filters: SensorDataFilters): Promise<number>;
  deleteOldData(olderThan: Date, tenantId: string): Promise<number>;
}
