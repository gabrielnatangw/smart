export interface RefreshTokenProps {
  id: string;
  refreshToken: string;
  userId: string;
  expiresIn?: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class RefreshToken {
  private constructor(private props: RefreshTokenProps) {}

  static create(data: {
    id: string;
    refreshToken: string;
    userId: string;
    expiresIn?: number;
  }): RefreshToken {
    const now = new Date();

    if (!data.refreshToken || data.refreshToken.trim().length === 0) {
      throw new Error('Refresh token is required');
    }

    if (data.refreshToken.length > 500) {
      throw new Error('Refresh token cannot exceed 500 characters');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    return new RefreshToken({
      id: data.id,
      refreshToken: data.refreshToken.trim(),
      userId: data.userId,
      expiresIn: data.expiresIn || 30 * 24 * 60 * 60 * 1000,
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: RefreshTokenProps): RefreshToken {
    return new RefreshToken(data);
  }

  get id(): string {
    return this.props.id;
  }

  get refreshToken(): string {
    return this.props.refreshToken;
  }

  get userId(): string {
    return this.props.userId;
  }

  get expiresIn(): number | undefined {
    return this.props.expiresIn;
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

  get isExpired(): boolean {
    const now = new Date();
    const expiresInMs = this.props.expiresIn || 30 * 24 * 60 * 60 * 1000;
    const expirationTime = new Date(
      this.props.createdAt.getTime() + expiresInMs
    );
    return now > expirationTime;
  }

  isValid(): boolean {
    return !this.isExpired && !this.isDeleted;
  }

  updateToken(newToken: string): void {
    if (!newToken || newToken.trim().length === 0) {
      throw new Error('Refresh token is required');
    }

    if (newToken.length > 500) {
      throw new Error('Refresh token cannot exceed 500 characters');
    }

    this.props.refreshToken = newToken.trim();
    this.props.updatedAt = new Date();
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toPlainObject(): RefreshTokenProps {
    return { ...this.props };
  }
}
