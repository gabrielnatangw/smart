export interface SensorDataProps {
  id: string;
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  timestamp: Date;
  metadata: any;
  tenantId: string;
}

export class SensorData {
  private constructor(private props: SensorDataProps) {}

  static create(data: {
    id: string;
    sensorId: string;
    value: number;
    rawValue?: number;
    unit?: string;
    quality?: string;
    metadata?: any;
    tenantId: string;
  }): SensorData {
    const now = new Date();

    if (!data.sensorId || data.sensorId.trim().length === 0) {
      throw new Error('Sensor ID is required');
    }

    if (typeof data.value !== 'number' || isNaN(data.value)) {
      throw new Error('Value must be a valid number');
    }

    if (
      data.rawValue !== undefined &&
      (typeof data.rawValue !== 'number' || isNaN(data.rawValue))
    ) {
      throw new Error('Raw value must be a valid number');
    }

    const validQualities = [
      'GOOD',
      'BAD',
      'UNCERTAIN',
      'MAINTENANCE',
      'OFFLINE',
    ];
    const quality = data.quality ?? 'GOOD';
    if (!validQualities.includes(quality)) {
      throw new Error('Invalid quality value');
    }

    return new SensorData({
      id: data.id,
      sensorId: data.sensorId,
      value: data.value,
      rawValue: data.rawValue,
      unit: data.unit?.trim(),
      quality,
      timestamp: now,
      metadata: data.metadata ?? {},
      tenantId: data.tenantId,
    });
  }

  static fromPersistence(data: SensorDataProps): SensorData {
    return new SensorData(data);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get sensorId(): string {
    return this.props.sensorId;
  }
  get value(): number {
    return this.props.value;
  }
  get rawValue(): number | undefined {
    return this.props.rawValue;
  }
  get unit(): string | undefined {
    return this.props.unit;
  }
  get quality(): string {
    return this.props.quality;
  }
  get timestamp(): Date {
    return this.props.timestamp;
  }
  get metadata(): any {
    return this.props.metadata;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }

  get isGoodQuality(): boolean {
    return this.props.quality === 'GOOD';
  }
  get isBadQuality(): boolean {
    return this.props.quality === 'BAD';
  }
  get isUncertainQuality(): boolean {
    return this.props.quality === 'UNCERTAIN';
  }
  get isMaintenanceQuality(): boolean {
    return this.props.quality === 'MAINTENANCE';
  }
  get isOfflineQuality(): boolean {
    return this.props.quality === 'OFFLINE';
  }
}
