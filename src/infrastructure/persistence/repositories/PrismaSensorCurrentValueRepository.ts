import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateSensorCurrentValueData,
  ISensorCurrentValueRepository,
  SensorCurrentValueFilters,
  UpdateSensorCurrentValueData,
} from '../../../application/interfaces/ISensorCurrentValueRepository';
import { SensorCurrentValue } from '../../../domain/entities/SensorCurrentValue';

export class PrismaSensorCurrentValueRepository
  implements ISensorCurrentValueRepository
{
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToSensorCurrentValue(data: any): SensorCurrentValue {
    return SensorCurrentValue.fromPersistence({
      id: data.current_value_id,
      sensorId: data.sensor_id,
      value: Number(data.value),
      rawValue: data.raw_value ? Number(data.raw_value) : undefined,
      unit: data.unit,
      quality: data.quality,
      lastUpdated: data.last_updated,
      metadata: data.metadata,
      tenantId: data.tenant_id,
    });
  }

  async create(
    data: CreateSensorCurrentValueData
  ): Promise<SensorCurrentValue> {
    const currentValue = await this.prisma.sensorCurrentValue.create({
      data: {
        current_value_id: uuidv4(),
        sensor_id: data.sensorId,
        value: data.value,
        raw_value: data.rawValue,
        unit: data.unit,
        quality: data.quality as any,
        metadata: data.metadata ?? {},
        tenant_id: data.tenantId,
        last_updated: new Date(),
      },
    });

    return this.mapDatabaseToSensorCurrentValue(currentValue);
  }

  async findBySensor(
    sensorId: string,
    tenantId: string
  ): Promise<SensorCurrentValue | null> {
    const currentValue = await this.prisma.sensorCurrentValue.findUnique({
      where: {
        sensor_id: sensorId,
      },
    });

    if (!currentValue || currentValue.tenant_id !== tenantId) {
      return null;
    }

    return this.mapDatabaseToSensorCurrentValue(currentValue);
  }

  async findByTenant(
    tenantId: string,
    filters?: SensorCurrentValueFilters
  ): Promise<SensorCurrentValue[]> {
    const where: any = {
      tenant_id: tenantId,
    };

    if (filters?.sensorId) {
      where.sensor_id = filters.sensorId;
    }

    if (filters?.quality) {
      where.quality = filters.quality;
    }

    const data = await this.prisma.sensorCurrentValue.findMany({
      where,
      orderBy: {
        last_updated: 'desc',
      },
    });

    return data.map(item => this.mapDatabaseToSensorCurrentValue(item));
  }

  async upsert(
    sensorId: string,
    data: CreateSensorCurrentValueData
  ): Promise<SensorCurrentValue> {
    const currentValue = await this.prisma.sensorCurrentValue.upsert({
      where: {
        sensor_id: sensorId,
      },
      update: {
        value: data.value,
        raw_value: data.rawValue,
        unit: data.unit,
        quality: data.quality as any,
        metadata: data.metadata ?? {},
        last_updated: new Date(),
      },
      create: {
        current_value_id: uuidv4(),
        sensor_id: data.sensorId,
        value: data.value,
        raw_value: data.rawValue,
        unit: data.unit,
        quality: data.quality as any,
        metadata: data.metadata ?? {},
        tenant_id: data.tenantId,
        last_updated: new Date(),
      },
    });

    return this.mapDatabaseToSensorCurrentValue(currentValue);
  }

  async update(
    sensorId: string,
    data: UpdateSensorCurrentValueData
  ): Promise<SensorCurrentValue> {
    const existingValue = await this.prisma.sensorCurrentValue.findUnique({
      where: {
        sensor_id: sensorId,
      },
    });

    if (!existingValue) {
      throw new Error('Sensor current value not found');
    }

    const updateData: any = {
      last_updated: new Date(),
    };

    if (data.value !== undefined) updateData.value = data.value;
    if (data.rawValue !== undefined) updateData.raw_value = data.rawValue;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.quality !== undefined) updateData.quality = data.quality as any;
    if (data.metadata !== undefined) updateData.metadata = data.metadata;

    const updatedValue = await this.prisma.sensorCurrentValue.update({
      where: {
        sensor_id: sensorId,
      },
      data: updateData,
    });

    return this.mapDatabaseToSensorCurrentValue(updatedValue);
  }

  async delete(sensorId: string): Promise<boolean> {
    const existingValue = await this.prisma.sensorCurrentValue.findUnique({
      where: {
        sensor_id: sensorId,
      },
    });

    if (!existingValue) {
      throw new Error('Sensor current value not found');
    }

    await this.prisma.sensorCurrentValue.delete({
      where: {
        sensor_id: sensorId,
      },
    });

    return true;
  }

  async count(filters: SensorCurrentValueFilters): Promise<number> {
    const where: any = {
      tenant_id: filters.tenantId,
    };

    if (filters.sensorId) {
      where.sensor_id = filters.sensorId;
    }

    if (filters.quality) {
      where.quality = filters.quality;
    }

    return this.prisma.sensorCurrentValue.count({ where });
  }
}
