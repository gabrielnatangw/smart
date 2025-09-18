export interface SensorProps {
  id: string;
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
}

export interface SensorCreateProps {
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

export interface SensorUpdateProps {
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

export class Sensor {
  public readonly id: string;
  public readonly name: string;
  public readonly minScale?: number | undefined;
  public readonly maxScale?: number | undefined;
  public readonly minAlarm?: number | undefined;
  public readonly maxAlarm?: number | undefined;
  public readonly gain?: number | undefined;
  public readonly inputMode?: string | undefined;
  public readonly entry?: number | undefined; // Canal de entrada (1-8)
  public readonly ix?: number | undefined;
  public readonly gaugeColor?: string | undefined;
  public readonly offset?: number | undefined;
  public readonly alarmTimeout?: number | undefined;
  public readonly counterName?: string | undefined;
  public readonly frequencyCounterName?: string | undefined;
  public readonly speedSource?: boolean | undefined;
  public readonly interruptTransition?: string | undefined;
  public readonly timeUnit?: string | undefined;
  public readonly speedUnit?: string | undefined;
  public readonly samplingInterval?: number | undefined;
  public readonly minimumPeriod?: number | undefined;
  public readonly maximumPeriod?: number | undefined;
  public readonly frequencyResolution?: number | undefined;
  public readonly sensorType: number;
  public readonly measurementUnitId: string;
  public readonly moduleId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;
  public readonly deletedAt?: Date | undefined;

  constructor(props: SensorProps) {
    this.id = props.id;
    this.name = props.name;
    this.minScale = props.minScale;
    this.maxScale = props.maxScale;
    this.minAlarm = props.minAlarm;
    this.maxAlarm = props.maxAlarm;
    this.gain = props.gain;
    this.inputMode = props.inputMode;
    this.entry = props.entry; // Canal de entrada (1-8)
    this.ix = props.ix;
    this.gaugeColor = props.gaugeColor;
    this.offset = props.offset;
    this.alarmTimeout = props.alarmTimeout;
    this.counterName = props.counterName;
    this.frequencyCounterName = props.frequencyCounterName;
    this.speedSource = props.speedSource;
    this.interruptTransition = props.interruptTransition;
    this.timeUnit = props.timeUnit;
    this.speedUnit = props.speedUnit;
    this.samplingInterval = props.samplingInterval;
    this.minimumPeriod = props.minimumPeriod;
    this.maximumPeriod = props.maximumPeriod;
    this.frequencyResolution = props.frequencyResolution;
    this.sensorType = props.sensorType;
    this.measurementUnitId = props.measurementUnitId;
    this.moduleId = props.moduleId;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.deletedAt = props.deletedAt;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  public static create(props: SensorCreateProps & { id: string }): Sensor {
    const now = new Date();
    return new Sensor({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPersistence(props: SensorProps): Sensor {
    return new Sensor(props);
  }

  public update(updateData: SensorUpdateProps): void {
    const updatedProps = { ...updateData };

    Object.keys(updatedProps).forEach(key => {
      const value = updatedProps[key as keyof SensorUpdateProps];
      if (value !== undefined) {
        (this as any)[key] = value;
      }
    });

    (this as any).updatedAt = new Date();
  }
}
