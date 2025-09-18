export interface PermissionProps {
  id: string;
  functionName: string;
  permissionLevel: string;
  displayName: string;
  description?: string;
  applicationId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
}

export class Permission {
  private constructor(private props: PermissionProps) {}

  static create(data: {
    id: string;
    functionName: string;
    permissionLevel: string;
    displayName: string;
    description?: string;
    applicationId: string;
  }): Permission {
    const now = new Date();

    if (!data.functionName || data.functionName.trim().length === 0) {
      throw new Error('Function name is required');
    }

    if (!data.permissionLevel || data.permissionLevel.trim().length === 0) {
      throw new Error('Permission level is required');
    }

    if (!data.displayName || data.displayName.trim().length === 0) {
      throw new Error('Display name is required');
    }

    if (!data.applicationId) {
      throw new Error('Application ID is required');
    }

    // Validar se o nível de permissão é válido
    const validLevels = Object.values(PermissionLevel);
    if (!validLevels.includes(data.permissionLevel as PermissionLevel)) {
      throw new Error(
        `Invalid permission level. Must be one of: ${validLevels.join(', ')}`
      );
    }

    return new Permission({
      id: data.id,
      functionName: data.functionName.trim().toLowerCase(),
      permissionLevel: data.permissionLevel.trim().toLowerCase(),
      displayName: data.displayName.trim(),
      description: data.description?.trim(),
      applicationId: data.applicationId,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });
  }

  static fromPersistence(data: PermissionProps): Permission {
    return new Permission(data);
  }

  get id(): string {
    return this.props.id;
  }

  get functionName(): string {
    return this.props.functionName;
  }

  get permissionLevel(): string {
    return this.props.permissionLevel;
  }

  get displayName(): string {
    return this.props.displayName;
  }

  get description(): string | undefined {
    return this.props.description;
  }

  get applicationId(): string {
    return this.props.applicationId;
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
    return this.props.deletedAt !== undefined && this.props.deletedAt !== null;
  }

  updateDisplayName(displayName: string): void {
    if (!displayName || displayName.trim().length === 0) {
      throw new Error('Display name is required');
    }

    this.props.displayName = displayName.trim();
    this.props.updatedAt = new Date();
  }

  updateDescription(description: string | undefined): void {
    this.props.description = description?.trim();
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toPlainObject(): PermissionProps {
    return { ...this.props };
  }

  toSafeObject(): Omit<PermissionProps, 'deletedAt'> {
    const { deletedAt: _deletedAt, ...safeProps } = this.props;
    return safeProps;
  }

  // Método para verificar se a permissão é para uma função específica
  isForFunction(functionName: string): boolean {
    return this.props.functionName === functionName.toLowerCase();
  }

  // Método para verificar se a permissão é de um nível específico
  isLevel(level: PermissionLevel): boolean {
    return this.props.permissionLevel === level;
  }

  // Método para obter a chave única da permissão
  getUniqueKey(): string {
    return `${this.props.functionName}:${this.props.permissionLevel}`;
  }
}
