import { NextFunction, Request, Response } from 'express';

import { logger } from '../../infrastructure/logging';

export interface RequestLogData {
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  tenantId?: string;
}

export function loggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const startTime = Date.now();

  // Capturar dados da requisição
  const requestData: Partial<RequestLogData> = {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent'),
    ip: req.ip || req.connection.remoteAddress,
    userId: (req as any).user?.id,
    tenantId: (req as any).tenant?.id,
  };

  // Log da requisição recebida
  logger.network(`Requisição recebida: ${req.method} ${req.url}`, {
    ...requestData,
    timestamp: new Date().toISOString(),
  });

  // Interceptar o final da resposta
  res.on('finish', () => {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    const logData: RequestLogData = {
      ...(requestData as RequestLogData),
      statusCode,
      responseTime,
    };

    // Determinar o tipo de log baseado no status code
    if (statusCode >= 500) {
      logger.error(`Erro do servidor: ${req.method} ${req.url}`, logData);
    } else if (statusCode >= 400) {
      logger.warn(`Erro do cliente: ${req.method} ${req.url}`, logData);
    } else if (statusCode >= 300) {
      logger.info(`Redirecionamento: ${req.method} ${req.url}`, logData);
    } else {
      logger.network(`Resposta enviada: ${req.method} ${req.url}`, logData);
    }
  });

  next();
}

// Middleware específico para logging de autenticação
export function authLoggingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const originalSend = res.send;

  res.send = function (body: any): Response {
    const statusCode = res.statusCode;
    const isAuthEndpoint =
      req.url.includes('/auth') || req.url.includes('/login');

    if (isAuthEndpoint) {
      const logData = {
        method: req.method,
        url: req.url,
        statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
      };

      if (statusCode === 200 || statusCode === 201) {
        logger.security('Autenticação bem-sucedida', logData);
      } else if (statusCode === 401) {
        logger.security('Tentativa de autenticação falhou', logData);
      } else if (statusCode === 429) {
        logger.security('Rate limit excedido na autenticação', logData);
      }
    }

    return originalSend.call(this, body);
  };

  next();
}

// Middleware para logging de erros
export function errorLoggingMiddleware(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Erro não tratado na aplicação', {
    error: error.message,
    stack: error.stack,
    method: req.method,
    url: req.url,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: (req as any).user?.id,
    tenantId: (req as any).tenant?.id,
    timestamp: new Date().toISOString(),
  });

  next(error);
}
