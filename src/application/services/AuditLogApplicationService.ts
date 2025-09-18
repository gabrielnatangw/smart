import { AuditLog } from '../../domain/entities/AuditLog';
import {
  AuditLogFilters,
  AuditLogStats,
  IAuditLogRepository,
} from '../interfaces/IAuditLogRepository';

export interface CreateAuditLogRequest {
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface AuditLogResponse {
  id: string;
  action: string;
  resource: string;
  resourceId?: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class AuditLogApplicationService {
  constructor(private auditLogRepository: IAuditLogRepository) {}

  async createAuditLog(data: CreateAuditLogRequest): Promise<AuditLogResponse> {
    const auditLog = AuditLog.create({
      action: data.action,
      resource: data.resource,
      resourceId: data.resourceId,
      userId: data.userId,
      userEmail: data.userEmail,
      tenantId: data.tenantId,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      details: data.details,
      oldValues: data.oldValues,
      newValues: data.newValues,
      timestamp: new Date(),
    });

    const created = await this.auditLogRepository.create(auditLog);
    return this.mapToResponse(created);
  }

  async getAuditLogById(id: string): Promise<AuditLogResponse | null> {
    const auditLog = await this.auditLogRepository.findById(id);
    if (!auditLog) return null;
    return this.mapToResponse(auditLog);
  }

  async getAuditLogsByTenant(
    tenantId: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLogResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.auditLogRepository.findByTenant(
      tenantId,
      filters
    );
    return {
      ...result,
      auditLogs: result.auditLogs.map(auditLog => this.mapToResponse(auditLog)),
    };
  }

  async getAuditLogsByUser(
    userId: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLogResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.auditLogRepository.findByUser(userId, filters);
    return {
      ...result,
      auditLogs: result.auditLogs.map(auditLog => this.mapToResponse(auditLog)),
    };
  }

  async getAuditLogsByResource(
    resource: string,
    resourceId?: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLogResponse[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.auditLogRepository.findByResource(
      resource,
      resourceId,
      filters
    );
    return {
      ...result,
      auditLogs: result.auditLogs.map(auditLog => this.mapToResponse(auditLog)),
    };
  }

  async getAuditLogStats(
    filters: AuditLogFilters = {}
  ): Promise<AuditLogStats> {
    return this.auditLogRepository.getStats(filters);
  }

  async deleteOldLogs(olderThan: Date): Promise<number> {
    return this.auditLogRepository.deleteOldLogs(olderThan);
  }

  // Método helper para logar ações automaticamente
  async logAction(
    action: string,
    resource: string,
    userId: string,
    userEmail: string,
    tenantId: string,
    options: {
      resourceId?: string;
      ipAddress?: string;
      userAgent?: string;
      details?: Record<string, any>;
      oldValues?: Record<string, any>;
      newValues?: Record<string, any>;
    } = {}
  ): Promise<void> {
    try {
      await this.createAuditLog({
        action,
        resource,
        resourceId: options.resourceId,
        userId,
        userEmail,
        tenantId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        details: options.details,
        oldValues: options.oldValues,
        newValues: options.newValues,
      });
    } catch (error) {
      // Log do erro mas não falha a operação principal
      console.error('Erro ao registrar log de auditoria:', error);
    }
  }

  private mapToResponse(auditLog: AuditLog): AuditLogResponse {
    return {
      id: auditLog.id,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resourceId,
      userId: auditLog.userId,
      userEmail: auditLog.userEmail,
      tenantId: auditLog.tenantId,
      ipAddress: auditLog.ipAddress,
      userAgent: auditLog.userAgent,
      details: auditLog.details,
      oldValues: auditLog.oldValues,
      newValues: auditLog.newValues,
      timestamp: auditLog.timestamp,
      createdAt: auditLog.createdAt,
      updatedAt: auditLog.updatedAt,
    };
  }
}
