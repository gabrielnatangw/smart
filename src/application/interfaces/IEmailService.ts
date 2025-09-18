export interface SendEmailRequest {
  to: string;
  subject: string;
  template: string;
  variables: Record<string, any>;
}

export interface IEmailService {
  sendEmail(request: SendEmailRequest): Promise<void>;
  sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string
  ): Promise<void>;
  sendFirstLoginEmail(
    to: string,
    name: string,
    activationUrl: string
  ): Promise<void>;
}
