export interface TenantProps {
  id: string;
  name: string;
  cnpj?: string | undefined;
  address?: string | undefined;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
}

export class Tenant {
  private constructor(private props: TenantProps) {}

  static create(data: {
    id: string;
    name: string;
    cnpj?: string | undefined;
    address?: string | undefined;
    isActive?: boolean | undefined;
  }): Tenant {
    const now = new Date();

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }

    if (data.name.length > 100) {
      throw new Error('Tenant name cannot exceed 100 characters');
    }

    if (data.cnpj && !Tenant.isValidCNPJ(data.cnpj)) {
      throw new Error('Invalid CNPJ format');
    }

    return new Tenant({
      id: data.id,
      name: data.name.trim(),
      cnpj: data.cnpj ?? undefined,
      address: data.address ?? undefined,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });
  }

  static fromPersistence(data: TenantProps): Tenant {
    return new Tenant(data);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get cnpj(): string | undefined {
    return this.props.cnpj;
  }

  get address(): string | undefined {
    return this.props.address;
  }

  get isActive(): boolean {
    return this.props.isActive;
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

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('Tenant name is required');
    }

    if (name.length > 100) {
      throw new Error('Tenant name cannot exceed 100 characters');
    }

    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateCNPJ(cnpj?: string | undefined): void {
    if (cnpj && !Tenant.isValidCNPJ(cnpj)) {
      throw new Error('Invalid CNPJ format');
    }

    this.props.cnpj = cnpj ?? undefined;
    this.props.updatedAt = new Date();
  }

  updateAddress(address?: string | undefined): void {
    this.props.address = address ?? undefined;
    this.props.updatedAt = new Date();
  }

  activate(): void {
    this.props.isActive = true;
    this.props.updatedAt = new Date();
  }

  deactivate(): void {
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  toPlainObject(): TenantProps {
    return { ...this.props };
  }

  private static isValidCNPJ(cnpj: string): boolean {
    const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

    if (cleanCNPJ.length !== 14) {
      return false;
    }

    if (/^(\d)\1+$/.test(cleanCNPJ)) {
      return false;
    }

    let sum = 0;
    let weight = 5;

    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    if (parseInt(cleanCNPJ.charAt(12)) !== digit1) {
      return false;
    }

    sum = 0;
    weight = 6;

    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 2 ? 9 : weight - 1;
    }

    const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

    return parseInt(cleanCNPJ.charAt(13)) === digit2;
  }
}
