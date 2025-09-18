import * as fs from 'fs';
import * as handlebars from 'handlebars';
import * as nodemailer from 'nodemailer';
import * as path from 'path';

import {
  IEmailService,
  SendEmailRequest,
} from '../../application/interfaces/IEmailService';

export class NodemailerEmailService implements IEmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;

  constructor() {
    this.fromEmail = process.env.EMAIL_FROM || 'smart.dev.one@groupwork.com.br';
    this.transporter = this.setupTransporter();
  }

  private setupTransporter(): nodemailer.Transporter {
    const isProduction = false; // Forçar desenvolvimento
    console.log(
      `📧 Email setup - NODE_ENV: ${process.env.NODE_ENV}, isProduction: ${isProduction}`
    );

    if (isProduction) {
      console.log('🔥 Using Gmail OAuth2 configuration');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_AUTH_USER,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
        },
      });
    } else {
      console.log('📨 Using Mailtrap configuration');
      return nodemailer.createTransport({
        host: process.env.MAILTRAP_HOST || 'sandbox.smtp.mailtrap.io',
        port: parseInt(process.env.MAILTRAP_PORT || '2525'),
        auth: {
          user: process.env.MAILTRAP_USER || '80f9278f0fefaf',
          pass: process.env.MAILTRAP_PASS || '493b533d93ced9',
        },
      });
    }
  }

  async sendEmail(request: SendEmailRequest): Promise<void> {
    try {
      const templatePath = path.join(
        __dirname,
        '../../views/emails',
        `${request.template}.hbs`
      );
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      const html = template(request.variables);

      const mailOptions = {
        from: this.fromEmail,
        to: request.to,
        subject: request.subject,
        html,
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${request.to}`);
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  async sendPasswordResetEmail(
    to: string,
    name: string,
    resetUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Recuperação de senha - Smart Backend',
      template: 'password-reset',
      variables: {
        name,
        resetUrl,
        supportEmail: this.fromEmail,
      },
    });
  }

  async sendFirstLoginEmail(
    to: string,
    name: string,
    activationUrl: string
  ): Promise<void> {
    await this.sendEmail({
      to,
      subject: 'Bem-vindo - Ative sua conta',
      template: 'first-login',
      variables: {
        name,
        activationUrl,
        supportEmail: this.fromEmail,
      },
    });
  }
}
