interface UserRoleProps {
  userId: string;
  roleId: string;
}

interface CreateUserRoleProps {
  userId: string;
  roleId: string;
}

export class UserRole {
  public readonly userId: string;
  public readonly roleId: string;

  constructor(props: UserRoleProps) {
    this.userId = props.userId;
    this.roleId = props.roleId;
  }

  static create(props: CreateUserRoleProps): UserRole {
    return new UserRole(props);
  }

  static fromPersistence(props: CreateUserRoleProps): UserRole {
    return new UserRole(props);
  }

  equals(other: UserRole): boolean {
    return this.userId === other.userId && this.roleId === other.roleId;
  }
}
