import { Request, Response } from 'express';

import { AuditLogFilters } from '../../application/interfaces/IAuditLogRepository';
import { AuditLogApplicationService } from '../../application/services/AuditLogApplicationService';

export class AuditLogController {
  constructor(private auditLogService: AuditLogApplicationService) {}

  async getAuditLogs(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const filters: AuditLogFilters = {
        tenantId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        userId: req.query.userId as string,
        action: req.query.action as string,
        resource: req.query.resource as string,
        resourceId: req.query.resourceId as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const result = await this.auditLogService.getAuditLogsByTenant(
        tenantId,
        filters
      );

      res.json({
        success: true,
        data: result.auditLogs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAuditLogById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const auditLog = await this.auditLogService.getAuditLogById(id);

      if (!auditLog) {
        res.status(404).json({
          success: false,
          message: 'Log de auditoria não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: auditLog,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAuditLogsByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const tenantId = (req as any).user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const filters: AuditLogFilters = {
        tenantId,
        userId,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        action: req.query.action as string,
        resource: req.query.resource as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const result = await this.auditLogService.getAuditLogsByUser(
        userId,
        filters
      );

      res.json({
        success: true,
        data: result.auditLogs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAuditLogsByResource(req: Request, res: Response): Promise<void> {
    try {
      const { resource } = req.params;
      const { resourceId } = req.query;
      const tenantId = (req as any).user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const filters: AuditLogFilters = {
        tenantId,
        resource,
        resourceId: resourceId as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        userId: req.query.userId as string,
        action: req.query.action as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const result = await this.auditLogService.getAuditLogsByResource(
        resource,
        resourceId as string,
        filters
      );

      res.json({
        success: true,
        data: result.auditLogs,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getAuditLogStats(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const filters: AuditLogFilters = {
        tenantId,
        userId: req.query.userId as string,
        action: req.query.action as string,
        resource: req.query.resource as string,
        startDate: req.query.startDate
          ? new Date(req.query.startDate as string)
          : undefined,
        endDate: req.query.endDate
          ? new Date(req.query.endDate as string)
          : undefined,
      };

      const stats = await this.auditLogService.getAuditLogStats(filters);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const days = parseInt(req.query.days as string) || 7;
      const limit = parseInt(req.query.limit as string) || 20;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const filters: AuditLogFilters = {
        tenantId,
        startDate,
        endDate,
        limit,
        page: 1,
      };

      const result = await this.auditLogService.getAuditLogsByTenant(
        tenantId,
        filters
      );

      // Formatar dados para dashboard
      const activities = result.auditLogs.map(log => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        userEmail: log.userEmail,
        timestamp: log.timestamp,
        details: log.details,
        formattedTime: this.formatTimeAgo(log.timestamp),
        actionLabel: this.getActionLabel(log.action),
        resourceLabel: this.getResourceLabel(log.resource),
      }));

      res.json({
        success: true,
        data: {
          activities,
          total: result.total,
          period: `${days} dias`,
          generatedAt: new Date().toISOString(),
        },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  async deleteOldLogs(req: Request, res: Response): Promise<void> {
    try {
      const { olderThan } = req.body;

      if (!olderThan) {
        res.status(400).json({
          success: false,
          message: 'Data limite é obrigatória',
        });
        return;
      }

      const olderThanDate = new Date(olderThan);
      if (isNaN(olderThanDate.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Data limite inválida',
        });
        return;
      }

      const deletedCount =
        await this.auditLogService.deleteOldLogs(olderThanDate);

      res.json({
        success: true,
        message: `${deletedCount} logs de auditoria antigos foram removidos`,
        data: { deletedCount },
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  private formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minuto${minutes > 1 ? 's' : ''} atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hora${hours > 1 ? 's' : ''} atrás`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} dia${days > 1 ? 's' : ''} atrás`;
    }
  }

  private getActionLabel(action: string): string {
    const labels: Record<string, string> = {
      CREATE: 'Criou',
      READ: 'Visualizou',
      UPDATE: 'Atualizou',
      DELETE: 'Removeu',
      LOGIN_SUCCESS: 'Fez login',
      LOGIN_FAILED: 'Tentou fazer login',
      LOGOUT: 'Fez logout',
      ASSIGN_ROLE: 'Atribuiu role',
      REMOVE_ROLE: 'Removeu role',
      GRANT_PERMISSION: 'Concedeu permissão',
      REVOKE_PERMISSION: 'Revogou permissão',
    };
    return labels[action] || action;
  }

  private getResourceLabel(resource: string): string {
    const labels: Record<string, string> = {
      USER: 'usuário',
      ROLE: 'role',
      PERMISSION: 'permissão',
      SENSOR: 'sensor',
      MACHINE: 'máquina',
      MODULE: 'módulo',
      AUTH: 'autenticação',
      TENANT: 'tenant',
      APPLICATION: 'aplicação',
    };
    return labels[resource] || resource.toLowerCase();
  }
}
