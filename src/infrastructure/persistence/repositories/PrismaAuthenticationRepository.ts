import { PrismaClient } from '@prisma/client';

import { IAuthenticationRepository } from '../../../application/interfaces/IAuthenticationRepository';
import { RefreshToken } from '../../../domain/entities/RefreshToken';
import { TokenCodeEmail } from '../../../domain/entities/TokenCodeEmail';
import { User, UserProps, UserType } from '../../../domain/entities/User';

export class PrismaAuthenticationRepository
  implements IAuthenticationRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async findUserByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deleted_at: null,
        is_active: true,
      },
    });

    if (!userData) {
      return null;
    }

    return User.fromPersistence(this.mapPrismaUserToUserProps(userData));
  }

  async findUserById(userId: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!userData || userData.deleted_at) {
      return null;
    }

    return User.fromPersistence(this.mapPrismaUserToUserProps(userData));
  }

  async createTokenCodeEmail(tokenCodeEmail: TokenCodeEmail): Promise<void> {
    await this.prisma.tokenCodeEmail.create({
      data: {
        token_code_email_id: tokenCodeEmail.id,
        token: tokenCodeEmail.token,
        code: tokenCodeEmail.code,
        user_id: tokenCodeEmail.userId,
        expired_at:
          tokenCodeEmail.expiredAt || new Date(Date.now() + 15 * 60 * 1000),
      },
    });
  }

  async findTokenCodeEmailByToken(
    token: string
  ): Promise<TokenCodeEmail | null> {
    const tokenData = await this.prisma.tokenCodeEmail.findFirst({
      where: {
        token,
        deleted_at: null,
        expired_at: {
          gt: new Date(),
        },
      },
    });

    if (!tokenData) {
      return null;
    }

    return TokenCodeEmail.fromPersistence({
      id: tokenData.token_code_email_id,
      token: tokenData.token,
      code: tokenData.code,
      userId: tokenData.user_id || '',
      expiredAt: tokenData.expired_at,
      createdAt: tokenData.created_at,
      updatedAt: tokenData.updated_at || tokenData.created_at,
      ...(tokenData.deleted_at && { deletedAt: tokenData.deleted_at }),
    });
  }

  async findTokenCodeEmailByUserId(
    userId: string
  ): Promise<TokenCodeEmail | null> {
    const tokenData = await this.prisma.tokenCodeEmail.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
        expired_at: {
          gt: new Date(),
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!tokenData) {
      return null;
    }

    return TokenCodeEmail.fromPersistence({
      id: tokenData.token_code_email_id,
      token: tokenData.token,
      code: tokenData.code,
      userId: tokenData.user_id || '',
      expiredAt: tokenData.expired_at,
      createdAt: tokenData.created_at,
      updatedAt: tokenData.updated_at || tokenData.created_at,
      ...(tokenData.deleted_at && { deletedAt: tokenData.deleted_at }),
    });
  }

  async deleteTokenCodeEmail(tokenCodeEmailId: string): Promise<void> {
    await this.prisma.tokenCodeEmail.update({
      where: {
        token_code_email_id: tokenCodeEmailId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async deleteAllTokenCodeEmailsByUserId(userId: string): Promise<void> {
    await this.prisma.tokenCodeEmail.updateMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async createRefreshToken(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        refresh_token_id: refreshToken.id,
        refresh_token: refreshToken.refreshToken,
        user_id: refreshToken.userId,
        expires_in: refreshToken.expiresIn || 30 * 24 * 60 * 60 * 1000,
      },
    });
  }

  async findRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    const refreshTokenData = await this.prisma.refreshToken.findFirst({
      where: {
        refresh_token: token,
        deleted_at: null,
      },
    });

    if (!refreshTokenData) {
      return null;
    }

    return RefreshToken.fromPersistence({
      id: refreshTokenData.refresh_token_id,
      refreshToken: refreshTokenData.refresh_token,
      userId: refreshTokenData.user_id || '',
      expiresIn: refreshTokenData.expires_in,
      createdAt: refreshTokenData.created_at,
      updatedAt: refreshTokenData.updated_at || refreshTokenData.created_at,
      ...(refreshTokenData.deleted_at && {
        deletedAt: refreshTokenData.deleted_at,
      }),
    });
  }

  async findRefreshTokenByUserId(userId: string): Promise<RefreshToken | null> {
    const refreshTokenData = await this.prisma.refreshToken.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (!refreshTokenData) {
      return null;
    }

    return RefreshToken.fromPersistence({
      id: refreshTokenData.refresh_token_id,
      refreshToken: refreshTokenData.refresh_token,
      userId: refreshTokenData.user_id || '',
      expiresIn: refreshTokenData.expires_in,
      createdAt: refreshTokenData.created_at,
      updatedAt: refreshTokenData.updated_at || refreshTokenData.created_at,
      ...(refreshTokenData.deleted_at && {
        deletedAt: refreshTokenData.deleted_at,
      }),
    });
  }

  async updateRefreshToken(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        refresh_token_id: refreshToken.id,
      },
      data: {
        refresh_token: refreshToken.refreshToken,
        updated_at: new Date(),
      },
    });
  }

  async deleteRefreshToken(refreshTokenId: string): Promise<void> {
    await this.prisma.refreshToken.update({
      where: {
        refresh_token_id: refreshTokenId,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async deleteAllRefreshTokensByUserId(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      data: {
        deleted_at: new Date(),
      },
    });
  }

  async updateUserFirstLogin(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        first_login: false,
        updated_at: new Date(),
      },
    });
  }

  async updateUserPassword(
    userId: string,
    hashedPassword: string
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        password: hashedPassword,
        first_login: false,
        updated_at: new Date(),
      },
    });
  }

  private mapPrismaUserToUserProps(userData: any): UserProps {
    return {
      id: userData.user_id,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      userType: userData.user_type as UserType,
      firstLogin: userData.first_login,
      isActive: userData.is_active,
      tenantId: userData.tenant_id || undefined,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at || userData.created_at,
      deletedAt: userData.deleted_at || undefined,
    };
  }
}
