export interface CreateProcessOrderRequest {
  name: string;
  jobRun: number;
  plannedSpeed: number;
  startProduction: string; // ISO 8601 date string
  expectedRunTime: string; // ISO 8601 date string
  programmedMultiplier?: number;
  realMultiplier?: number;
  zeroSpeedThreshold?: number;
  productionSpeedThreshold?: number;
  zeroSpeedTimeout?: number;
  productionSpeedTimeout?: number;
  cycleToRun?: number;
  cycleTime?: number;
  machineId?: string;
  userId?: string;
  productOrderId: string;
}

export interface UpdateProcessOrderRequest {
  name?: string;
  jobRun?: number;
  plannedSpeed?: number;
  startProduction?: string; // ISO 8601 date string
  expectedRunTime?: string; // ISO 8601 date string
  programmedMultiplier?: number;
  realMultiplier?: number;
  zeroSpeedThreshold?: number;
  productionSpeedThreshold?: number;
  zeroSpeedTimeout?: number;
  productionSpeedTimeout?: number;
  cycleToRun?: number;
  cycleTime?: number;
  machineId?: string;
  userId?: string;
}

export interface ProcessOrderResponse {
  id: string;
  name: string;
  jobRun: number;
  plannedSpeed: number;
  startProduction: string; // ISO 8601 date string
  expectedRunTime: string; // ISO 8601 date string
  programmedMultiplier: number | null;
  realMultiplier: number | null;
  zeroSpeedThreshold: number | null;
  productionSpeedThreshold: number | null;
  zeroSpeedTimeout: number | null;
  productionSpeedTimeout: number | null;
  cycleToRun: number | null;
  cycleTime: number | null;
  machineId: string | null;
  userId: string | null;
  productOrderId: string;
  isDeleted: boolean;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
  deletedAt: string | null; // ISO 8601 date string
}

export interface ProcessOrderListResponse {
  processOrders: ProcessOrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ProcessOrderStatsResponse {
  total: number;
  active: number;
  deleted: number;
  byProductOrder: Array<{
    productOrderId: string;
    count: number;
  }>;
  byMachine: Array<{
    machineId: string;
    count: number;
  }>;
  byUser: Array<{
    userId: string;
    count: number;
  }>;
  averagePlannedSpeed: number;
  averageRealMultiplier: number;
}
