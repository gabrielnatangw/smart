import {
  AuthenticationService,
  FirstLoginRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
} from '../../domain/services/AuthenticationService';
import { IAuthenticationRepository } from '../interfaces/IAuthenticationRepository';
import { IEmailService } from '../interfaces/IEmailService';

export class AuthenticationApplicationService {
  private readonly authService: AuthenticationService;

  constructor(
    authRepository: IAuthenticationRepository,
    emailService?: IEmailService
  ) {
    this.authService = new AuthenticationService(authRepository, emailService);
  }

  async login(request: LoginRequest): Promise<LoginResponse> {
    return await this.authService.login(request);
  }

  async refreshToken(
    request: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    return await this.authService.refreshToken(request);
  }

  async logout(userId: string): Promise<void> {
    return await this.authService.logout(userId);
  }

  async forgotPassword(request: ForgotPasswordRequest): Promise<string> {
    return await this.authService.forgotPassword(request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    return await this.authService.resetPassword(request);
  }

  async firstLogin(request: FirstLoginRequest): Promise<LoginResponse> {
    return await this.authService.firstLogin(request);
  }
}
