export interface ViewProps {
  id: string;
  name: string;
  isDefault: boolean;
  isPublic: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  tenantId: string;
  userId: string;
  createdBy: string;
  updatedBy: string;
}

export class View {
  private constructor(private props: ViewProps) {}

  static create(data: {
    id: string;
    name: string;
    isDefault?: boolean;
    isPublic?: boolean;
    isActive?: boolean;
    tenantId: string;
    userId: string;
    createdBy: string;
    updatedBy: string;
  }): View {
    const now = new Date();

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('View name is required');
    }

    if (data.name.length > 255) {
      throw new Error('View name cannot exceed 255 characters');
    }

    return new View({
      id: data.id,
      name: data.name.trim(),
      isDefault: data.isDefault ?? false,
      isPublic: data.isPublic ?? false,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      tenantId: data.tenantId,
      userId: data.userId,
      createdBy: data.createdBy,
      updatedBy: data.updatedBy,
    });
  }

  static fromPersistence(data: ViewProps): View {
    return new View(data);
  }

  update(data: {
    name?: string;
    isDefault?: boolean;
    isPublic?: boolean;
    isActive?: boolean;
    updatedBy: string;
  }): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('View name is required');
      }
      if (data.name.length > 255) {
        throw new Error('View name cannot exceed 255 characters');
      }
      this.props.name = data.name.trim();
    }

    if (data.isDefault !== undefined) {
      this.props.isDefault = data.isDefault;
    }

    if (data.isPublic !== undefined) {
      this.props.isPublic = data.isPublic;
    }

    if (data.isActive !== undefined) {
      this.props.isActive = data.isActive;
    }

    this.props.updatedBy = data.updatedBy;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
  }

  restore(): void {
    this.props.deletedAt = undefined;
    this.props.isActive = true;
  }

  // Getters
  get id(): string {
    return this.props.id;
  }
  get name(): string {
    return this.props.name;
  }
  get isDefault(): boolean {
    return this.props.isDefault;
  }
  get isPublic(): boolean {
    return this.props.isPublic;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }
  get deletedAt(): Date | undefined {
    return this.props.deletedAt;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get userId(): string {
    return this.props.userId;
  }
  get createdBy(): string {
    return this.props.createdBy;
  }
  get updatedBy(): string {
    return this.props.updatedBy;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined && this.props.deletedAt !== null;
  }
}
