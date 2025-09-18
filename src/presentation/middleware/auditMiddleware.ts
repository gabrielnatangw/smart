import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { AuditLogApplicationService } from '../../application/services/AuditLogApplicationService';
import { PrismaAuditLogRepository } from '../../infrastructure/persistence/repositories/PrismaAuditLogRepository';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    tenantId: string;
    userType: string;
  };
}

interface AuditConfig {
  enabled: boolean;
  logReads: boolean;
  logCreates: boolean;
  logUpdates: boolean;
  logDeletes: boolean;
  logLogins: boolean;
  sensitiveFields: string[];
}

export class AuditMiddleware {
  private auditService: AuditLogApplicationService;
  private config: AuditConfig;

  constructor() {
    const prisma = new PrismaClient();
    const auditRepository = new PrismaAuditLogRepository(prisma);
    this.auditService = new AuditLogApplicationService(auditRepository);

    this.config = {
      enabled: true,
      logReads: false, // Desabilitado por padrão para evitar spam
      logCreates: true,
      logUpdates: true,
      logDeletes: true,
      logLogins: true,
      sensitiveFields: ['password', 'token', 'secret', 'key', 'hash'],
    };
  }

  // Middleware para capturar automaticamente logs de auditoria
  auditAction = (
    action: string,
    resource: string,
    options: {
      logReads?: boolean;
      captureBody?: boolean;
      captureQuery?: boolean;
      customDetails?: Record<string, any>;
    } = {}
  ) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      if (!this.config.enabled) {
        return next();
      }

      // Verificar se deve logar esta ação
      if (action === 'READ' && !(options.logReads || this.config.logReads)) {
        return next();
      }

      const originalSend = res.send;
      let _responseBody: any;

      // Interceptar resposta para capturar dados
      res.send = function (body: any) {
        _responseBody = body;
        return originalSend.call(this, body);
      };

      res.on('finish', async () => {
        try {
          // Só logar se a requisição foi bem-sucedida
          if (res.statusCode >= 200 && res.statusCode < 300) {
            await this.logRequest(
              req,
              res,
              action,
              resource,
              options,
              _responseBody
            );
          }
        } catch (error) {
          console.error('Erro ao registrar log de auditoria:', error);
        }
      });

      next();
    };
  };

  // Middleware específico para login
  auditLogin = () => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      if (!this.config.enabled || !this.config.logLogins) {
        return next();
      }

      const originalSend = res.send;
      let _responseBody: any;

      res.send = function (body: any) {
        _responseBody = body;
        return originalSend.call(this, body);
      };

      res.on('finish', async () => {
        try {
          const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
          const action = isSuccess ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED';

          await this.logRequest(req, res, action, 'AUTH', {
            logReads: true,
            captureBody: false,
            customDetails: {
              success: isSuccess,
              statusCode: res.statusCode,
              ...(_responseBody && typeof _responseBody === 'object'
                ? {
                    message: _responseBody.message || _responseBody.error,
                  }
                : {}),
            },
          });
        } catch (error) {
          console.error('Erro ao registrar log de login:', error);
        }
      });

      next();
    };
  };

  // Middleware para capturar mudanças em entidades
  auditEntityChange = (
    resource: string,
    options: {
      captureOldValues?: boolean;
      captureNewValues?: boolean;
      customDetails?: Record<string, any>;
    } = {}
  ) => {
    return async (
      req: AuthenticatedRequest,
      res: Response,
      next: NextFunction
    ) => {
      if (!this.config.enabled) {
        return next();
      }

      const originalSend = res.send;
      let _responseBody: any;
      let oldValues: Record<string, any> | undefined;

      // Capturar valores antigos para operações de UPDATE
      if (req.method === 'PUT' || req.method === 'PATCH') {
        try {
          // Aqui você pode implementar lógica para buscar valores antigos
          // Por enquanto, vamos deixar undefined
          oldValues = undefined;
        } catch (error) {
          console.error('Erro ao capturar valores antigos:', error);
        }
      }

      res.send = function (body: any) {
        _responseBody = body;
        return originalSend.call(this, body);
      };

      res.on('finish', async () => {
        try {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            const action = this.getActionFromMethod(req.method);
            const newValues = this.sanitizeData(
              req.body,
              options.captureNewValues
            );

            await this.logRequest(req, res, action, resource, {
              captureBody: false,
              customDetails: {
                ...options.customDetails,
                oldValues: options.captureOldValues ? oldValues : undefined,
                newValues: options.captureNewValues ? newValues : undefined,
              },
            });
          }
        } catch (error) {
          console.error('Erro ao registrar log de mudança de entidade:', error);
        }
      });

      next();
    };
  };

  private async logRequest(
    req: AuthenticatedRequest,
    res: Response,
    action: string,
    resource: string,
    options: {
      logReads?: boolean;
      captureBody?: boolean;
      captureQuery?: boolean;
      customDetails?: Record<string, any>;
    },
    _responseBody?: any
  ) {
    const user = req.user;
    if (!user) {
      return; // Não logar se não há usuário autenticado
    }

    const details: Record<string, any> = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      ...options.customDetails,
    };

    if (options.captureQuery && Object.keys(req.query).length > 0) {
      details.query = req.query;
    }

    if (options.captureBody && req.body && Object.keys(req.body).length > 0) {
      details.requestBody = this.sanitizeData(req.body);
    }

    if (_responseBody && typeof _responseBody === 'object') {
      details._responseBody = this.sanitizeData(_responseBody);
    }

    // Extrair ID do recurso da URL ou do body
    const resourceId = this.extractResourceId(req);

    await this.auditService.logAction(
      action,
      resource,
      user.userId,
      user.email,
      user.tenantId,
      {
        resourceId,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        details,
      }
    );
  }

  private getActionFromMethod(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET':
        return 'READ';
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      default:
        return 'UNKNOWN';
    }
  }

  private extractResourceId(req: Request): string | undefined {
    // Tentar extrair ID dos parâmetros da URL
    const pathParams = req.params;
    if (pathParams.id) return pathParams.id;
    if (pathParams.userId) return pathParams.userId;
    if (pathParams.roleId) return pathParams.roleId;
    if (pathParams.sensorId) return pathParams.sensorId;
    if (pathParams.machineId) return pathParams.machineId;

    // Tentar extrair ID do body para operações POST/PUT
    if (req.body && typeof req.body === 'object') {
      if (req.body.id) return req.body.id;
      if (req.body.user_id) return req.body.user_id;
      if (req.body.role_id) return req.body.role_id;
      if (req.body.sensor_id) return req.body.sensor_id;
      if (req.body.machine_id) return req.body.machine_id;
    }

    return undefined;
  }

  private sanitizeData(data: any, shouldCapture: boolean = true): any {
    if (!shouldCapture || !data || typeof data !== 'object') {
      return undefined;
    }

    const sanitized = { ...data };

    // Remover campos sensíveis
    this.config.sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Limitar tamanho dos dados
    const jsonString = JSON.stringify(sanitized);
    if (jsonString.length > 10000) {
      // 10KB limite
      return {
        ...sanitized,
        _truncated: true,
        _originalSize: jsonString.length,
      };
    }

    return sanitized;
  }

  // Método para configurar o middleware
  configure(config: Partial<AuditConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Método para desabilitar temporariamente
  disable() {
    this.config.enabled = false;
  }

  // Método para habilitar
  enable() {
    this.config.enabled = true;
  }
}

// Instância singleton
export const auditMiddleware = new AuditMiddleware();
