import { ProductOrder } from '../../domain/entities/ProductOrder';

export interface CreateProductOrderData {
  productionOrder: string;
  name: string;
  jobRun: number;
  startProduction: Date;
  expectedRunTime: Date;
  tenantId: string;
}

export interface UpdateProductOrderData {
  productionOrder?: string;
  name?: string;
  jobRun?: number;
  startProduction?: Date;
  expectedRunTime?: Date;
}

export interface ProductOrderFilters {
  productionOrder?: string;
  name?: string;
  jobRun?: number;
  startProductionFrom?: Date;
  startProductionTo?: Date;
  expectedRunTimeFrom?: Date;
  expectedRunTimeTo?: Date;
  includeDeleted?: boolean;
}

export interface IProductOrderRepository {
  create(data: CreateProductOrderData): Promise<ProductOrder>;
  findById(id: string, includeDeleted?: boolean): Promise<ProductOrder | null>;
  findByProductionOrder(
    productionOrder: string,
    tenantId: string,
    includeDeleted?: boolean
  ): Promise<ProductOrder | null>;
  findAll(
    filters?: ProductOrderFilters,
    tenantId?: string
  ): Promise<ProductOrder[]>;
  update(
    id: string,
    data: UpdateProductOrderData
  ): Promise<ProductOrder | null>;
  delete(id: string): Promise<boolean>;
  softDelete(id: string): Promise<boolean>;
  restore(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  existsByProductionOrder(
    productionOrder: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean>;
  count(filters?: ProductOrderFilters, tenantId?: string): Promise<number>;
}
