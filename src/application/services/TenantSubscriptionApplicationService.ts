import {
  CreateTenantSubscriptionRequest,
  PaginatedTenantSubscriptionsResponse,
  TenantSubscription,
  TenantSubscriptionFilters,
  TenantSubscriptionStatistics,
  TenantSubscriptionWithRelations,
  UpdateTenantSubscriptionRequest,
} from '../../domain/entities/TenantSubscription';
import { ITenantSubscriptionRepository } from '../interfaces/ITenantSubscriptionRepository';

export class TenantSubscriptionApplicationService {
  constructor(
    private tenantSubscriptionRepository: ITenantSubscriptionRepository
  ) {}

  async createTenantSubscription(
    data: CreateTenantSubscriptionRequest
  ): Promise<TenantSubscription> {
    // Validate unique tenant-application combination
    const exists =
      await this.tenantSubscriptionRepository.existsByTenantAndApplication(
        data.tenantId,
        data.applicationId
      );

    if (exists) {
      throw new Error('Tenant already has a subscription for this application');
    }

    return this.tenantSubscriptionRepository.create(data);
  }

  async getTenantSubscriptionById(
    tenantSubscriptionId: string
  ): Promise<TenantSubscriptionWithRelations | null> {
    return this.tenantSubscriptionRepository.findById(tenantSubscriptionId);
  }

  async getAllTenantSubscriptions(
    filters: TenantSubscriptionFilters
  ): Promise<PaginatedTenantSubscriptionsResponse> {
    return this.tenantSubscriptionRepository.findAll(filters);
  }

  async updateTenantSubscription(
    tenantSubscriptionId: string,
    data: UpdateTenantSubscriptionRequest
  ): Promise<TenantSubscription> {
    const existing =
      await this.tenantSubscriptionRepository.findById(tenantSubscriptionId);
    if (!existing) {
      throw new Error('Tenant subscription not found');
    }

    return this.tenantSubscriptionRepository.update(tenantSubscriptionId, data);
  }

  async deleteTenantSubscription(tenantSubscriptionId: string): Promise<void> {
    const existing =
      await this.tenantSubscriptionRepository.findById(tenantSubscriptionId);
    if (!existing) {
      throw new Error('Tenant subscription not found');
    }

    await this.tenantSubscriptionRepository.delete(tenantSubscriptionId);
  }

  async restoreTenantSubscription(
    tenantSubscriptionId: string
  ): Promise<TenantSubscription> {
    return this.tenantSubscriptionRepository.restore(tenantSubscriptionId);
  }

  // Business Operations
  async getTenantSubscriptionsByTenant(
    tenantId: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findByTenantId(tenantId);
  }

  async getTenantSubscriptionsByApplication(
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findByApplicationId(applicationId);
  }

  async getTenantSubscriptionByTenantAndApplication(
    tenantId: string,
    applicationId: string
  ): Promise<TenantSubscriptionWithRelations | null> {
    return this.tenantSubscriptionRepository.findByTenantAndApplication(
      tenantId,
      applicationId
    );
  }

  async getActiveSubscriptions(): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findActiveSubscriptions();
  }

  async getInactiveSubscriptions(): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findInactiveSubscriptions();
  }

  async getExpiringSubscriptions(
    days: number = 30
  ): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findExpiringSubscriptions(days);
  }

  async getExpiredSubscriptions(): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findExpiredSubscriptions();
  }

  async getSubscriptionsByPlan(
    plan: string
  ): Promise<TenantSubscriptionWithRelations[]> {
    return this.tenantSubscriptionRepository.findBySubscriptionPlan(plan);
  }

  // Statistics
  async getTenantSubscriptionStatistics(): Promise<TenantSubscriptionStatistics> {
    return this.tenantSubscriptionRepository.getStatistics();
  }

  // Validation
  async validateTenantSubscriptionAccess(
    tenantId: string,
    applicationId: string
  ): Promise<boolean> {
    const subscription =
      await this.tenantSubscriptionRepository.findByTenantAndApplication(
        tenantId,
        applicationId
      );
    if (!subscription) {
      return false;
    }

    if (!subscription.isActive) {
      return false;
    }

    if (subscription.expiresAt && subscription.expiresAt < new Date()) {
      return false;
    }

    return true;
  }

  async getActiveSubscriptionCountByTenant(tenantId: string): Promise<number> {
    return this.tenantSubscriptionRepository.countActiveSubscriptionsByTenant(
      tenantId
    );
  }

  async getActiveSubscriptionCountByApplication(
    applicationId: string
  ): Promise<number> {
    return this.tenantSubscriptionRepository.countActiveSubscriptionsByApplication(
      applicationId
    );
  }
}
