import { v4 as uuidv4 } from 'uuid';

import { SensorCurrentValue } from '../../domain/entities/SensorCurrentValue';
import { SensorData } from '../../domain/entities/SensorData';
import {
  CreateSensorCurrentValueData,
  ISensorCurrentValueRepository,
} from '../interfaces/ISensorCurrentValueRepository';
import {
  CreateSensorDataData,
  ISensorDataRepository,
  SensorDataFilters,
} from '../interfaces/ISensorDataRepository';

export class SensorDataApplicationService {
  constructor(
    private sensorDataRepository: ISensorDataRepository,
    private sensorCurrentValueRepository: ISensorCurrentValueRepository
  ) {}

  async createSensorData(data: {
    sensorId: string;
    value: number;
    rawValue?: number;
    unit?: string;
    quality?: string;
    metadata?: any;
    tenantId: string;
  }): Promise<SensorData> {
    try {
      const sensorData: CreateSensorDataData = {
        ...data,
        quality: data.quality ?? 'GOOD',
      };

      const _sensorDataEntity = SensorData.create({
        id: uuidv4(),
        ...sensorData,
      });

      const createdData = await this.sensorDataRepository.create(sensorData);

      // Atualizar valor atual
      await this.updateCurrentValue(data.sensorId, {
        value: data.value,
        rawValue: data.rawValue,
        unit: data.unit,
        quality: data.quality ?? 'GOOD',
        metadata: data.metadata,
        tenantId: data.tenantId,
      });

      return createdData;
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorData(
    sensorId: string,
    tenantId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
      quality?: string;
      limit?: number;
    }
  ): Promise<SensorData[]> {
    try {
      const dataFilters: SensorDataFilters = {
        sensorId,
        tenantId,
        ...filters,
      };

      return await this.sensorDataRepository.findBySensor(
        sensorId,
        tenantId,
        dataFilters
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getLatestSensorData(
    sensorId: string,
    tenantId: string,
    limit: number = 100
  ): Promise<SensorData[]> {
    try {
      return await this.sensorDataRepository.findLatest(
        sensorId,
        tenantId,
        limit
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentValue(
    sensorId: string,
    tenantId: string
  ): Promise<SensorCurrentValue | null> {
    try {
      return await this.sensorCurrentValueRepository.findBySensor(
        sensorId,
        tenantId
      );
    } catch (error: any) {
      throw error;
    }
  }

  async updateCurrentValue(
    sensorId: string,
    data: {
      value: number;
      rawValue?: number;
      unit?: string;
      quality: string;
      metadata?: any;
      tenantId: string;
    }
  ): Promise<SensorCurrentValue> {
    try {
      const currentValueData: CreateSensorCurrentValueData = {
        sensorId,
        ...data,
      };

      return await this.sensorCurrentValueRepository.upsert(
        sensorId,
        currentValueData
      );
    } catch (error: any) {
      throw error;
    }
  }

  async getCurrentValuesByTenant(
    tenantId: string,
    filters?: {
      sensorId?: string;
      quality?: string;
    }
  ): Promise<SensorCurrentValue[]> {
    try {
      return await this.sensorCurrentValueRepository.findByTenant(tenantId, {
        tenantId,
        ...filters,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorDataCount(filters: SensorDataFilters): Promise<number> {
    try {
      return await this.sensorDataRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteOldData(olderThan: Date, tenantId: string): Promise<number> {
    try {
      return await this.sensorDataRepository.deleteOldData(olderThan, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getSensorDataStats(
    tenantId: string,
    filters?: {
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    total: number;
    byQuality: Array<{ quality: string; count: number }>;
    bySensor: Array<{ sensorId: string; count: number }>;
    averageValue: number;
    minValue: number;
    maxValue: number;
  }> {
    try {
      const dataFilters: SensorDataFilters = {
        tenantId,
        ...filters,
      };

      const total = await this.sensorDataRepository.count(dataFilters);

      // Buscar dados para análise
      const allData = await this.sensorDataRepository.findBySensor(
        '',
        tenantId,
        {
          ...dataFilters,
          limit: 10000, // Limite para análise
        }
      );

      const byQuality = allData.reduce(
        (acc, data) => {
          const existing = acc.find(item => item.quality === data.quality);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ quality: data.quality, count: 1 });
          }
          return acc;
        },
        [] as Array<{ quality: string; count: number }>
      );

      const bySensor = allData.reduce(
        (acc, data) => {
          const existing = acc.find(item => item.sensorId === data.sensorId);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ sensorId: data.sensorId, count: 1 });
          }
          return acc;
        },
        [] as Array<{ sensorId: string; count: number }>
      );

      const values = allData.map(data => data.value);
      const averageValue =
        values.length > 0
          ? values.reduce((sum, val) => sum + val, 0) / values.length
          : 0;
      const minValue = values.length > 0 ? Math.min(...values) : 0;
      const maxValue = values.length > 0 ? Math.max(...values) : 0;

      return {
        total,
        byQuality: byQuality.sort((a, b) => b.count - a.count),
        bySensor: bySensor.sort((a, b) => b.count - a.count),
        averageValue,
        minValue,
        maxValue,
      };
    } catch (error: any) {
      throw error;
    }
  }
}
