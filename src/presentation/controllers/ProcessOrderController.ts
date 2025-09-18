import { Request, Response } from 'express';

import {
  CreateProcessOrderRequest,
  UpdateProcessOrderRequest,
} from '../../application/dto/ProcessOrderDTO';
import { ProcessOrderApplicationService } from '../../application/services/ProcessOrderApplicationService';
import {
  createProcessOrderSchema,
  deleteProcessOrderSchema,
  processOrderIdSchema,
  processOrderStatsSchema,
  searchProcessOrdersSchema,
  updateProcessOrderSchema,
} from '../validators/processOrderValidators';

export class ProcessOrderController {
  constructor(private processOrderService: ProcessOrderApplicationService) {}

  async createProcessOrder(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createProcessOrderSchema.parse(req.body);

      // Construir objeto com tipos corretos para CreateProcessOrderRequest
      const data: CreateProcessOrderRequest = {
        name: validatedData.name,
        jobRun: validatedData.jobRun,
        plannedSpeed: validatedData.plannedSpeed,
        startProduction: validatedData.startProduction,
        expectedRunTime: validatedData.expectedRunTime,
        productOrderId: validatedData.productOrderId,
      };

      // Adicionar campos opcionais apenas se não forem undefined
      if (validatedData.programmedMultiplier !== undefined) {
        data.programmedMultiplier = validatedData.programmedMultiplier;
      }
      if (validatedData.realMultiplier !== undefined) {
        data.realMultiplier = validatedData.realMultiplier;
      }
      if (validatedData.zeroSpeedThreshold !== undefined) {
        data.zeroSpeedThreshold = validatedData.zeroSpeedThreshold;
      }
      if (validatedData.productionSpeedThreshold !== undefined) {
        data.productionSpeedThreshold = validatedData.productionSpeedThreshold;
      }
      if (validatedData.zeroSpeedTimeout !== undefined) {
        data.zeroSpeedTimeout = validatedData.zeroSpeedTimeout;
      }
      if (validatedData.productionSpeedTimeout !== undefined) {
        data.productionSpeedTimeout = validatedData.productionSpeedTimeout;
      }
      if (validatedData.cycleToRun !== undefined) {
        data.cycleToRun = validatedData.cycleToRun;
      }
      if (validatedData.cycleTime !== undefined) {
        data.cycleTime = validatedData.cycleTime;
      }
      if (validatedData.machineId !== undefined) {
        data.machineId = validatedData.machineId;
      }
      if (validatedData.userId !== undefined) {
        data.userId = validatedData.userId;
      }

      const processOrder =
        await this.processOrderService.createProcessOrder(data);

      res.status(201).json({
        success: true,
        message: 'Ordem de processo criada com sucesso',
        data: processOrder,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('já existe uma ordem de processo')) {
          res.status(409).json({
            success: false,
            message: error.message,
          });
          return;
        }
        if (
          error.message.includes('inválida') ||
          error.message.includes('obrigatório')
        ) {
          res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: [{ field: 'general', message: error.message }],
          });
          return;
        }
      }

      console.error('Error creating process order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getAllProcessOrders(req: Request, res: Response): Promise<void> {
    try {
      const queryParams = searchProcessOrdersSchema.parse(req.query);
      const { page, limit, ...rawFilters } = queryParams;

      // Construir objeto de filtros com tipos corretos
      const filters: any = {};
      if (rawFilters.name !== undefined) {
        filters.name = rawFilters.name;
      }
      if (rawFilters.jobRun !== undefined) {
        filters.jobRun = rawFilters.jobRun;
      }
      if (rawFilters.plannedSpeedMin !== undefined) {
        filters.plannedSpeedMin = rawFilters.plannedSpeedMin;
      }
      if (rawFilters.plannedSpeedMax !== undefined) {
        filters.plannedSpeedMax = rawFilters.plannedSpeedMax;
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
      if (rawFilters.machineId !== undefined) {
        filters.machineId = rawFilters.machineId;
      }
      if (rawFilters.userId !== undefined) {
        filters.userId = rawFilters.userId;
      }
      if (rawFilters.productOrderId !== undefined) {
        filters.productOrderId = rawFilters.productOrderId;
      }
      if (rawFilters.includeDeleted !== undefined) {
        filters.includeDeleted = rawFilters.includeDeleted;
      }

      const result = await this.processOrderService.getAllProcessOrders(
        filters,
        page,
        limit
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('Error getting process orders:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProcessOrderById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = processOrderIdSchema.parse(req.params);
      const processOrder =
        await this.processOrderService.getProcessOrderById(id);

      res.status(200).json({
        success: true,
        data: processOrder,
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
      }

      console.error('Error getting process order by id:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProcessOrdersByProductOrder(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { productOrderId } = req.params;
      const { includeDeleted } = req.query;

      if (!productOrderId) {
        res.status(400).json({
          success: false,
          message: 'ID da ordem de produto é obrigatório',
        });
        return;
      }

      const processOrders =
        await this.processOrderService.getProcessOrdersByProductOrder(
          productOrderId,
          includeDeleted === 'true'
        );

      res.status(200).json({
        success: true,
        data: processOrders,
      });
    } catch (error) {
      console.error('Error getting process orders by product order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProcessOrdersByMachine(req: Request, res: Response): Promise<void> {
    try {
      const { machineId } = req.params;
      const { includeDeleted } = req.query;

      if (!machineId) {
        res.status(400).json({
          success: false,
          message: 'ID da máquina é obrigatório',
        });
        return;
      }

      const processOrders =
        await this.processOrderService.getProcessOrdersByMachine(
          machineId,
          includeDeleted === 'true'
        );

      res.status(200).json({
        success: true,
        data: processOrders,
      });
    } catch (error) {
      console.error('Error getting process orders by machine:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProcessOrdersByUser(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.params;
      const { includeDeleted } = req.query;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: 'ID do usuário é obrigatório',
        });
        return;
      }

      const processOrders =
        await this.processOrderService.getProcessOrdersByUser(
          userId,
          includeDeleted === 'true'
        );

      res.status(200).json({
        success: true,
        data: processOrders,
      });
    } catch (error) {
      console.error('Error getting process orders by user:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async updateProcessOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = processOrderIdSchema.parse(req.params);
      const validatedData = updateProcessOrderSchema.parse(req.body);

      // Construir objeto com tipos corretos para UpdateProcessOrderRequest
      const data: UpdateProcessOrderRequest = {};

      // Adicionar campos apenas se não forem undefined
      if (validatedData.name !== undefined) {
        data.name = validatedData.name;
      }
      if (validatedData.jobRun !== undefined) {
        data.jobRun = validatedData.jobRun;
      }
      if (validatedData.plannedSpeed !== undefined) {
        data.plannedSpeed = validatedData.plannedSpeed;
      }
      if (validatedData.startProduction !== undefined) {
        data.startProduction = validatedData.startProduction;
      }
      if (validatedData.expectedRunTime !== undefined) {
        data.expectedRunTime = validatedData.expectedRunTime;
      }
      if (validatedData.programmedMultiplier !== undefined) {
        data.programmedMultiplier = validatedData.programmedMultiplier;
      }
      if (validatedData.realMultiplier !== undefined) {
        data.realMultiplier = validatedData.realMultiplier;
      }
      if (validatedData.zeroSpeedThreshold !== undefined) {
        data.zeroSpeedThreshold = validatedData.zeroSpeedThreshold;
      }
      if (validatedData.productionSpeedThreshold !== undefined) {
        data.productionSpeedThreshold = validatedData.productionSpeedThreshold;
      }
      if (validatedData.zeroSpeedTimeout !== undefined) {
        data.zeroSpeedTimeout = validatedData.zeroSpeedTimeout;
      }
      if (validatedData.productionSpeedTimeout !== undefined) {
        data.productionSpeedTimeout = validatedData.productionSpeedTimeout;
      }
      if (validatedData.cycleToRun !== undefined) {
        data.cycleToRun = validatedData.cycleToRun;
      }
      if (validatedData.cycleTime !== undefined) {
        data.cycleTime = validatedData.cycleTime;
      }
      if (validatedData.machineId !== undefined) {
        data.machineId = validatedData.machineId;
      }
      if (validatedData.userId !== undefined) {
        data.userId = validatedData.userId;
      }

      const processOrder = await this.processOrderService.updateProcessOrder(
        id,
        data
      );

      res.status(200).json({
        success: true,
        message: 'Ordem de processo atualizada com sucesso',
        data: processOrder,
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
        if (error.message.includes('já existe uma ordem de processo')) {
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
          error.message.includes('obrigatório')
        ) {
          res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: [{ field: 'general', message: error.message }],
          });
          return;
        }
      }

      console.error('Error updating process order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async deleteProcessOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = processOrderIdSchema.parse(req.params);
      const { permanent } = deleteProcessOrderSchema.parse(req.query);
      await this.processOrderService.deleteProcessOrder(id, permanent);

      const message = permanent
        ? 'Ordem de processo excluída permanentemente'
        : 'Ordem de processo excluída com sucesso';

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

      console.error('Error deleting process order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async restoreProcessOrder(req: Request, res: Response): Promise<void> {
    try {
      const { id } = processOrderIdSchema.parse(req.params);
      await this.processOrderService.restoreProcessOrder(id);

      res.status(200).json({
        success: true,
        message: 'Ordem de processo restaurada com sucesso',
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

      console.error('Error restoring process order:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }

  async getProcessOrderStats(req: Request, res: Response): Promise<void> {
    try {
      processOrderStatsSchema.parse(req.query);
      const stats = await this.processOrderService.getProcessOrderStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error('Error getting process order stats:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
}
