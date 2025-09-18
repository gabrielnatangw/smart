import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';

import { IAuthenticationRepository } from '../../application/interfaces/IAuthenticationRepository';
import { IEmailService } from '../../application/interfaces/IEmailService';
import { RefreshToken } from '../entities/RefreshToken';
import { TokenCodeEmail } from '../entities/TokenCodeEmail';
import { User } from '../entities/User';
import { JwtTokenService } from './JwtTokenService';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
  firstLogin: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface FirstLoginRequest {
  token: string;
  newPassword: string;
}

export interface LoginAttempt {
  email: string;
  attempts: number;
  lastAttempt: Date;
  blockedUntil?: Date;
}

export class AuthenticationService {
  private readonly jwtService: JwtTokenService;
  private readonly loginAttempts = new Map<string, LoginAttempt>();
  private readonly maxLoginAttempts = 5;
  private readonly blockDuration = 15 * 60 * 1000; // 15 minutes

  constructor(
    private readonly authRepository: IAuthenticationRepository,
    private readonly emailService?: IEmailService
  ) {
    this.jwtService = new JwtTokenService();
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    await this.validateLoginAttempts(request.email);
    const user = await this.authRepository.findUserByEmail(request.email);
    if (!user || !user.verifyPassword(request.password)) {
      await this.recordFailedLogin(request.email);
      throw new Error('INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new Error('USER_INACTIVE');
    }

    if (user.isDeleted) {
      throw new Error('USER_NOT_FOUND');
    }

    // Clear login attempts on successful login
    this.loginAttempts.delete(request.email);

    // Generate JWT tokens
    const tokenPair = this.jwtService.generateTokenPair(user);

    // Store or update refresh token
    await this.storeRefreshToken(user.id, tokenPair.refreshToken);

    return {
      user: user.toSafeObject() as any,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      firstLogin: user.firstLogin,
    };
  }

  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const payload = this.jwtService.verifyRefreshToken(request.refreshToken);

    const storedRefreshToken =
      await this.authRepository.findRefreshTokenByToken(request.refreshToken);
    if (!storedRefreshToken || !storedRefreshToken.isValid()) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    const user = await this.authRepository.findUserById(payload.userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new Error('USER_NOT_FOUND');
    }

    // Generate new token pair
    const tokenPair = this.jwtService.generateTokenPair(user);

    // Update stored refresh token
    storedRefreshToken.updateToken(tokenPair.refreshToken);
    await this.authRepository.updateRefreshToken(storedRefreshToken);

    return {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
    };
  }

  async logout(userId: string): Promise<void> {
    await this.authRepository.deleteAllRefreshTokensByUserId(userId);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<string> {
    const user = await this.authRepository.findUserByEmail(request.email);
    if (!user || !user.isActive || user.isDeleted) {
      // Don't reveal if user exists for security
      return 'If the email exists, a reset link has been sent.';
    }

    // Delete all existing token code emails for this user (hard delete)
    await this.authRepository.deleteAllTokenCodeEmailsByUserId(user.id);

    // Generate secure token and code
    const token = crypto.randomBytes(32).toString('hex');
    const code = crypto.randomInt(100000, 999999).toString();

    const tokenCodeEmail = TokenCodeEmail.create({
      id: uuidv4(),
      token,
      code,
      userId: user.id,
    });

    await this.authRepository.createTokenCodeEmail(tokenCodeEmail);

    // Send reset password email if email service is available
    if (this.emailService) {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      try {
        await this.emailService.sendPasswordResetEmail(
          user.email,
          user.name,
          resetUrl
        );
        return 'If the email exists, a reset link has been sent.';
      } catch (error) {
        console.error('Failed to send reset email:', error);
        // Continue execution - don't fail the request if email fails
      }
    }

    // For development/testing: return the token
    return token;
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const tokenCodeEmail = await this.authRepository.findTokenCodeEmailByToken(
      request.token
    );

    if (!tokenCodeEmail || !tokenCodeEmail.isValidToken(request.token)) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    const hashedPassword = bcrypt.hashSync(request.newPassword, 10);
    await this.authRepository.updateUserPassword(
      tokenCodeEmail.userId,
      hashedPassword
    );

    // Delete the used token
    await this.authRepository.deleteTokenCodeEmail(tokenCodeEmail.id);

    // Logout user from all devices
    await this.authRepository.deleteAllRefreshTokensByUserId(
      tokenCodeEmail.userId
    );
  }

  async firstLogin(request: FirstLoginRequest): Promise<LoginResponse> {
    const tokenCodeEmail = await this.authRepository.findTokenCodeEmailByToken(
      request.token
    );

    if (!tokenCodeEmail || !tokenCodeEmail.isValidToken(request.token)) {
      throw new Error('INVALID_OR_EXPIRED_TOKEN');
    }

    const user = await this.authRepository.findUserById(tokenCodeEmail.userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new Error('USER_NOT_FOUND');
    }

    if (!user.firstLogin) {
      throw new Error('USER_ALREADY_ACTIVATED');
    }

    // Update password and mark first login as complete
    const hashedPassword = bcrypt.hashSync(request.newPassword, 10);
    await this.authRepository.updateUserPassword(user.id, hashedPassword);
    await this.authRepository.updateUserFirstLogin(user.id);

    // Delete the used token
    await this.authRepository.deleteTokenCodeEmail(tokenCodeEmail.id);

    // Update user object
    user.updatePassword(request.newPassword);
    user.markFirstLoginComplete();

    // Generate JWT tokens
    const tokenPair = this.jwtService.generateTokenPair(user);

    // Store refresh token
    await this.storeRefreshToken(user.id, tokenPair.refreshToken);

    return {
      user: user.toSafeObject() as any,
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      firstLogin: false,
    };
  }

  async validateAccessToken(token: string): Promise<User> {
    const payload = this.jwtService.verifyAccessToken(token);

    const user = await this.authRepository.findUserById(payload.userId);
    if (!user || !user.isActive || user.isDeleted) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  private async storeRefreshToken(
    userId: string,
    refreshTokenString: string
  ): Promise<void> {
    // Delete all existing refresh tokens for this user
    await this.authRepository.deleteAllRefreshTokensByUserId(userId);

    // Create new refresh token
    const refreshToken = RefreshToken.create({
      id: uuidv4(),
      refreshToken: refreshTokenString,
      userId,
    });

    await this.authRepository.createRefreshToken(refreshToken);
  }

  private async validateLoginAttempts(email: string): Promise<void> {
    const attempt = this.loginAttempts.get(email);

    if (attempt && attempt.blockedUntil && attempt.blockedUntil > new Date()) {
      const remainingTime = Math.ceil(
        (attempt.blockedUntil.getTime() - Date.now()) / 1000 / 60
      );
      throw new Error(`ACCOUNT_BLOCKED_${remainingTime}_MINUTES`);
    }
  }

  private async recordFailedLogin(email: string): Promise<void> {
    const now = new Date();
    const attempt = this.loginAttempts.get(email);

    if (!attempt) {
      this.loginAttempts.set(email, {
        email,
        attempts: 1,
        lastAttempt: now,
      });
      return;
    }

    attempt.attempts += 1;
    attempt.lastAttempt = now;

    if (attempt.attempts >= this.maxLoginAttempts) {
      attempt.blockedUntil = new Date(now.getTime() + this.blockDuration);
    }

    this.loginAttempts.set(email, attempt);
  }
}
