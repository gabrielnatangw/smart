interface RoleProps {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

interface CreateRoleProps {
  id: string;
  name: string;
  description: string;
  tenantId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export class Role {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly tenantId: string;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt?: Date;
  public readonly deletedAt?: Date;

  constructor(props: RoleProps) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.tenantId = props.tenantId;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt as any;
    this.deletedAt = props.deletedAt as any;
  }

  static create(props: Omit<CreateRoleProps, 'id' | 'createdAt'>): Role {
    return new Role({
      id: crypto.randomUUID(),
      createdAt: new Date(),
      ...props,
    });
  }

  static fromPersistence(props: CreateRoleProps): Role {
    return new Role(props);
  }

  get isDeleted(): boolean {
    return this.deletedAt !== undefined && this.deletedAt !== null;
  }

  update(data: {
    name?: string;
    description?: string;
    isActive?: boolean;
  }): Role {
    const props: RoleProps = {
      id: this.id,
      name: data.name ?? this.name,
      description: data.description ?? this.description,
      tenantId: this.tenantId,
      isActive: data.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };

    if (this.deletedAt !== undefined) {
      props.deletedAt = this.deletedAt;
    }

    return new Role(props);
  }

  delete(): Role {
    const props: RoleProps = {
      id: this.id,
      name: this.name,
      description: this.description,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
      deletedAt: new Date(),
    };

    return new Role(props);
  }

  restore(): Role {
    const props: RoleProps = {
      id: this.id,
      name: this.name,
      description: this.description,
      tenantId: this.tenantId,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    };

    return new Role(props);
  }
}
