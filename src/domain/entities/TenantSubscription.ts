export interface TenantSubscription {
  tenantSubscriptionId: string;
  isActive: boolean;
  subscriptionPlan: string;
  maxUsers?: number;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  tenantId: string;
  applicationId: string;
}

export interface CreateTenantSubscriptionRequest {
  isActive?: boolean;
  subscriptionPlan: string;
  maxUsers?: number;
  expiresAt?: Date;
  tenantId: string;
  applicationId: string;
}

export interface UpdateTenantSubscriptionRequest {
  isActive?: boolean;
  subscriptionPlan?: string;
  maxUsers?: number;
  expiresAt?: Date;
}

export interface TenantSubscriptionWithRelations extends TenantSubscription {
  tenant?: {
    tenantId: string;
    name: string;
    domain: string;
  };
  application?: {
    applicationId: string;
    name: string;
    displayName: string;
  };
}

export interface PaginatedTenantSubscriptionsResponse {
  data: TenantSubscriptionWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TenantSubscriptionStatistics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  inactiveSubscriptions: number;
  subscriptionsByPlan: {
    [plan: string]: number;
  };
  expiringSubscriptions: number; // Expire in next 30 days
  expiredSubscriptions: number;
  averageUsersPerSubscription: number;
}

export interface TenantSubscriptionFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  subscriptionPlan?: string;
  tenantId?: string;
  applicationId?: string;
  expiresBefore?: Date;
  expiresAfter?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
