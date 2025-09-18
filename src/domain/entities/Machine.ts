import {
  SpeedMeasureTech,
  isValidSpeedMeasureTech,
} from '../value-objects/SpeedMeasureTech';

export interface MachineProps {
  id: string;
  operationalSector: string;
  name: string;
  manufacturer: string;
  serialNumber: string;
  yearOfManufacture: string;
  yearOfInstallation: string;
  maxPerformance: number;
  speedMeasureTech: SpeedMeasureTech;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Machine {
  private constructor(private props: MachineProps) {}

  static create(data: {
    id: string;
    operationalSector: string;
    name: string;
    manufacturer: string;
    serialNumber: string;
    yearOfManufacture: string;
    yearOfInstallation: string;
    maxPerformance: number;
    speedMeasureTech: SpeedMeasureTech;
    tenantId: string;
  }): Machine {
    const now = new Date();

    if (!data.operationalSector || data.operationalSector.trim().length === 0) {
      throw new Error('Operational sector is required');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Machine name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Machine name cannot exceed 100 characters');
    }

    if (!data.manufacturer || data.manufacturer.trim().length === 0) {
      throw new Error('Manufacturer is required');
    }

    if (!data.serialNumber || data.serialNumber.trim().length === 0) {
      throw new Error('Serial number is required');
    }

    if (!data.yearOfManufacture || data.yearOfManufacture.trim().length === 0) {
      throw new Error('Year of manufacture is required');
    }

    if (
      !data.yearOfInstallation ||
      data.yearOfInstallation.trim().length === 0
    ) {
      throw new Error('Year of installation is required');
    }

    if (!data.tenantId) {
      throw new Error('Tenant ID is required');
    }

    if (data.maxPerformance < 0) {
      throw new Error('Max performance must be a positive number');
    }

    if (!isValidSpeedMeasureTech(data.speedMeasureTech)) {
      throw new Error('Speed measure tech must be a valid measurement type');
    }

    return new Machine({
      id: data.id,
      operationalSector: data.operationalSector.trim(),
      name: data.name.trim(),
      manufacturer: data.manufacturer.trim(),
      serialNumber: data.serialNumber.trim(),
      yearOfManufacture: data.yearOfManufacture.trim(),
      yearOfInstallation: data.yearOfInstallation.trim(),
      maxPerformance: data.maxPerformance,
      speedMeasureTech: data.speedMeasureTech,
      tenantId: data.tenantId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: MachineProps): Machine {
    return new Machine(data);
  }

  get id(): string {
    return this.props.id;
  }

  get operationalSector(): string {
    return this.props.operationalSector;
  }

  get name(): string {
    return this.props.name;
  }

  get manufacturer(): string {
    return this.props.manufacturer;
  }

  get serialNumber(): string {
    return this.props.serialNumber;
  }

  get yearOfManufacture(): string {
    return this.props.yearOfManufacture;
  }

  get yearOfInstallation(): string {
    return this.props.yearOfInstallation;
  }

  get maxPerformance(): number {
    return this.props.maxPerformance;
  }

  get speedMeasureTech(): SpeedMeasureTech {
    return this.props.speedMeasureTech;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  update(data: {
    operationalSector?: string | undefined;
    name?: string | undefined;
    manufacturer?: string | undefined;
    serialNumber?: string | undefined;
    yearOfManufacture?: string | undefined;
    yearOfInstallation?: string | undefined;
    maxPerformance?: number | undefined;
    speedMeasureTech?: SpeedMeasureTech | undefined;
  }): void {
    if (this.isDeleted) {
      throw new Error('Cannot update deleted machine');
    }

    if (data.operationalSector !== undefined) {
      if (
        !data.operationalSector ||
        data.operationalSector.trim().length === 0
      ) {
        throw new Error('Operational sector is required');
      }
      this.props.operationalSector = data.operationalSector.trim();
    }

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Machine name is required');
      }
      if (data.name.length > 100) {
        throw new Error('Machine name cannot exceed 100 characters');
      }
      this.props.name = data.name.trim();
    }

    if (data.manufacturer !== undefined) {
      if (!data.manufacturer || data.manufacturer.trim().length === 0) {
        throw new Error('Manufacturer is required');
      }
      this.props.manufacturer = data.manufacturer.trim();
    }

    if (data.serialNumber !== undefined) {
      if (!data.serialNumber || data.serialNumber.trim().length === 0) {
        throw new Error('Serial number is required');
      }
      this.props.serialNumber = data.serialNumber.trim();
    }

    if (data.yearOfManufacture !== undefined) {
      if (
        !data.yearOfManufacture ||
        data.yearOfManufacture.trim().length === 0
      ) {
        throw new Error('Year of manufacture is required');
      }
      this.props.yearOfManufacture = data.yearOfManufacture.trim();
    }

    if (data.yearOfInstallation !== undefined) {
      if (
        !data.yearOfInstallation ||
        data.yearOfInstallation.trim().length === 0
      ) {
        throw new Error('Year of installation is required');
      }
      this.props.yearOfInstallation = data.yearOfInstallation.trim();
    }

    if (data.maxPerformance !== undefined) {
      if (data.maxPerformance < 0) {
        throw new Error('Max performance must be a positive number');
      }
      this.props.maxPerformance = data.maxPerformance;
    }

    if (data.speedMeasureTech !== undefined) {
      if (!isValidSpeedMeasureTech(data.speedMeasureTech)) {
        throw new Error('Speed measure tech must be a valid measurement type');
      }
      this.props.speedMeasureTech = data.speedMeasureTech;
    }

    this.props.updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted) {
      throw new Error('Machine is already deleted');
    }

    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new Error('Machine is not deleted');
    }

    delete this.props.deletedAt;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): MachineProps {
    return { ...this.props };
  }
}
