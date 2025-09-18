export interface CreateSensorDTO {
  name: string;
  minScale?: number | undefined;
  maxScale?: number | undefined;
  minAlarm?: number | undefined;
  maxAlarm?: number | undefined;
  gain?: number | undefined;
  inputMode?: string | undefined;
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

export interface UpdateSensorDTO {
  name?: string | undefined;
  minScale?: number | undefined;
  maxScale?: number | undefined;
  minAlarm?: number | undefined;
  maxAlarm?: number | undefined;
  gain?: number | undefined;
  inputMode?: string | undefined;
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

export interface SensorResponseDTO {
  id: string;
  name: string;
  minScale?: number | undefined;
  maxScale?: number | undefined;
  minAlarm?: number | undefined;
  maxAlarm?: number | undefined;
  gain?: number | undefined;
  inputMode?: string | undefined;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
  isDeleted: boolean;
}

export interface SensorFiltersDTO {
  name?: string | undefined;
  sensorType?: number | undefined;
  measurementUnitId?: string | undefined;
  moduleId?: string | undefined;
  isDeleted?: boolean | undefined;
}

export interface SensorStatsDTO {
  total: number;
  active: number;
  deleted: number;
  byType: Array<{ sensorType: number; count: number }>;
  byMeasurementUnit: Array<{ measurementUnitId: string; count: number }>;
  byModule: Array<{ moduleId: string; count: number }>;
}
