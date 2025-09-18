export interface TokenCodeEmailProps {
  id: string;
  token: string;
  code: string;
  userId: string;
  expiredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export class TokenCodeEmail {
  private constructor(private props: TokenCodeEmailProps) {}

  static create(data: {
    id: string;
    token: string;
    code: string;
    userId: string;
  }): TokenCodeEmail {
    const now = new Date();

    if (!data.token || data.token.trim().length === 0) {
      throw new Error('Token is required');
    }

    if (data.token.length > 100) {
      throw new Error('Token cannot exceed 100 characters');
    }

    if (!data.code || data.code.trim().length === 0) {
      throw new Error('Code is required');
    }

    if (data.code.length > 100) {
      throw new Error('Code cannot exceed 100 characters');
    }

    if (!data.userId) {
      throw new Error('User ID is required');
    }

    return new TokenCodeEmail({
      id: data.id,
      token: data.token.trim(),
      code: data.code.trim(),
      userId: data.userId,
      expiredAt: new Date(now.getTime() + 15 * 60 * 1000), // 15 minutes
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(data: TokenCodeEmailProps): TokenCodeEmail {
    return new TokenCodeEmail(data);
  }

  get id(): string {
    return this.props.id;
  }

  get token(): string {
    return this.props.token;
  }

  get code(): string {
    return this.props.code;
  }

  get userId(): string {
    return this.props.userId;
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

  get expiredAt(): Date | undefined {
    return this.props.expiredAt;
  }

  get isDeleted(): boolean {
    return this.props.deletedAt !== undefined;
  }

  get isExpired(): boolean {
    const now = new Date();
    const expirationTime =
      this.props.expiredAt ||
      new Date(this.props.createdAt.getTime() + 15 * 60 * 1000);
    return now > expirationTime;
  }

  isValidToken(token: string): boolean {
    return this.props.token === token && !this.isExpired && !this.isDeleted;
  }

  isValidCode(code: string): boolean {
    return this.props.code === code && !this.isExpired && !this.isDeleted;
  }

  delete(): void {
    this.props.deletedAt = new Date();
    this.props.updatedAt = new Date();
  }

  toPlainObject(): TokenCodeEmailProps {
    return { ...this.props };
  }
}
