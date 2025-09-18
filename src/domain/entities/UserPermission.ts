export interface UserPermissionProps {
  id: string;
  userId: string;
  permissionId: string;
  granted: boolean;
  grantedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class UserPermission {
  private constructor(private props: UserPermissionProps) {}

  static create(data: {
    id: string;
    userId: string;
    permissionId: string;
    granted?: boolean;
    grantedBy?: string;
  }): UserPermission {
    const now = new Date();

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    if (!data.permissionId) {
      throw new Error('Permission ID is required');
    }

    return new UserPermission({
      id: data.id,
      userId: data.userId,
      permissionId: data.permissionId,
      granted: data.granted ?? true,
      grantedBy: data.grantedBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });
  }

  static fromPersistence(data: UserPermissionProps): UserPermission {
    return new UserPermission(data);
  }

  get id(): string {
    return this.props.id;
  }

  get userId(): string {
    return this.props.userId;
  }

  get permissionId(): string {
    return this.props.permissionId;
  }

  get granted(): boolean {
    return this.props.granted;
  }

  get grantedBy(): string | undefined {
    return this.props.grantedBy;
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

  grant(grantedBy?: string): void {
    this.props.granted = true;
    this.props.grantedBy = grantedBy;
    this.props.updatedAt = new Date();
  }

  revoke(): void {
    this.props.granted = false;
    this.props.grantedBy = undefined;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toPlainObject(): UserPermissionProps {
    return { ...this.props };
  }

  toSafeObject(): Omit<UserPermissionProps, 'deletedAt'> {
    const { deletedAt: _deletedAt, ...safeProps } = this.props;
    return safeProps;
  }
}
