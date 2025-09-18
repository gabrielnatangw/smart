import { RefreshToken } from '../../domain/entities/RefreshToken';
import { TokenCodeEmail } from '../../domain/entities/TokenCodeEmail';
import { User } from '../../domain/entities/User';

export interface IAuthenticationRepository {
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(userId: string): Promise<User | null>;
  createTokenCodeEmail(tokenCodeEmail: TokenCodeEmail): Promise<void>;
  findTokenCodeEmailByToken(token: string): Promise<TokenCodeEmail | null>;
  findTokenCodeEmailByUserId(userId: string): Promise<TokenCodeEmail | null>;
  deleteTokenCodeEmail(tokenCodeEmailId: string): Promise<void>;
  deleteAllTokenCodeEmailsByUserId(userId: string): Promise<void>;
  createRefreshToken(refreshToken: RefreshToken): Promise<void>;
  findRefreshTokenByToken(token: string): Promise<RefreshToken | null>;
  findRefreshTokenByUserId(userId: string): Promise<RefreshToken | null>;
  updateRefreshToken(refreshToken: RefreshToken): Promise<void>;
  deleteRefreshToken(refreshTokenId: string): Promise<void>;
  deleteAllRefreshTokensByUserId(userId: string): Promise<void>;
  updateUserFirstLogin(userId: string): Promise<void>;
  updateUserPassword(userId: string, hashedPassword: string): Promise<void>;
}
