export interface SensorCurrentValueProps {
  id: string;
  sensorId: string;
  value: number;
  rawValue?: number;
  unit?: string;
  quality: string;
  lastUpdated: Date;
  metadata: any;
  tenantId: string;
}

export class SensorCurrentValue {
  private constructor(private props: SensorCurrentValueProps) {}

  static create(data: {
    id: string;
    sensorId: string;
    value: number;
    rawValue?: number;
    unit?: string;
    quality?: string;
    metadata?: any;
    tenantId: string;
  }): SensorCurrentValue {
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

    return new SensorCurrentValue({
      id: data.id,
      sensorId: data.sensorId,
      value: data.value,
      rawValue: data.rawValue,
      unit: data.unit?.trim(),
      quality,
      lastUpdated: now,
      metadata: data.metadata ?? {},
      tenantId: data.tenantId,
    });
  }

  static fromPersistence(data: SensorCurrentValueProps): SensorCurrentValue {
    return new SensorCurrentValue(data);
  }

  update(data: {
    value?: number;
    rawValue?: number;
    unit?: string;
    quality?: string;
    metadata?: any;
  }): void {
    if (data.value !== undefined) {
      if (typeof data.value !== 'number' || isNaN(data.value)) {
        throw new Error('Value must be a valid number');
      }
      this.props.value = data.value;
    }

    if (data.rawValue !== undefined) {
      if (
        data.rawValue !== null &&
        (typeof data.rawValue !== 'number' || isNaN(data.rawValue))
      ) {
        throw new Error('Raw value must be a valid number');
      }
      this.props.rawValue = data.rawValue;
    }

    if (data.unit !== undefined) {
      this.props.unit = data.unit?.trim();
    }

    if (data.quality !== undefined) {
      const validQualities = [
        'GOOD',
        'BAD',
        'UNCERTAIN',
        'MAINTENANCE',
        'OFFLINE',
      ];
      if (!validQualities.includes(data.quality)) {
        throw new Error('Invalid quality value');
      }
      this.props.quality = data.quality;
    }

    if (data.metadata !== undefined) {
      this.props.metadata = data.metadata;
    }

    this.props.lastUpdated = new Date();
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
  get lastUpdated(): Date {
    return this.props.lastUpdated;
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

  isStale(maxAgeMinutes: number = 5): boolean {
    const now = new Date();
    const ageMinutes =
      (now.getTime() - this.props.lastUpdated.getTime()) / (1000 * 60);
    return ageMinutes > maxAgeMinutes;
  }
}
