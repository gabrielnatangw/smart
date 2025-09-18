import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateSensorDataData,
  ISensorDataRepository,
  SensorDataFilters,
} from '../../../application/interfaces/ISensorDataRepository';
import { SensorData } from '../../../domain/entities/SensorData';

export class PrismaSensorDataRepository implements ISensorDataRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToSensorData(data: any): SensorData {
    return SensorData.fromPersistence({
      id: data.data_id,
      sensorId: data.sensor_id,
      value: Number(data.value),
      rawValue: data.raw_value ? Number(data.raw_value) : undefined,
      unit: data.unit,
      quality: data.quality,
      timestamp: data.timestamp,
      metadata: data.metadata,
      tenantId: data.tenant_id,
    });
  }

  async create(data: CreateSensorDataData): Promise<SensorData> {
    const sensorData = await this.prisma.sensorData.create({
      data: {
        data_id: uuidv4(),
        sensor_id: data.sensorId,
        value: data.value,
        raw_value: data.rawValue,
        unit: data.unit,
        quality: data.quality as any,
        metadata: data.metadata ?? {},
        tenant_id: data.tenantId,
        timestamp: new Date(),
      },
    });

    return this.mapDatabaseToSensorData(sensorData);
  }

  async findBySensor(
    sensorId: string,
    tenantId: string,
    filters?: SensorDataFilters
  ): Promise<SensorData[]> {
    const where: any = {
      sensor_id: sensorId,
      tenant_id: tenantId,
    };

    if (filters?.startDate || filters?.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    if (filters?.quality) {
      where.quality = filters.quality;
    }

    const limit = filters?.limit ?? 1000;

    const data = await this.prisma.sensorData.findMany({
      where,
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return data.map(item => this.mapDatabaseToSensorData(item));
  }

  async findLatest(
    sensorId: string,
    tenantId: string,
    limit: number = 100
  ): Promise<SensorData[]> {
    const data = await this.prisma.sensorData.findMany({
      where: {
        sensor_id: sensorId,
        tenant_id: tenantId,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    return data.map(item => this.mapDatabaseToSensorData(item));
  }

  async count(filters: SensorDataFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.sensorId) {
      where.sensor_id = filters.sensorId;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    if (filters.quality) {
      where.quality = filters.quality;
    }

    return this.prisma.sensorData.count({ where });
  }

  async deleteOldData(olderThan: Date, tenantId: string): Promise<number> {
    const result = await this.prisma.sensorData.deleteMany({
      where: {
        tenant_id: tenantId,
        timestamp: {
          lt: olderThan,
        },
      },
    });

    return result.count;
  }
}
