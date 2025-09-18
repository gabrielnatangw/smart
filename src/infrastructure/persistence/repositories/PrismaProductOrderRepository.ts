import { PrismaClient } from '@prisma/client';

import {
  CreateProductOrderData,
  IProductOrderRepository,
  ProductOrderFilters,
  UpdateProductOrderData,
} from '../../../application/interfaces/IProductOrderRepository';
import { ProductOrder } from '../../../domain/entities/ProductOrder';

export class PrismaProductOrderRepository implements IProductOrderRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(productOrder: any): ProductOrder {
    if (!productOrder.tenant_id) {
      throw new Error('Tenant ID é obrigatório para ordem de produto');
    }

    return ProductOrder.fromPersistence({
      id: productOrder.product_order_id,
      productionOrder: productOrder.production_order,
      name: productOrder.name,
      jobRun: productOrder.job_run,
      startProduction: productOrder.start_production,
      expectedRunTime: productOrder.expected_run_time,
      tenantId: productOrder.tenant_id,
      createdAt: productOrder.created_at,
      updatedAt: productOrder.updated_at || undefined,
      deletedAt: productOrder.deleted_at || undefined,
    });
  }

  async create(data: CreateProductOrderData): Promise<ProductOrder> {
    try {
      const productOrder = await this.prisma.productOrder.create({
        data: {
          product_order_id: crypto.randomUUID(),
          production_order: data.productionOrder,
          name: data.name,
          job_run: data.jobRun,
          start_production: data.startProduction,
          expected_run_time: data.expectedRunTime,
          tenant_id: data.tenantId,
        },
      });

      return this.mapToEntity(productOrder);
    } catch (error) {
      console.error('Error creating product order:', error);
      throw new Error('Falha ao criar ordem de produto');
    }
  }

  async findById(
    id: string,
    includeDeleted = false
  ): Promise<ProductOrder | null> {
    try {
      const productOrder = await this.prisma.productOrder.findFirst({
        where: {
          product_order_id: id,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
      });

      if (!productOrder) return null;

      return this.mapToEntity(productOrder);
    } catch (error) {
      console.error('Error finding product order by id:', error);
      return null;
    }
  }

  async findByProductionOrder(
    productionOrder: string,
    tenantId: string,
    includeDeleted = false
  ): Promise<ProductOrder | null> {
    try {
      const productOrder = await this.prisma.productOrder.findFirst({
        where: {
          production_order: productionOrder,
          tenant_id: tenantId,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
      });

      if (!productOrder) return null;

      return this.mapToEntity(productOrder);
    } catch (error) {
      console.error('Error finding product order by production order:', error);
      return null;
    }
  }

  async findAll(
    filters?: ProductOrderFilters,
    tenantId?: string
  ): Promise<ProductOrder[]> {
    try {
      const whereClause = this.buildWhereClause(filters, tenantId);

      const productOrders = await this.prisma.productOrder.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
      });

      return productOrders.map(productOrder => this.mapToEntity(productOrder));
    } catch (error) {
      console.error('Error finding all product orders:', error);
      return [];
    }
  }

  async update(
    id: string,
    data: UpdateProductOrderData
  ): Promise<ProductOrder | null> {
    try {
      const updateData: any = {};

      if (data.productionOrder !== undefined) {
        updateData.production_order = data.productionOrder;
      }
      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.jobRun !== undefined) {
        updateData.job_run = data.jobRun;
      }
      if (data.startProduction !== undefined) {
        updateData.start_production = data.startProduction;
      }
      if (data.expectedRunTime !== undefined) {
        updateData.expected_run_time = data.expectedRunTime;
      }

      updateData.updated_at = new Date();

      const productOrder = await this.prisma.productOrder.update({
        where: { product_order_id: id },
        data: updateData,
      });

      return this.mapToEntity(productOrder);
    } catch (error) {
      console.error('Error updating product order:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.productOrder.delete({
        where: { product_order_id: id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting product order:', error);
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.productOrder.update({
        where: { product_order_id: id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error soft deleting product order:', error);
      return false;
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await this.prisma.productOrder.update({
        where: { product_order_id: id },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error restoring product order:', error);
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.productOrder.count({
        where: {
          product_order_id: id,
          deleted_at: null,
        },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking if product order exists:', error);
      return false;
    }
  }

  async existsByProductionOrder(
    productionOrder: string,
    tenantId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = {
        production_order: productionOrder,
        tenant_id: tenantId,
        deleted_at: null,
      };

      if (excludeId) {
        whereClause.product_order_id = { not: excludeId };
      }

      const count = await this.prisma.productOrder.count({
        where: whereClause,
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking if production order exists:', error);
      return false;
    }
  }

  async count(
    filters?: ProductOrderFilters,
    tenantId?: string
  ): Promise<number> {
    try {
      const whereClause = this.buildWhereClause(filters, tenantId);
      return await this.prisma.productOrder.count({ where: whereClause });
    } catch (error) {
      console.error('Error counting product orders:', error);
      return 0;
    }
  }

  private buildWhereClause(
    filters?: ProductOrderFilters,
    tenantId?: string
  ): any {
    const whereClause: any = {};

    if (tenantId) {
      whereClause.tenant_id = tenantId;
    }

    if (filters?.productionOrder) {
      whereClause.production_order = {
        contains: filters.productionOrder,
        mode: 'insensitive',
      };
    }

    if (filters?.name) {
      whereClause.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters?.jobRun) {
      whereClause.job_run = filters.jobRun;
    }

    if (filters?.startProductionFrom || filters?.startProductionTo) {
      whereClause.start_production = {};
      if (filters.startProductionFrom) {
        whereClause.start_production.gte = filters.startProductionFrom;
      }
      if (filters.startProductionTo) {
        whereClause.start_production.lte = filters.startProductionTo;
      }
    }

    if (filters?.expectedRunTimeFrom || filters?.expectedRunTimeTo) {
      whereClause.expected_run_time = {};
      if (filters.expectedRunTimeFrom) {
        whereClause.expected_run_time.gte = filters.expectedRunTimeFrom;
      }
      if (filters.expectedRunTimeTo) {
        whereClause.expected_run_time.lte = filters.expectedRunTimeTo;
      }
    }

    if (!filters?.includeDeleted) {
      whereClause.deleted_at = null;
    }

    return whereClause;
  }
}
