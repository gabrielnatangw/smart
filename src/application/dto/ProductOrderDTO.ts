export interface CreateProductOrderRequest {
  productionOrder: string;
  name: string;
  jobRun: number;
  startProduction: string; // ISO 8601 date string
  expectedRunTime: string; // ISO 8601 date string
}

export interface UpdateProductOrderRequest {
  productionOrder?: string;
  name?: string;
  jobRun?: number;
  startProduction?: string; // ISO 8601 date string
  expectedRunTime?: string; // ISO 8601 date string
}

export interface ProductOrderResponse {
  id: string;
  productionOrder: string;
  name: string;
  jobRun: number;
  startProduction: string; // ISO 8601 date string
  expectedRunTime: string; // ISO 8601 date string
  tenantId: string;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  deletedAt: string | null; // ISO 8601 date string
}

export interface ProductOrderListResponse {
  productOrders: ProductOrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProductOrderStatsResponse {
  total: number;
  active: number;
  deleted: number;
  byProductionOrder: Array<{
    productionOrder: string;
    count: number;
  }>;
  byJobRun: Array<{
    jobRun: number;
    count: number;
  }>;
}
