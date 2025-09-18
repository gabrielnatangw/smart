export interface ModuleProps {
  id: string;
  customer: string;
  country: string;
  city: string;
  blueprint: string;
  sector: string;
  machineName: string;
  tenantId: string;
  machineId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class Module {
  private constructor(private props: ModuleProps) {}

  static create(data: {
    id: string;
    customer: string;
    country: string;
    city: string;
    blueprint: string;
    sector: string;
    machineName: string;
    tenantId: string;
    machineId?: string | undefined;
  }): Module {
    const now = new Date();

    if (!data.customer || data.customer.trim().length === 0) {
      throw new Error('Customer is required');
    }

    if (data.customer.length > 100) {
      throw new Error('Customer name cannot exceed 100 characters');
    }

    if (!data.country || data.country.trim().length === 0) {
      throw new Error('Country is required');
    }

    if (data.country.length > 100) {
      throw new Error('Country name cannot exceed 100 characters');
    }

    if (!data.city || data.city.trim().length === 0) {
      throw new Error('City is required');
    }

    if (data.city.length > 100) {
      throw new Error('City name cannot exceed 100 characters');
    }

    if (!data.blueprint || data.blueprint.trim().length === 0) {
      throw new Error('Blueprint is required');
    }

    if (data.blueprint.length > 200) {
      throw new Error('Blueprint cannot exceed 200 characters');
    }

    if (!data.sector || data.sector.trim().length === 0) {
      throw new Error('Sector is required');
    }

    if (data.sector.length > 100) {
      throw new Error('Sector cannot exceed 100 characters');
    }

    if (!data.machineName || data.machineName.trim().length === 0) {
      throw new Error('Machine name is required');
    }

    if (data.machineName.length > 100) {
      throw new Error('Machine name cannot exceed 100 characters');
    }

    if (!data.tenantId) {
      throw new Error('Tenant ID is required');
    }

    return new Module({
      id: data.id,
      customer: data.customer.trim(),
      country: data.country.trim(),
      city: data.city.trim(),
      blueprint: data.blueprint.trim(),
      sector: data.sector.trim(),
      machineName: data.machineName.trim(),
      tenantId: data.tenantId,
      machineId: data.machineId,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: ModuleProps): Module {
    return new Module(data);
  }

  get id(): string {
    return this.props.id;
  }

  get customer(): string {
    return this.props.customer;
  }

  get country(): string {
    return this.props.country;
  }

  get city(): string {
    return this.props.city;
  }

  get blueprint(): string {
    return this.props.blueprint;
  }

  get sector(): string {
    return this.props.sector;
  }

  get machineName(): string {
    return this.props.machineName;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get machineId(): string | undefined {
    return this.props.machineId;
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
    customer?: string | undefined;
    country?: string | undefined;
    city?: string | undefined;
    blueprint?: string | undefined;
    sector?: string | undefined;
    machineName?: string | undefined;
    machineId?: string | undefined;
  }): void {
    if (this.isDeleted) {
      throw new Error('Cannot update deleted module');
    }

    if (data.customer !== undefined) {
      if (!data.customer || data.customer.trim().length === 0) {
        throw new Error('Customer is required');
      }
      if (data.customer.length > 100) {
        throw new Error('Customer name cannot exceed 100 characters');
      }
      this.props.customer = data.customer.trim();
    }

    if (data.country !== undefined) {
      if (!data.country || data.country.trim().length === 0) {
        throw new Error('Country is required');
      }
      if (data.country.length > 100) {
        throw new Error('Country name cannot exceed 100 characters');
      }
      this.props.country = data.country.trim();
    }

    if (data.city !== undefined) {
      if (!data.city || data.city.trim().length === 0) {
        throw new Error('City is required');
      }
      if (data.city.length > 100) {
        throw new Error('City name cannot exceed 100 characters');
      }
      this.props.city = data.city.trim();
    }

    if (data.blueprint !== undefined) {
      if (!data.blueprint || data.blueprint.trim().length === 0) {
        throw new Error('Blueprint is required');
      }
      if (data.blueprint.length > 200) {
        throw new Error('Blueprint cannot exceed 200 characters');
      }
      this.props.blueprint = data.blueprint.trim();
    }

    if (data.sector !== undefined) {
      if (!data.sector || data.sector.trim().length === 0) {
        throw new Error('Sector is required');
      }
      if (data.sector.length > 100) {
        throw new Error('Sector cannot exceed 100 characters');
      }
      this.props.sector = data.sector.trim();
    }

    if (data.machineName !== undefined) {
      if (!data.machineName || data.machineName.trim().length === 0) {
        throw new Error('Machine name is required');
      }
      if (data.machineName.length > 100) {
        throw new Error('Machine name cannot exceed 100 characters');
      }
      this.props.machineName = data.machineName.trim();
    }

    if (data.machineId !== undefined) {
      this.props.machineId = data.machineId;
    }

    this.props.updatedAt = new Date();
  }

  assignToMachine(machineId: string): void {
    if (this.isDeleted) {
      throw new Error('Cannot assign deleted module to machine');
    }

    if (!machineId) {
      throw new Error('Machine ID is required');
    }

    this.props.machineId = machineId;
    this.props.updatedAt = new Date();
  }

  unassignFromMachine(): void {
    if (this.isDeleted) {
      throw new Error('Cannot unassign deleted module from machine');
    }

    delete this.props.machineId;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    if (this.isDeleted) {
      throw new Error('Module is already deleted');
    }

    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  restore(): void {
    if (!this.isDeleted) {
      throw new Error('Module is not deleted');
    }

    delete this.props.deletedAt;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): ModuleProps {
    return { ...this.props };
  }
}
