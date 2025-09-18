import { Request, Response } from 'express';

import { UpdateProductOrderRequest } from '../../application/dto/ProductOrderDTO';
import { ProductOrderApplicationService } from '../../application/services/ProductOrderApplicationService';
import {
  createProductOrderSchema,
  deleteProductOrderSchema,
  productOrderIdSchema,
  productOrderStatsSchema,
  searchProductOrdersSchema,
  updateProductOrderSchema,
} from '../validators/productOrderValidators';

// Extend Request interface to include tenant and user properties
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    tenantId: string;
    role: string;
    [key: string]: any;
  };
  tenant?: {
    id: string;
    name: string;
    isActive: boolean;
    [key: string]: any;
  };
}

export class ProductOrderController {
  constructor(private productOrderService: ProductOrderApplicationService) {}

  async createProductOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const data = createProductOrderSchema.parse(req.body);
      const tenantId = req.tenant?.id || req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const productOrder = await this.productOrderService.createProductOrder(
        data,
        tenantId
      );

      res.status(201).json({
        success: true,
        message: 'Ordem de produto criada com sucesso',
        data: productOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('já está cadastrada')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (
          error.message.includes('inválida') ||
          error.message.includes('obrigatória')
        ) {
          res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: [{ field: 'general', message: error.message }],
          });
          return;
        }
      }

      console.error('Error creating product order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getAllProductOrders(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const queryParams = searchProductOrdersSchema.parse(req.query);
      const tenantId = req.tenant?.id || req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const { page, limit, ...rawFilters } = queryParams;

      // Clean filters to match expected interface
      const filters: {
        productionOrder?: string;
        name?: string;
        jobRun?: number;
        startProductionFrom?: string;
        startProductionTo?: string;
        expectedRunTimeFrom?: string;
        expectedRunTimeTo?: string;
        includeDeleted?: boolean;
      } = {};

      if (rawFilters.productionOrder !== undefined) {
        filters.productionOrder = rawFilters.productionOrder;
      }

      if (rawFilters.name !== undefined) {
        filters.name = rawFilters.name;
      }

      if (rawFilters.jobRun !== undefined) {
        filters.jobRun = rawFilters.jobRun;
      }

      if (rawFilters.startProductionFrom !== undefined) {
        filters.startProductionFrom = rawFilters.startProductionFrom;
      }

      if (rawFilters.startProductionTo !== undefined) {
        filters.startProductionTo = rawFilters.startProductionTo;
      }

      if (rawFilters.expectedRunTimeFrom !== undefined) {
        filters.expectedRunTimeFrom = rawFilters.expectedRunTimeFrom;
      }

      if (rawFilters.expectedRunTimeTo !== undefined) {
        filters.expectedRunTimeTo = rawFilters.expectedRunTimeTo;
      }

      if (rawFilters.includeDeleted !== undefined) {
        filters.includeDeleted = rawFilters.includeDeleted;
      }

      const result = await this.productOrderService.getAllProductOrders(
        filters,
        tenantId,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error getting product orders:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProductOrderById(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = productOrderIdSchema.parse(req.params);
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const productOrder = await this.productOrderService.getProductOrderById(
        id,
        tenantId
      );

      res.status(200).json({
        success: true,
        data: productOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('não pertence ao tenant')) {
          res.status(403).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error('Error getting product order by id:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async updateProductOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = productOrderIdSchema.parse(req.params);
      const rawData = updateProductOrderSchema.parse(req.body);
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      // Clean data to match UpdateProductOrderRequest interface
      const data: UpdateProductOrderRequest = {};

      if (rawData.productionOrder !== undefined) {
        data.productionOrder = rawData.productionOrder;
      }

      if (rawData.name !== undefined) {
        data.name = rawData.name;
      }

      if (rawData.jobRun !== undefined) {
        data.jobRun = rawData.jobRun;
      }

      if (rawData.startProduction !== undefined) {
        data.startProduction = rawData.startProduction;
      }

      if (rawData.expectedRunTime !== undefined) {
        data.expectedRunTime = rawData.expectedRunTime;
      }

      const productOrder = await this.productOrderService.updateProductOrder(
        id,
        data,
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Ordem de produto atualizada com sucesso',
        data: productOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('já está cadastrada')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('não é possível atualizar')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (
          error.message.includes('inválida') ||
          error.message.includes('obrigatória')
        ) {
          res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: [{ field: 'general', message: error.message }],
          });
          return;
        }
      }

      console.error('Error updating product order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async deleteProductOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = productOrderIdSchema.parse(req.params);
      const { permanent } = deleteProductOrderSchema.parse(req.query);
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      await this.productOrderService.deleteProductOrder(
        id,
        tenantId,
        permanent
      );

      const message = permanent
        ? 'Ordem de produto excluída permanentemente'
        : 'Ordem de produto excluída com sucesso';

      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('já está excluída')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error('Error deleting product order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async restoreProductOrder(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const { id } = productOrderIdSchema.parse(req.params);
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      await this.productOrderService.restoreProductOrder(id, tenantId);

      res.status(200).json({
        success: true,
        message: 'Ordem de produto restaurada com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('não encontrada')) {
          res.status(404).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (error.message.includes('não está excluída')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
      }

      console.error('Error restoring product order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProductOrderStats(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      productOrderStatsSchema.parse(req.query);
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const stats =
        await this.productOrderService.getProductOrderStats(tenantId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting product order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
