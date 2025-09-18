import { PrismaClient } from '@prisma/client';
import { NextFunction, Request, Response } from 'express';

import { TenantApplicationService } from '../../application/services/TenantApplicationService';
import { PrismaTenantRepository } from '../../infrastructure/persistence/repositories/PrismaTenantRepository';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    [key: string]: any;
  };
  tenant?: {
    id: string;
    name: string;
    isActive: boolean;
    [key: string]: any;
  };
}

const prisma = new PrismaClient();
const tenantRepository = new PrismaTenantRepository(prisma);
const tenantService = new TenantApplicationService(tenantRepository);

export const tenantIsolationMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação inválido ou ausente',
      });
    }

    const tenant = await tenantService.getTenantById(req.user.tenantId);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    if (!tenant.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Tenant desativado',
      });
    }

    if (tenant.isDeleted) {
      return res.status(403).json({
        success: false,
        message: 'Tenant foi excluído',
      });
    }

    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      isActive: tenant.isActive,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    };

    next();
  } catch (error) {
    console.error('Tenant isolation middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

export const extractTenantFromHeader = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;

    if (!tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Header X-Tenant-ID é obrigatório',
      });
    }

    if (!req.user) {
      req.user = {} as any;
    }

    if (req.user) {
      req.user.tenantId = tenantId;
    }
    next();
  } catch (error) {
    console.error('Extract tenant from header error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

export const validateTenantAccess = (allowedRoles: string[] = []) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      if (!req.tenant) {
        return res.status(400).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Permissões insuficientes para esta operação',
        });
      }

      next();
    } catch (error) {
      console.error('Validate tenant access error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};

export const systemAdminOnly = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (req.user.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores do sistema podem acessar este recurso',
      });
    }

    next();
  } catch (error) {
    console.error('System admin only middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
};

export const filterByTenant = (tenantIdField = 'tenantId') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.tenantId) {
        return res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
      }

      if (!req.query) {
        req.query = {};
      }

      (req.query as any)[tenantIdField] = req.user.tenantId;

      if (req.body && typeof req.body === 'object') {
        req.body[tenantIdField] = req.user.tenantId;
      }

      next();
    } catch (error) {
      console.error('Filter by tenant middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};
