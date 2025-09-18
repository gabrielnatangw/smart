import { PrismaClient } from '@prisma/client';

import {
  CreateProcessOrderData,
  IProcessOrderRepository,
  ProcessOrderFilters,
  UpdateProcessOrderData,
} from '../../../application/interfaces/IProcessOrderRepository';
import { ProcessOrder } from '../../../domain/entities/ProcessOrder';

export class PrismaProcessOrderRepository implements IProcessOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateProcessOrderData): Promise<ProcessOrder> {
    try {
      const processOrder = await this.prisma.processOrder.create({
        data: {
          process_order_id: crypto.randomUUID(),
          name: data.name,
          job_run: data.jobRun,
          planned_speed: data.plannedSpeed,
          start_production: data.startProduction,
          expected_run_time: data.expectedRunTime,
          ...(data.programmedMultiplier !== undefined && {
            programmed_multiplier: data.programmedMultiplier,
          }),
          ...(data.realMultiplier !== undefined && {
            real_multiplier: data.realMultiplier,
          }),
          ...(data.zeroSpeedThreshold !== undefined && {
            zero_speed_threshold: data.zeroSpeedThreshold,
          }),
          ...(data.productionSpeedThreshold !== undefined && {
            production_speed_threshold: data.productionSpeedThreshold,
          }),
          ...(data.zeroSpeedTimeout !== undefined && {
            zero_speed_timeout: data.zeroSpeedTimeout,
          }),
          ...(data.productionSpeedTimeout !== undefined && {
            production_speed_timeout: data.productionSpeedTimeout,
          }),
          ...(data.cycleToRun !== undefined && {
            cycle_to_run: data.cycleToRun,
          }),
          ...(data.cycleTime !== undefined && { cycle_time: data.cycleTime }),
          ...(data.machineId !== undefined && { machine_id: data.machineId }),
          ...(data.userId !== undefined && { user_id: data.userId }),
          product_order_id: data.productOrderId,
        },
      });

      return ProcessOrder.fromPersistence({
        id: processOrder.process_order_id,
        name: processOrder.name,
        jobRun: processOrder.job_run,
        plannedSpeed: processOrder.planned_speed,
        startProduction: processOrder.start_production,
        expectedRunTime: processOrder.expected_run_time,
        ...(processOrder.programmed_multiplier !== null && {
          programmedMultiplier: processOrder.programmed_multiplier,
        }),
        ...(processOrder.real_multiplier !== null && {
          realMultiplier: processOrder.real_multiplier,
        }),
        ...(processOrder.zero_speed_threshold !== null && {
          zeroSpeedThreshold: processOrder.zero_speed_threshold,
        }),
        ...(processOrder.production_speed_threshold !== null && {
          productionSpeedThreshold: processOrder.production_speed_threshold,
        }),
        ...(processOrder.zero_speed_timeout !== null && {
          zeroSpeedTimeout: processOrder.zero_speed_timeout,
        }),
        ...(processOrder.production_speed_timeout !== null && {
          productionSpeedTimeout: processOrder.production_speed_timeout,
        }),
        ...(processOrder.cycle_to_run !== null && {
          cycleToRun: processOrder.cycle_to_run,
        }),
        ...(processOrder.cycle_time !== null && {
          cycleTime: processOrder.cycle_time,
        }),
        ...(processOrder.machine_id !== null && {
          machineId: processOrder.machine_id,
        }),
        ...(processOrder.user_id !== null && { userId: processOrder.user_id }),
        productOrderId: processOrder.product_order_id,
        createdAt: processOrder.created_at,
        ...(processOrder.updated_at !== null && {
          updatedAt: processOrder.updated_at,
        }),
        ...(processOrder.deleted_at !== null && {
          deletedAt: processOrder.deleted_at,
        }),
      });
    } catch (error) {
      console.error('Error creating process order:', error);
      throw new Error('Falha ao criar ordem de processo');
    }
  }

  async findById(
    id: string,
    includeDeleted = false
  ): Promise<ProcessOrder | null> {
    try {
      const processOrder = await this.prisma.processOrder.findFirst({
        where: {
          process_order_id: id,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
      });

      if (!processOrder) return null;

      return ProcessOrder.fromPersistence({
        id: processOrder.process_order_id,
        name: processOrder.name,
        jobRun: processOrder.job_run,
        plannedSpeed: processOrder.planned_speed,
        startProduction: processOrder.start_production,
        expectedRunTime: processOrder.expected_run_time,
        ...(processOrder.programmed_multiplier !== null && {
          programmedMultiplier: processOrder.programmed_multiplier,
        }),
        ...(processOrder.real_multiplier !== null && {
          realMultiplier: processOrder.real_multiplier,
        }),
        ...(processOrder.zero_speed_threshold !== null && {
          zeroSpeedThreshold: processOrder.zero_speed_threshold,
        }),
        ...(processOrder.production_speed_threshold !== null && {
          productionSpeedThreshold: processOrder.production_speed_threshold,
        }),
        ...(processOrder.zero_speed_timeout !== null && {
          zeroSpeedTimeout: processOrder.zero_speed_timeout,
        }),
        ...(processOrder.production_speed_timeout !== null && {
          productionSpeedTimeout: processOrder.production_speed_timeout,
        }),
        ...(processOrder.cycle_to_run !== null && {
          cycleToRun: processOrder.cycle_to_run,
        }),
        ...(processOrder.cycle_time !== null && {
          cycleTime: processOrder.cycle_time,
        }),
        ...(processOrder.machine_id !== null && {
          machineId: processOrder.machine_id,
        }),
        ...(processOrder.user_id !== null && { userId: processOrder.user_id }),
        productOrderId: processOrder.product_order_id,
        createdAt: processOrder.created_at,
        ...(processOrder.updated_at !== null && {
          updatedAt: processOrder.updated_at,
        }),
        ...(processOrder.deleted_at !== null && {
          deletedAt: processOrder.deleted_at,
        }),
      });
    } catch (error) {
      console.error('Error finding process order by id:', error);
      return null;
    }
  }

  async findByName(
    name: string,
    productOrderId: string,
    includeDeleted = false
  ): Promise<ProcessOrder | null> {
    try {
      const processOrder = await this.prisma.processOrder.findFirst({
        where: {
          name,
          product_order_id: productOrderId,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
      });

      if (!processOrder) return null;

      return ProcessOrder.fromPersistence({
        id: processOrder.process_order_id,
        name: processOrder.name,
        jobRun: processOrder.job_run,
        plannedSpeed: processOrder.planned_speed,
        startProduction: processOrder.start_production,
        expectedRunTime: processOrder.expected_run_time,
        ...(processOrder.programmed_multiplier !== null && {
          programmedMultiplier: processOrder.programmed_multiplier,
        }),
        ...(processOrder.real_multiplier !== null && {
          realMultiplier: processOrder.real_multiplier,
        }),
        ...(processOrder.zero_speed_threshold !== null && {
          zeroSpeedThreshold: processOrder.zero_speed_threshold,
        }),
        ...(processOrder.production_speed_threshold !== null && {
          productionSpeedThreshold: processOrder.production_speed_threshold,
        }),
        ...(processOrder.zero_speed_timeout !== null && {
          zeroSpeedTimeout: processOrder.zero_speed_timeout,
        }),
        ...(processOrder.production_speed_timeout !== null && {
          productionSpeedTimeout: processOrder.production_speed_timeout,
        }),
        ...(processOrder.cycle_to_run !== null && {
          cycleToRun: processOrder.cycle_to_run,
        }),
        ...(processOrder.cycle_time !== null && {
          cycleTime: processOrder.cycle_time,
        }),
        ...(processOrder.machine_id !== null && {
          machineId: processOrder.machine_id,
        }),
        ...(processOrder.user_id !== null && { userId: processOrder.user_id }),
        productOrderId: processOrder.product_order_id,
        createdAt: processOrder.created_at,
        ...(processOrder.updated_at !== null && {
          updatedAt: processOrder.updated_at,
        }),
        ...(processOrder.deleted_at !== null && {
          deletedAt: processOrder.deleted_at,
        }),
      });
    } catch (error) {
      console.error('Error finding process order by name:', error);
      return null;
    }
  }

  async findAll(filters?: ProcessOrderFilters): Promise<ProcessOrder[]> {
    try {
      const whereClause = this.buildWhereClause(filters);

      const processOrders = await this.prisma.processOrder.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
      });

      return processOrders.map(processOrder =>
        ProcessOrder.fromPersistence({
          id: processOrder.process_order_id,
          name: processOrder.name,
          jobRun: processOrder.job_run,
          plannedSpeed: processOrder.planned_speed,
          startProduction: processOrder.start_production,
          expectedRunTime: processOrder.expected_run_time,
          ...(processOrder.programmed_multiplier !== null && {
            programmedMultiplier: processOrder.programmed_multiplier,
          }),
          ...(processOrder.real_multiplier !== null && {
            realMultiplier: processOrder.real_multiplier,
          }),
          ...(processOrder.zero_speed_threshold !== null && {
            zeroSpeedThreshold: processOrder.zero_speed_threshold,
          }),
          ...(processOrder.production_speed_threshold !== null && {
            productionSpeedThreshold: processOrder.production_speed_threshold,
          }),
          ...(processOrder.zero_speed_timeout !== null && {
            zeroSpeedTimeout: processOrder.zero_speed_timeout,
          }),
          ...(processOrder.production_speed_timeout !== null && {
            productionSpeedTimeout: processOrder.production_speed_timeout,
          }),
          ...(processOrder.cycle_to_run !== null && {
            cycleToRun: processOrder.cycle_to_run,
          }),
          ...(processOrder.cycle_time !== null && {
            cycleTime: processOrder.cycle_time,
          }),
          ...(processOrder.machine_id !== null && {
            machineId: processOrder.machine_id,
          }),
          ...(processOrder.user_id !== null && {
            userId: processOrder.user_id,
          }),
          productOrderId: processOrder.product_order_id,
          createdAt: processOrder.created_at,
          ...(processOrder.updated_at !== null && {
            updatedAt: processOrder.updated_at,
          }),
          ...(processOrder.deleted_at !== null && {
            deletedAt: processOrder.deleted_at,
          }),
        })
      );
    } catch (error) {
      console.error('Error finding all process orders:', error);
      return [];
    }
  }

  async findByProductOrder(
    productOrderId: string,
    includeDeleted = false
  ): Promise<ProcessOrder[]> {
    try {
      const processOrders = await this.prisma.processOrder.findMany({
        where: {
          product_order_id: productOrderId,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
        orderBy: { created_at: 'desc' },
      });

      return processOrders.map(processOrder =>
        ProcessOrder.fromPersistence({
          id: processOrder.process_order_id,
          name: processOrder.name,
          jobRun: processOrder.job_run,
          plannedSpeed: processOrder.planned_speed,
          startProduction: processOrder.start_production,
          expectedRunTime: processOrder.expected_run_time,
          ...(processOrder.programmed_multiplier !== null && {
            programmedMultiplier: processOrder.programmed_multiplier,
          }),
          ...(processOrder.real_multiplier !== null && {
            realMultiplier: processOrder.real_multiplier,
          }),
          ...(processOrder.zero_speed_threshold !== null && {
            zeroSpeedThreshold: processOrder.zero_speed_threshold,
          }),
          ...(processOrder.production_speed_threshold !== null && {
            productionSpeedThreshold: processOrder.production_speed_threshold,
          }),
          ...(processOrder.zero_speed_timeout !== null && {
            zeroSpeedTimeout: processOrder.zero_speed_timeout,
          }),
          ...(processOrder.production_speed_timeout !== null && {
            productionSpeedTimeout: processOrder.production_speed_timeout,
          }),
          ...(processOrder.cycle_to_run !== null && {
            cycleToRun: processOrder.cycle_to_run,
          }),
          ...(processOrder.cycle_time !== null && {
            cycleTime: processOrder.cycle_time,
          }),
          ...(processOrder.machine_id !== null && {
            machineId: processOrder.machine_id,
          }),
          ...(processOrder.user_id !== null && {
            userId: processOrder.user_id,
          }),
          productOrderId: processOrder.product_order_id,
          createdAt: processOrder.created_at,
          ...(processOrder.updated_at !== null && {
            updatedAt: processOrder.updated_at,
          }),
          ...(processOrder.deleted_at !== null && {
            deletedAt: processOrder.deleted_at,
          }),
        })
      );
    } catch (error) {
      console.error('Error finding process orders by product order:', error);
      return [];
    }
  }

  async findByMachine(
    machineId: string,
    includeDeleted = false
  ): Promise<ProcessOrder[]> {
    try {
      const processOrders = await this.prisma.processOrder.findMany({
        where: {
          machine_id: machineId,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
        orderBy: { created_at: 'desc' },
      });

      return processOrders.map(processOrder =>
        ProcessOrder.fromPersistence({
          id: processOrder.process_order_id,
          name: processOrder.name,
          jobRun: processOrder.job_run,
          plannedSpeed: processOrder.planned_speed,
          startProduction: processOrder.start_production,
          expectedRunTime: processOrder.expected_run_time,
          ...(processOrder.programmed_multiplier !== null && {
            programmedMultiplier: processOrder.programmed_multiplier,
          }),
          ...(processOrder.real_multiplier !== null && {
            realMultiplier: processOrder.real_multiplier,
          }),
          ...(processOrder.zero_speed_threshold !== null && {
            zeroSpeedThreshold: processOrder.zero_speed_threshold,
          }),
          ...(processOrder.production_speed_threshold !== null && {
            productionSpeedThreshold: processOrder.production_speed_threshold,
          }),
          ...(processOrder.zero_speed_timeout !== null && {
            zeroSpeedTimeout: processOrder.zero_speed_timeout,
          }),
          ...(processOrder.production_speed_timeout !== null && {
            productionSpeedTimeout: processOrder.production_speed_timeout,
          }),
          ...(processOrder.cycle_to_run !== null && {
            cycleToRun: processOrder.cycle_to_run,
          }),
          ...(processOrder.cycle_time !== null && {
            cycleTime: processOrder.cycle_time,
          }),
          ...(processOrder.machine_id !== null && {
            machineId: processOrder.machine_id,
          }),
          ...(processOrder.user_id !== null && {
            userId: processOrder.user_id,
          }),
          productOrderId: processOrder.product_order_id,
          createdAt: processOrder.created_at,
          ...(processOrder.updated_at !== null && {
            updatedAt: processOrder.updated_at,
          }),
          ...(processOrder.deleted_at !== null && {
            deletedAt: processOrder.deleted_at,
          }),
        })
      );
    } catch (error) {
      console.error('Error finding process orders by machine:', error);
      return [];
    }
  }

  async findByUser(
    userId: string,
    includeDeleted = false
  ): Promise<ProcessOrder[]> {
    try {
      const processOrders = await this.prisma.processOrder.findMany({
        where: {
          user_id: userId,
          ...(includeDeleted ? {} : { deleted_at: null }),
        },
        orderBy: { created_at: 'desc' },
      });

      return processOrders.map(processOrder =>
        ProcessOrder.fromPersistence({
          id: processOrder.process_order_id,
          name: processOrder.name,
          jobRun: processOrder.job_run,
          plannedSpeed: processOrder.planned_speed,
          startProduction: processOrder.start_production,
          expectedRunTime: processOrder.expected_run_time,
          ...(processOrder.programmed_multiplier !== null && {
            programmedMultiplier: processOrder.programmed_multiplier,
          }),
          ...(processOrder.real_multiplier !== null && {
            realMultiplier: processOrder.real_multiplier,
          }),
          ...(processOrder.zero_speed_threshold !== null && {
            zeroSpeedThreshold: processOrder.zero_speed_threshold,
          }),
          ...(processOrder.production_speed_threshold !== null && {
            productionSpeedThreshold: processOrder.production_speed_threshold,
          }),
          ...(processOrder.zero_speed_timeout !== null && {
            zeroSpeedTimeout: processOrder.zero_speed_timeout,
          }),
          ...(processOrder.production_speed_timeout !== null && {
            productionSpeedTimeout: processOrder.production_speed_timeout,
          }),
          ...(processOrder.cycle_to_run !== null && {
            cycleToRun: processOrder.cycle_to_run,
          }),
          ...(processOrder.cycle_time !== null && {
            cycleTime: processOrder.cycle_time,
          }),
          ...(processOrder.machine_id !== null && {
            machineId: processOrder.machine_id,
          }),
          ...(processOrder.user_id !== null && {
            userId: processOrder.user_id,
          }),
          productOrderId: processOrder.product_order_id,
          createdAt: processOrder.created_at,
          ...(processOrder.updated_at !== null && {
            updatedAt: processOrder.updated_at,
          }),
          ...(processOrder.deleted_at !== null && {
            deletedAt: processOrder.deleted_at,
          }),
        })
      );
    } catch (error) {
      console.error('Error finding process orders by user:', error);
      return [];
    }
  }

  async update(
    id: string,
    data: UpdateProcessOrderData
  ): Promise<ProcessOrder | null> {
    try {
      const updateData: any = {};

      if (data.name !== undefined) {
        updateData.name = data.name;
      }
      if (data.jobRun !== undefined) {
        updateData.job_run = data.jobRun;
      }
      if (data.plannedSpeed !== undefined) {
        updateData.planned_speed = data.plannedSpeed;
      }
      if (data.startProduction !== undefined) {
        updateData.start_production = data.startProduction;
      }
      if (data.expectedRunTime !== undefined) {
        updateData.expected_run_time = data.expectedRunTime;
      }
      if (data.programmedMultiplier !== undefined) {
        updateData.programmed_multiplier = data.programmedMultiplier;
      }
      if (data.realMultiplier !== undefined) {
        updateData.real_multiplier = data.realMultiplier;
      }
      if (data.zeroSpeedThreshold !== undefined) {
        updateData.zero_speed_threshold = data.zeroSpeedThreshold;
      }
      if (data.productionSpeedThreshold !== undefined) {
        updateData.production_speed_threshold = data.productionSpeedThreshold;
      }
      if (data.zeroSpeedTimeout !== undefined) {
        updateData.zero_speed_timeout = data.zeroSpeedTimeout;
      }
      if (data.productionSpeedTimeout !== undefined) {
        updateData.production_speed_timeout = data.productionSpeedTimeout;
      }
      if (data.cycleToRun !== undefined) {
        updateData.cycle_to_run = data.cycleToRun;
      }
      if (data.cycleTime !== undefined) {
        updateData.cycle_time = data.cycleTime;
      }
      if (data.machineId !== undefined) {
        updateData.machine_id = data.machineId;
      }
      if (data.userId !== undefined) {
        updateData.user_id = data.userId;
      }

      updateData.updated_at = new Date();

      const processOrder = await this.prisma.processOrder.update({
        where: { process_order_id: id },
        data: updateData,
      });

      return ProcessOrder.fromPersistence({
        id: processOrder.process_order_id,
        name: processOrder.name,
        jobRun: processOrder.job_run,
        plannedSpeed: processOrder.planned_speed,
        startProduction: processOrder.start_production,
        expectedRunTime: processOrder.expected_run_time,
        ...(processOrder.programmed_multiplier !== null && {
          programmedMultiplier: processOrder.programmed_multiplier,
        }),
        ...(processOrder.real_multiplier !== null && {
          realMultiplier: processOrder.real_multiplier,
        }),
        ...(processOrder.zero_speed_threshold !== null && {
          zeroSpeedThreshold: processOrder.zero_speed_threshold,
        }),
        ...(processOrder.production_speed_threshold !== null && {
          productionSpeedThreshold: processOrder.production_speed_threshold,
        }),
        ...(processOrder.zero_speed_timeout !== null && {
          zeroSpeedTimeout: processOrder.zero_speed_timeout,
        }),
        ...(processOrder.production_speed_timeout !== null && {
          productionSpeedTimeout: processOrder.production_speed_timeout,
        }),
        ...(processOrder.cycle_to_run !== null && {
          cycleToRun: processOrder.cycle_to_run,
        }),
        ...(processOrder.cycle_time !== null && {
          cycleTime: processOrder.cycle_time,
        }),
        ...(processOrder.machine_id !== null && {
          machineId: processOrder.machine_id,
        }),
        ...(processOrder.user_id !== null && { userId: processOrder.user_id }),
        productOrderId: processOrder.product_order_id,
        createdAt: processOrder.created_at,
        ...(processOrder.updated_at !== null && {
          updatedAt: processOrder.updated_at,
        }),
        ...(processOrder.deleted_at !== null && {
          deletedAt: processOrder.deleted_at,
        }),
      });
    } catch (error) {
      console.error('Error updating process order:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.processOrder.delete({
        where: { process_order_id: id },
      });
      return true;
    } catch (error) {
      console.error('Error deleting process order:', error);
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    try {
      await this.prisma.processOrder.update({
        where: { process_order_id: id },
        data: {
          deleted_at: new Date(),
          updated_at: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error soft deleting process order:', error);
      return false;
    }
  }

  async restore(id: string): Promise<boolean> {
    try {
      await this.prisma.processOrder.update({
        where: { process_order_id: id },
        data: {
          deleted_at: null,
          updated_at: new Date(),
        },
      });
      return true;
    } catch (error) {
      console.error('Error restoring process order:', error);
      return false;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.prisma.processOrder.count({
        where: {
          process_order_id: id,
          deleted_at: null,
        },
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking if process order exists:', error);
      return false;
    }
  }

  async existsByName(
    name: string,
    productOrderId: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const whereClause: any = {
        name,
        product_order_id: productOrderId,
        deleted_at: null,
      };

      if (excludeId) {
        whereClause.process_order_id = { not: excludeId };
      }

      const count = await this.prisma.processOrder.count({
        where: whereClause,
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking if process order name exists:', error);
      return false;
    }
  }

  async count(filters?: ProcessOrderFilters): Promise<number> {
    try {
      const whereClause = this.buildWhereClause(filters);
      return await this.prisma.processOrder.count({ where: whereClause });
    } catch (error) {
      console.error('Error counting process orders:', error);
      return 0;
    }
  }

  private buildWhereClause(filters?: ProcessOrderFilters): any {
    const whereClause: any = {};

    if (filters?.name) {
      whereClause.name = { contains: filters.name, mode: 'insensitive' };
    }

    if (filters?.jobRun) {
      whereClause.job_run = filters.jobRun;
    }

    if (filters?.plannedSpeedMin || filters?.plannedSpeedMax) {
      whereClause.planned_speed = {};
      if (filters.plannedSpeedMin) {
        whereClause.planned_speed.gte = filters.plannedSpeedMin;
      }
      if (filters.plannedSpeedMax) {
        whereClause.planned_speed.lte = filters.plannedSpeedMax;
      }
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

    if (filters?.machineId) {
      whereClause.machine_id = filters.machineId;
    }

    if (filters?.userId) {
      whereClause.user_id = filters.userId;
    }

    if (filters?.productOrderId) {
      whereClause.product_order_id = filters.productOrderId;
    }

    if (!filters?.includeDeleted) {
      whereClause.deleted_at = null;
    }

    return whereClause;
  }
}
