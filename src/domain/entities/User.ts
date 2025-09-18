import * as bcrypt from 'bcryptjs';

export interface UserProps {
  id: string;
  name: string;
  email: string;
  password: string;
  userType: UserType;
  firstLogin: boolean;
  isActive: boolean;
  tenantId?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | undefined;
}

export enum UserType {
  ROOT = 'root',
  ADMIN = 'admin',
  USER = 'user',
}

export enum PermissionLevel {
  READ = 'read',
  WRITE = 'write',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface UserPermission {
  functionName: string;
  permissionLevel: PermissionLevel;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(data: {
    id: string;
    name: string;
    email: string;
    password: string;
    userType: UserType;
    tenantId?: string;
    firstLogin?: boolean | undefined;
    isActive?: boolean | undefined;
  }): User {
    const now = new Date();

    if (!data.name || data.name.trim().length === 0) {
      throw new Error('User name is required');
    }

    if (data.name.length > 100) {
      throw new Error('User name cannot exceed 100 characters');
    }

    if (!data.email || !User.isValidEmail(data.email)) {
      throw new Error('Valid email is required');
    }

    if (!data.password || data.password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    // Tenant ID é obrigatório apenas para admin e user, não para root
    if (data.userType !== UserType.ROOT && !data.tenantId) {
      throw new Error('Tenant ID is required for admin and user types');
    }

    const hashedPassword = bcrypt.hashSync(data.password, 10);

    return new User({
      id: data.id,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      password: hashedPassword,
      userType: data.userType,
      tenantId: data.tenantId,
      firstLogin: data.firstLogin ?? true,
      isActive: data.isActive ?? true,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
    });
  }

  static fromPersistence(data: UserProps): User {
    return new User(data);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get userType(): UserType {
    return this.props.userType;
  }

  get firstLogin(): boolean {
    return this.props.firstLogin;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get tenantId(): string | undefined {
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
    return this.props.deletedAt !== undefined && this.props.deletedAt !== null;
  }

  get isRoot(): boolean {
    return this.props.userType === UserType.ROOT;
  }

  get isAdmin(): boolean {
    return this.props.userType === UserType.ADMIN;
  }

  get isUser(): boolean {
    return this.props.userType === UserType.USER;
  }

  get canManageUsers(): boolean {
    return (
      this.props.userType === UserType.ROOT ||
      this.props.userType === UserType.ADMIN
    );
  }

  get canAccessAllTenants(): boolean {
    return this.props.userType === UserType.ROOT;
  }

  get canCreateRoot(): boolean {
    return this.props.userType === UserType.ROOT;
  }

  updateName(name: string): void {
    if (!name || name.trim().length === 0) {
      throw new Error('User name is required');
    }

    if (name.length > 100) {
      throw new Error('User name cannot exceed 100 characters');
    }

    this.props.name = name.trim();
    this.props.updatedAt = new Date();
  }

  updateEmail(email: string): void {
    if (!email || !User.isValidEmail(email)) {
      throw new Error('Valid email is required');
    }

    this.props.email = email.toLowerCase().trim();
    this.props.updatedAt = new Date();
  }

  updatePassword(newPassword: string): void {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    this.props.password = bcrypt.hashSync(newPassword, 10);
    this.props.updatedAt = new Date();
  }

  updateUserType(userType: UserType): void {
    this.props.userType = userType;
    this.props.updatedAt = new Date();
  }

  updateTenantId(tenantId: string | undefined): void {
    // Root não pode ter tenant
    if (this.props.userType === UserType.ROOT && tenantId) {
      throw new Error('Root users cannot be assigned to a tenant');
    }
    // Admin e User devem ter tenant
    if (
      (this.props.userType === UserType.ADMIN ||
        this.props.userType === UserType.USER) &&
      !tenantId
    ) {
      throw new Error('Admin and User types must have a tenant');
    }
    this.props.tenantId = tenantId;
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

  markFirstLoginComplete(): void {
    this.props.firstLogin = false;
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.isActive = false;
    this.props.updatedAt = new Date();
  }

  verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.props.password);
  }

  toPlainObject(): UserProps {
    return { ...this.props };
  }

  toSafeObject(): Omit<UserProps, 'password'> {
    const { password: _password, ...safeProps } = this.props;
    return safeProps;
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
