import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import {
  CreateSensorData,
  ISensorRepository,
  SensorFilters,
  UpdateSensorData,
} from '../../../application/interfaces/ISensorRepository';
import { Sensor } from '../../../domain/entities/Sensor';

export class PrismaSensorRepository implements ISensorRepository {
  constructor(private prisma: PrismaClient) {}

  private mapDatabaseToSensor(sensorData: any): Sensor {
    return Sensor.fromPersistence({
      id: sensorData.sensor_id,
      name: sensorData.name,
      minScale: sensorData.min_scale ?? undefined,
      maxScale: sensorData.max_scale ?? undefined,
      minAlarm: sensorData.min_alarm ?? undefined,
      maxAlarm: sensorData.max_alarm ?? undefined,
      gain: sensorData.gain ?? undefined,
      inputMode: sensorData.input_mode ?? undefined,
      entry: sensorData.entry ?? undefined, // Canal de entrada (1-8)
      ix: sensorData.ix ?? undefined,
      gaugeColor: sensorData.gauge_color ?? undefined,
      offset: sensorData.offset ?? undefined,
      alarmTimeout: sensorData.alarm_timeout ?? undefined,
      counterName: sensorData.counter_name ?? undefined,
      frequencyCounterName: sensorData.frequency_counter_name ?? undefined,
      speedSource: sensorData.speed_source ?? undefined,
      interruptTransition: sensorData.interrupt_transition ?? undefined,
      timeUnit: sensorData.time_unit ?? undefined,
      speedUnit: sensorData.speed_unit ?? undefined,
      samplingInterval: sensorData.sampling_interval ?? undefined,
      minimumPeriod: sensorData.minimum_period ?? undefined,
      maximumPeriod: sensorData.maximum_period ?? undefined,
      frequencyResolution: sensorData.frequency_resolution ?? undefined,
      sensorType: sensorData.sensor_type,
      measurementUnitId: sensorData.measurement_unit_id,
      moduleId: sensorData.module_id,
      createdAt: sensorData.created_at,
      updatedAt: sensorData.updated_at || sensorData.created_at,
      deletedAt: sensorData.deleted_at ?? undefined,
    });
  }

  async create(data: CreateSensorData): Promise<Sensor> {
    const existingSensor = await this.prisma.sensor.findFirst({
      where: {
        name: data.name,
        measurement_unit_id: data.measurementUnitId,
        deleted_at: null,
      },
    });

    if (existingSensor) {
      throw new Error('Sensor name already exists in this measurement unit');
    }

    const sensorData = await this.prisma.sensor.create({
      data: {
        sensor_id: uuidv4(),
        name: data.name,
        min_scale: data.minScale ?? null,
        max_scale: data.maxScale ?? null,
        min_alarm: data.minAlarm ?? null,
        max_alarm: data.maxAlarm ?? null,
        gain: data.gain ?? null,
        input_mode: data.inputMode ?? null,
        entry: data.entry ?? null, // Canal de entrada (1-8)
        ix: data.ix ?? null,
        gauge_color: data.gaugeColor ?? null,
        offset: data.offset ?? null,
        alarm_timeout: data.alarmTimeout ?? null,
        counter_name: data.counterName ?? null,
        frequency_counter_name: data.frequencyCounterName ?? null,
        speed_source: data.speedSource ?? null,
        interrupt_transition: data.interruptTransition ?? null,
        time_unit: data.timeUnit ?? null,
        speed_unit: data.speedUnit ?? null,
        sampling_interval: data.samplingInterval ?? null,
        minimum_period: data.minimumPeriod ?? null,
        maximum_period: data.maximumPeriod ?? null,
        frequency_resolution: data.frequencyResolution ?? null,
        sensor_type: data.sensorType,
        measurement_unit_id: data.measurementUnitId,
        module_id: data.moduleId,
        created_at: new Date(),
        updated_at: new Date(),
      },
    });

    return this.mapDatabaseToSensor(sensorData);
  }

  async findById(id: string): Promise<Sensor | null> {
    const sensorData = await this.prisma.sensor.findUnique({
      where: {
        sensor_id: id,
      },
    });

    if (!sensorData) {
      return null;
    }

    return this.mapDatabaseToSensor(sensorData);
  }

  async findByName(
    name: string,
    measurementUnitId: string
  ): Promise<Sensor | null> {
    const sensorData = await this.prisma.sensor.findFirst({
      where: {
        name: name,
        measurement_unit_id: measurementUnitId,
        deleted_at: null,
      },
    });

    if (!sensorData) {
      return null;
    }

    return this.mapDatabaseToSensor(sensorData);
  }

  async findAll(filters: SensorFilters): Promise<Sensor[]> {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.sensorType !== undefined) {
      where.sensor_type = filters.sensorType;
    }

    if (filters.measurementUnitId) {
      where.measurement_unit_id = filters.measurementUnitId;
    }

    if (filters.moduleId) {
      where.module_id = filters.moduleId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    // Filtrar por tenant através da relação com Module
    if (filters.tenantId) {
      where.module = {
        tenant_id: filters.tenantId,
      };
    }

    const sensorsData = await this.prisma.sensor.findMany({
      where,
      orderBy: {
        created_at: 'desc',
      },
    });

    return sensorsData.map(sensorData => this.mapDatabaseToSensor(sensorData));
  }

