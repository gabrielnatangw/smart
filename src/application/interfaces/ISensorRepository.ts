import { Sensor } from '../../domain/entities/Sensor';

export interface CreateSensorData {
  name: string;
  minScale?: number | undefined;
  maxScale?: number | undefined;
  minAlarm?: number | undefined;
  maxAlarm?: number | undefined;
  gain?: number | undefined;
  inputMode?: string | undefined;
  entry?: number | undefined; // Canal de entrada (1-8)
  ix?: number | undefined;
  gaugeColor?: string | undefined;
  offset?: number | undefined;
  alarmTimeout?: number | undefined;
  counterName?: string | undefined;
  frequencyCounterName?: string | undefined;
  speedSource?: boolean | undefined;
  interruptTransition?: string | undefined;
  timeUnit?: string | undefined;
  speedUnit?: string | undefined;
  samplingInterval?: number | undefined;
  minimumPeriod?: number | undefined;
  maximumPeriod?: number | undefined;
  frequencyResolution?: number | undefined;
  sensorType: number;
  measurementUnitId: string;
  moduleId: string;
}

export interface UpdateSensorData {
  name?: string | undefined;
  minScale?: number | undefined;
  maxScale?: number | undefined;
  minAlarm?: number | undefined;
  maxAlarm?: number | undefined;
  gain?: number | undefined;
  inputMode?: string | undefined;
  entry?: number | undefined; // Canal de entrada (1-8)
  ix?: number | undefined;
  gaugeColor?: string | undefined;
  offset?: number | undefined;
  alarmTimeout?: number | undefined;
  counterName?: string | undefined;
  frequencyCounterName?: string | undefined;
  speedSource?: boolean | undefined;
  interruptTransition?: string | undefined;
  timeUnit?: string | undefined;
  speedUnit?: string | undefined;
  samplingInterval?: number | undefined;
  minimumPeriod?: number | undefined;
  maximumPeriod?: number | undefined;
  frequencyResolution?: number | undefined;
  sensorType?: number | undefined;
  measurementUnitId?: string | undefined;
  moduleId?: string | undefined;
}

export interface SensorFilters {
  name?: string | undefined;
  sensorType?: number | undefined;
  measurementUnitId?: string | undefined;
  moduleId?: string | undefined;
  isDeleted?: boolean | undefined;
  tenantId?: string | undefined;
}

export interface ISensorRepository {
  create(data: CreateSensorData): Promise<Sensor>;
  findById(id: string): Promise<Sensor | null>;
  findByName(name: string, measurementUnitId: string): Promise<Sensor | null>;
  findAll(filters: SensorFilters): Promise<Sensor[]>;
  findByModule(moduleId: string): Promise<Sensor[]>;
  findByMeasurementUnit(measurementUnitId: string): Promise<Sensor[]>;
  update(id: string, data: UpdateSensorData): Promise<Sensor>;
  delete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  count(filters: SensorFilters): Promise<number>;
}
