export interface AuditLogProps {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AuditLog {
  private constructor(private props: AuditLogProps) {}

  static create(
    props: Omit<AuditLogProps, 'id' | 'createdAt' | 'updatedAt'>
  ): AuditLog {
    const now = new Date();
    return new AuditLog({
      ...props,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(props: AuditLogProps): AuditLog {
    return new AuditLog(props);
  }

  get id(): string {
    return this.props.id;
  }

  get action(): string {
    return this.props.action;
  }

  get resource(): string {
    return this.props.resource;
  }

  get resourceId(): string | undefined {
    return this.props.resourceId;
  }

  get userId(): string {
    return this.props.userId;
  }

  get userEmail(): string {
    return this.props.userEmail;
  }

  get tenantId(): string {
    return this.props.tenantId;
  }

  get ipAddress(): string | undefined {
    return this.props.ipAddress;
  }

  get userAgent(): string | undefined {
    return this.props.userAgent;
  }

  get details(): Record<string, any> | undefined {
    return this.props.details;
  }

  get oldValues(): Record<string, any> | undefined {
    return this.props.oldValues;
  }

  get newValues(): Record<string, any> | undefined {
    return this.props.newValues;
  }

  get timestamp(): Date {
    return this.props.timestamp;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  toPersistence(): AuditLogProps {
    return { ...this.props };
  }
}