  async findByModule(moduleId: string): Promise<Sensor[]> {
    return this.findAll({ moduleId, isDeleted: false });
  }

  async findByMeasurementUnit(measurementUnitId: string): Promise<Sensor[]> {
    return this.findAll({ measurementUnitId, isDeleted: false });
  }

  async update(id: string, data: UpdateSensorData): Promise<Sensor> {
    const existingSensor = await this.prisma.sensor.findUnique({
      where: {
        sensor_id: id,
      },
    });

    if (!existingSensor) {
      throw new Error('Sensor not found');
    }

    if (existingSensor.deleted_at) {
      throw new Error('Cannot update deleted sensor');
    }

    if (data.name && data.measurementUnitId) {
      const duplicateCheck = await this.prisma.sensor.findFirst({
        where: {
          name: data.name,
          measurement_unit_id: data.measurementUnitId,
          sensor_id: { not: id },
          deleted_at: null,
        },
      });

      if (duplicateCheck) {
        throw new Error('Sensor name already exists in this measurement unit');
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.minScale !== undefined)
      updateData.min_scale = data.minScale ?? null;
    if (data.maxScale !== undefined)
      updateData.max_scale = data.maxScale ?? null;
    if (data.minAlarm !== undefined)
      updateData.min_alarm = data.minAlarm ?? null;
    if (data.maxAlarm !== undefined)
      updateData.max_alarm = data.maxAlarm ?? null;
    if (data.gain !== undefined) updateData.gain = data.gain ?? null;
    if (data.inputMode !== undefined)
      updateData.input_mode = data.inputMode ?? null;
    if (data.entry !== undefined) updateData.entry = data.entry ?? null; // Canal de entrada (1-8)
    if (data.ix !== undefined) updateData.ix = data.ix ?? null;
    if (data.gaugeColor !== undefined)
      updateData.gauge_color = data.gaugeColor ?? null;
    if (data.offset !== undefined) updateData.offset = data.offset ?? null;
    if (data.alarmTimeout !== undefined)
      updateData.alarm_timeout = data.alarmTimeout ?? null;
    if (data.counterName !== undefined)
      updateData.counter_name = data.counterName ?? null;
    if (data.frequencyCounterName !== undefined)
      updateData.frequency_counter_name = data.frequencyCounterName ?? null;
    if (data.speedSource !== undefined)
      updateData.speed_source = data.speedSource ?? null;
    if (data.interruptTransition !== undefined)
      updateData.interrupt_transition = data.interruptTransition ?? null;
    if (data.timeUnit !== undefined)
      updateData.time_unit = data.timeUnit ?? null;
    if (data.speedUnit !== undefined)
      updateData.speed_unit = data.speedUnit ?? null;
    if (data.samplingInterval !== undefined)
      updateData.sampling_interval = data.samplingInterval ?? null;
    if (data.minimumPeriod !== undefined)
      updateData.minimum_period = data.minimumPeriod ?? null;
    if (data.maximumPeriod !== undefined)
      updateData.maximum_period = data.maximumPeriod ?? null;
    if (data.frequencyResolution !== undefined)
      updateData.frequency_resolution = data.frequencyResolution ?? null;
    if (data.sensorType !== undefined) updateData.sensor_type = data.sensorType;
    if (data.measurementUnitId !== undefined)
      updateData.measurement_unit_id = data.measurementUnitId;
    if (data.moduleId !== undefined) updateData.module_id = data.moduleId;

    const updatedSensor = await this.prisma.sensor.update({
      where: {
        sensor_id: id,
      },
      data: updateData,
    });

    return this.mapDatabaseToSensor(updatedSensor);
  }

  async delete(id: string): Promise<boolean> {
    const existingSensor = await this.prisma.sensor.findUnique({
      where: {
        sensor_id: id,
      },
    });

    if (!existingSensor) {
      throw new Error('Sensor not found');
    }

    await this.prisma.sensor.update({
      where: {
        sensor_id: id,
      },
      data: {
        deleted_at: new Date(),
        updated_at: new Date(),
      },
    });

    return true;
  }

  async restore(id: string): Promise<boolean> {
    const existingSensor = await this.prisma.sensor.findUnique({
      where: {
        sensor_id: id,
      },
    });

    if (!existingSensor) {
      throw new Error('Sensor not found');
    }

    if (!existingSensor.deleted_at) {
      throw new Error('Sensor is not deleted');
    }

    await this.prisma.sensor.update({
      where: {
        sensor_id: id,
      },
      data: {
        deleted_at: null,
        updated_at: new Date(),
      },
    });

    return true;
  }

  async count(filters: SensorFilters): Promise<number> {
    const where: any = {};

    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.sensorType !== undefined) {
      where.sensor_type = filters.sensorType;
    }

    if (filters.measurementUnitId) {
      where.measurement_unit_id = filters.measurementUnitId;
    }

    if (filters.moduleId) {
      where.module_id = filters.moduleId;
    }

    if (filters.isDeleted !== undefined) {
      where.deleted_at = filters.isDeleted ? { not: null } : null;
    }

    return this.prisma.sensor.count({ where });
  }
}
