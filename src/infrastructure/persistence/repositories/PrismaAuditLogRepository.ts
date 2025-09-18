import { PrismaClient } from '@prisma/client';

import {
  AuditLogFilters,
  AuditLogStats,
  IAuditLogRepository,
} from '../../../application/interfaces/IAuditLogRepository';
import { AuditLog } from '../../../domain/entities/AuditLog';

export class PrismaAuditLogRepository implements IAuditLogRepository {
  constructor(private prisma: PrismaClient) {}

  async create(auditLog: AuditLog): Promise<AuditLog> {
    const props = auditLog.toPersistence();

    const created = await this.prisma.auditLog.create({
      data: {
        id: props.id,
        action: props.action,
        resource: props.resource,
        resource_id: props.resourceId,
        user_id: props.userId,
        user_email: props.userEmail,
        tenant_id: props.tenantId,
        ip_address: props.ipAddress,
        user_agent: props.userAgent,
        details: props.details,
        old_values: props.oldValues,
        new_values: props.newValues,
        timestamp: props.timestamp,
        created_at: props.createdAt,
        updated_at: props.updatedAt,
      },
    });

    return AuditLog.fromPersistence({
      id: created.id,
      action: created.action,
      resource: created.resource,
      resourceId: created.resource_id,
      userId: created.user_id,
      userEmail: created.user_email,
      tenantId: created.tenant_id,
      ipAddress: created.ip_address,
      userAgent: created.user_agent,
      details: created.details as Record<string, any>,
      oldValues: created.old_values as Record<string, any>,
      newValues: created.new_values as Record<string, any>,
      timestamp: created.timestamp,
      createdAt: created.created_at,
      updatedAt: created.updated_at,
    });
  }

  async findById(id: string): Promise<AuditLog | null> {
    const auditLog = await this.prisma.auditLog.findUnique({
      where: { id },
    });

    if (!auditLog) return null;

    return AuditLog.fromPersistence({
      id: auditLog.id,
      action: auditLog.action,
      resource: auditLog.resource,
      resourceId: auditLog.resource_id,
      userId: auditLog.user_id,
      userEmail: auditLog.user_email,
      tenantId: auditLog.tenant_id,
      ipAddress: auditLog.ip_address,
      userAgent: auditLog.user_agent,
      details: auditLog.details as Record<string, any>,
      oldValues: auditLog.old_values as Record<string, any>,
      newValues: auditLog.new_values as Record<string, any>,
      timestamp: auditLog.timestamp,
      createdAt: auditLog.created_at,
      updatedAt: auditLog.updated_at,
    });
  }

  async findByTenant(
    tenantId: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {
      tenant_id: tenantId,
    };

    if (filters.userId) where.user_id = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resource_id = filters.resourceId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [auditLogs, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      auditLogs: auditLogs.map(auditLog =>
        AuditLog.fromPersistence({
          id: auditLog.id,
          action: auditLog.action,
          resource: auditLog.resource,
          resourceId: auditLog.resource_id,
          userId: auditLog.user_id,
          userEmail: auditLog.user_email,
          tenantId: auditLog.tenant_id,
          ipAddress: auditLog.ip_address,
          userAgent: auditLog.user_agent,
          details: auditLog.details as Record<string, any>,
          oldValues: auditLog.old_values as Record<string, any>,
          newValues: auditLog.new_values as Record<string, any>,
          timestamp: auditLog.timestamp,
          createdAt: auditLog.created_at,
          updatedAt: auditLog.updated_at,
        })
      ),
      total,
      page,
      limit,
    };
  }

  async findByUser(
    userId: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.findByTenant(filters.tenantId || '', { ...filters, userId });
  }

  async findByResource(
    resource: string,
    resourceId?: string,
    filters: AuditLogFilters = {}
  ): Promise<{
    auditLogs: AuditLog[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.findByTenant(filters.tenantId || '', {
      ...filters,
      resource,
      resourceId,
    });
  }

  async getStats(filters: AuditLogFilters = {}): Promise<AuditLogStats> {
    const where: any = {};

    if (filters.tenantId) where.tenant_id = filters.tenantId;
    if (filters.userId) where.user_id = filters.userId;
    if (filters.action) where.action = filters.action;
    if (filters.resource) where.resource = filters.resource;
    if (filters.resourceId) where.resource_id = filters.resourceId;
    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) where.timestamp.gte = filters.startDate;
      if (filters.endDate) where.timestamp.lte = filters.endDate;
    }

    const [total, actionStats, userStats, resourceStats, dateStats] =
      await Promise.all([
        this.prisma.auditLog.count({ where }),
        this.prisma.auditLog.groupBy({
          by: ['action'],
          where,
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
        }),
        this.prisma.auditLog.groupBy({
          by: ['user_id', 'user_email'],
          where,
          _count: { user_id: true },
          orderBy: { _count: { user_id: 'desc' } },
          take: 10,
        }),
        this.prisma.auditLog.groupBy({
          by: ['resource'],
          where,
          _count: { resource: true },
          orderBy: { _count: { resource: 'desc' } },
        }),
        this.prisma.auditLog.groupBy({
          by: ['timestamp'],
          where,
          _count: { timestamp: true },
          orderBy: { timestamp: 'desc' },
          take: 30,
        }),
      ]);

    return {
      total,
      byAction: actionStats.map(stat => ({
        action: stat.action,
        count: stat._count.action,
      })),
      byUser: userStats.map(stat => ({
        userId: stat.user_id,
        userEmail: stat.user_email,
        count: stat._count.user_id,
      })),
      byResource: resourceStats.map(stat => ({
        resource: stat.resource,
        count: stat._count.resource,
      })),
      byDate: dateStats.map(stat => ({
        date: stat.timestamp.toISOString().split('T')[0],
        count: stat._count.timestamp,
      })),
    };
  }

  async deleteOldLogs(olderThan: Date): Promise<number> {
    const result = await this.prisma.auditLog.deleteMany({
      where: {
        timestamp: {
          lt: olderThan,
        },
      },
    });

    return result.count;
  }
}
