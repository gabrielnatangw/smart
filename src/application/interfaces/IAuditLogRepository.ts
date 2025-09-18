import { AuditLog } from '../../domain/entities/AuditLog';

export interface AuditLogFilters {
  tenantId?: string;
  userId?: string;
  action?: string;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface AuditLogStats {
  total: number;
  byAction: Array<{ action: string; count: number }>;
  byUser: Array<{ userId: string; userEmail: string; count: number }>;
  byResource: Array<{ resource: string; count: number }>;
  byDate: Array<{ date: string; count: number }>;
}

export interface IAuditLogRepository {
  create(auditLog: AuditLog): Promise<AuditLog>;
  findById(id: string): Promise<AuditLog | null>;
  findByTenant(
    tenantId: string,
    filters?: AuditLogFilters
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  findByUser(
    userId: string,
    filters?: AuditLogFilters
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  findByResource(
    resource: string,
    resourceId?: string,
    filters?: AuditLogFilters
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }>;
  getStats(filters?: AuditLogFilters): Promise<AuditLogStats>;
  deleteOldLogs(olderThan: Date): Promise<number>;
}
