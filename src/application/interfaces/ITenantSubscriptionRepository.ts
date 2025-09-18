import {
  CreateTenantSubscriptionRequest,
  PaginatedTenantSubscriptionsResponse,
  TenantSubscription,
  TenantSubscriptionFilters,
  TenantSubscriptionStatistics,
  TenantSubscriptionWithRelations,
  UpdateTenantSubscriptionRequest,
} from '../../domain/entities/TenantSubscription';

export interface ITenantSubscriptionRepository {
  // CRUD Operations
  create(data: CreateTenantSubscriptionRequest): Promise<TenantSubscription>;
  findById(
    tenantSubscriptionId: string
  ): Promise<TenantSubscriptionWithRelations | null>;
  findAll(
    params: TenantSubscriptionFilters
  ): Promise<PaginatedTenantSubscriptionsResponse>;
  update(
    tenantSubscriptionId: string,
    data: UpdateTenantSubscriptionRequest
  ): Promise<TenantSubscription>;
  delete(tenantSubscriptionId: string): Promise<void>;
  restore(tenantSubscriptionId: string): Promise<TenantSubscription>;

  // Business Operations
  findByTenantId(tenantId: string): Promise<TenantSubscriptionWithRelations[]>;
  findByApplicationId(
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations[]>;
  findByTenantAndApplication(
    tenantId: string,
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations | null>;
  findActiveSubscriptions(): Promise<TenantSubscriptionWithRelations[]>;
  findInactiveSubscriptions(): Promise<TenantSubscriptionWithRelations[]>;
  findExpiringSubscriptions(
    days: number
  ): Promise<TenantSubscriptionWithRelations[]>;
  findExpiredSubscriptions(): Promise<TenantSubscriptionWithRelations[]>;
  findBySubscriptionPlan(
    plan: string
  ): Promise<TenantSubscriptionWithRelations[]>;

  // Statistics
  getStatistics(): Promise<TenantSubscriptionStatistics>;

  // Validation
  existsByTenantAndApplication(
    tenantId: string,
    applicationId: string,
    excludeId?: string
  ): Promise<boolean>;
  countActiveSubscriptionsByTenant(tenantId: string): Promise<number>;
  countActiveSubscriptionsByApplication(applicationId: string): Promise<number>;
}
