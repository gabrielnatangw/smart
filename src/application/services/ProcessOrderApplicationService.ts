import { ProcessOrder } from '../../domain/entities/ProcessOrder';
import {
  CreateProcessOrderRequest,
  ProcessOrderListResponse,
  ProcessOrderResponse,
  ProcessOrderStatsResponse,
  UpdateProcessOrderRequest,
} from '../dto/ProcessOrderDTO';
import { IProcessOrderRepository } from '../interfaces/IProcessOrderRepository';

export class ProcessOrderApplicationService {
  constructor(private processOrderRepository: IProcessOrderRepository) {}

  async createProcessOrder(
    data: CreateProcessOrderRequest
  ): Promise<ProcessOrderResponse> {
    // Validar se já existe uma ordem de processo com o mesmo nome para a mesma ordem de produto
    const existingProcessOrder = await this.processOrderRepository.findByName(
      data.name,
      data.productOrderId
    );

    if (existingProcessOrder) {
      throw new Error(
        'Já existe uma ordem de processo com este nome para esta ordem de produto'
      );
    }

    // Validar datas
    const startProduction = new Date(data.startProduction);
    const expectedRunTime = new Date(data.expectedRunTime);

    if (isNaN(startProduction.getTime()) || isNaN(expectedRunTime.getTime())) {
      throw new Error('Datas inválidas');
    }

    if (expectedRunTime <= startProduction) {
      throw new Error(
        'Tempo esperado de execução deve ser posterior ao início da produção'
      );
    }

    // Criar a entidade
    const processOrder = ProcessOrder.create({
      name: data.name,
      jobRun: data.jobRun,
      plannedSpeed: data.plannedSpeed,
      startProduction,
      expectedRunTime,
      ...(data.programmedMultiplier !== undefined && {
        programmedMultiplier: data.programmedMultiplier,
      }),
      ...(data.realMultiplier !== undefined && {
        realMultiplier: data.realMultiplier,
      }),
      ...(data.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: data.zeroSpeedThreshold,
      }),
      ...(data.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: data.productionSpeedThreshold,
      }),
      ...(data.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: data.zeroSpeedTimeout,
      }),
      ...(data.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: data.productionSpeedTimeout,
      }),
      ...(data.cycleToRun !== undefined && { cycleToRun: data.cycleToRun }),
      ...(data.cycleTime !== undefined && { cycleTime: data.cycleTime }),
      machineId: data.machineId || '',
      userId: data.userId || '',
      productOrderId: data.productOrderId,
    });

    // Persistir no repositório
    const savedProcessOrder = await this.processOrderRepository.create({
      name: processOrder.name,
      jobRun: processOrder.jobRun,
      plannedSpeed: processOrder.plannedSpeed,
      startProduction: processOrder.startProduction,
      expectedRunTime: processOrder.expectedRunTime,
      ...(processOrder.programmedMultiplier !== undefined && {
        programmedMultiplier: processOrder.programmedMultiplier,
      }),
      ...(processOrder.realMultiplier !== undefined && {
        realMultiplier: processOrder.realMultiplier,
      }),
      ...(processOrder.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: processOrder.zeroSpeedThreshold,
      }),
      ...(processOrder.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: processOrder.productionSpeedThreshold,
      }),
      ...(processOrder.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: processOrder.zeroSpeedTimeout,
      }),
      ...(processOrder.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: processOrder.productionSpeedTimeout,
      }),
      ...(processOrder.cycleToRun !== undefined && {
        cycleToRun: processOrder.cycleToRun,
      }),
      ...(processOrder.cycleTime !== undefined && {
        cycleTime: processOrder.cycleTime,
      }),
      machineId: processOrder.machineId || '',
      userId: processOrder.userId || '',
      productOrderId: processOrder.productOrderId,
    });

    return this.mapToResponse(savedProcessOrder);
  }

  async getProcessOrderById(id: string): Promise<ProcessOrderResponse> {
    const processOrder = await this.processOrderRepository.findById(id);

    if (!processOrder) {
      throw new Error('Ordem de processo não encontrada');
    }

    return this.mapToResponse(processOrder);
  }

  async getAllProcessOrders(
    filters: {
      name?: string;
      jobRun?: number;
      plannedSpeedMin?: number;
      plannedSpeedMax?: number;
      startProductionFrom?: string;
      startProductionTo?: string;
      expectedRunTimeFrom?: string;
      expectedRunTimeTo?: string;
      machineId?: string;
      userId?: string;
      productOrderId?: string;
      includeDeleted?: boolean;
    },
    page: number = 1,
    limit: number = 10
  ): Promise<ProcessOrderListResponse> {
    // Validar parâmetros de paginação
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    // Construir filtros
    const repositoryFilters: any = {};

    if (filters.name) {
      repositoryFilters.name = filters.name;
    }

    if (filters.jobRun) {
      repositoryFilters.jobRun = filters.jobRun;
    }

    if (filters.plannedSpeedMin || filters.plannedSpeedMax) {
      if (filters.plannedSpeedMin) {
        repositoryFilters.plannedSpeedMin = filters.plannedSpeedMin;
      }
      if (filters.plannedSpeedMax) {
        repositoryFilters.plannedSpeedMax = filters.plannedSpeedMax;
      }
    }

    if (filters.startProductionFrom || filters.startProductionTo) {
      if (filters.startProductionFrom) {
        repositoryFilters.startProductionFrom = new Date(
          filters.startProductionFrom
        );
      }
      if (filters.startProductionTo) {
        repositoryFilters.startProductionTo = new Date(
          filters.startProductionTo
        );
      }
    }

    if (filters.expectedRunTimeFrom || filters.expectedRunTimeTo) {
      if (filters.expectedRunTimeFrom) {
        repositoryFilters.expectedRunTimeFrom = new Date(
          filters.expectedRunTimeFrom
        );
      }
      if (filters.expectedRunTimeTo) {
        repositoryFilters.expectedRunTimeTo = new Date(
          filters.expectedRunTimeTo
        );
      }
    }

    if (filters.machineId) {
      repositoryFilters.machineId = filters.machineId;
    }

    if (filters.userId) {
      repositoryFilters.userId = filters.userId;
    }

    if (filters.productOrderId) {
      repositoryFilters.productOrderId = filters.productOrderId;
    }

    if (filters.includeDeleted) {
      repositoryFilters.includeDeleted = filters.includeDeleted;
    }

    // Buscar dados
    const [processOrders, total] = await Promise.all([
      this.processOrderRepository.findAll(repositoryFilters),
      this.processOrderRepository.count(repositoryFilters),
    ]);

    // Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProcessOrders = processOrders.slice(startIndex, endIndex);

    // Calcular informações de paginação
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      processOrders: paginatedProcessOrders.map(this.mapToResponse),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext,
        hasPrev,
      },
    };
  }

  async getProcessOrdersByProductOrder(
    productOrderId: string,
    includeDeleted = false
  ): Promise<ProcessOrderResponse[]> {
    const processOrders = await this.processOrderRepository.findByProductOrder(
      productOrderId,
      includeDeleted
    );
    return processOrders.map(this.mapToResponse);
  }

  async getProcessOrdersByMachine(
    machineId: string,
    includeDeleted = false
  ): Promise<ProcessOrderResponse[]> {
    const processOrders = await this.processOrderRepository.findByMachine(
      machineId,
      includeDeleted
    );
    return processOrders.map(this.mapToResponse);
  }

  async getProcessOrdersByUser(
    userId: string,
    includeDeleted = false
  ): Promise<ProcessOrderResponse[]> {
    const processOrders = await this.processOrderRepository.findByUser(
      userId,
      includeDeleted
    );
    return processOrders.map(this.mapToResponse);
  }

  async updateProcessOrder(
    id: string,
    data: UpdateProcessOrderRequest
  ): Promise<ProcessOrderResponse> {
    // Verificar se a ordem de processo existe
    const existingProcessOrder = await this.processOrderRepository.findById(id);

    if (!existingProcessOrder) {
      throw new Error('Ordem de processo não encontrada');
    }

    if (existingProcessOrder.isDeleted) {
      throw new Error(
        'Não é possível atualizar uma ordem de processo excluída'
      );
    }

    // Validar unicidade do nome se estiver sendo alterado
    if (data.name && data.name !== existingProcessOrder.name) {
      const duplicateExists = await this.processOrderRepository.existsByName(
        data.name,
        existingProcessOrder.productOrderId,
        id
      );

      if (duplicateExists) {
        throw new Error(
          'Já existe uma ordem de processo com este nome para esta ordem de produto'
        );
      }
    }

    // Validar datas se estiverem sendo alteradas
    let startProduction = existingProcessOrder.startProduction;
    let expectedRunTime = existingProcessOrder.expectedRunTime;

    if (data.startProduction) {
      startProduction = new Date(data.startProduction);
      if (isNaN(startProduction.getTime())) {
        throw new Error('Data de início de produção inválida');
      }
    }

    if (data.expectedRunTime) {
      expectedRunTime = new Date(data.expectedRunTime);
      if (isNaN(expectedRunTime.getTime())) {
        throw new Error('Data de tempo esperado inválida');
      }
    }

    if (expectedRunTime <= startProduction) {
      throw new Error(
        'Tempo esperado de execução deve ser posterior ao início da produção'
      );
    }

    // Atualizar a entidade
    existingProcessOrder.update({
      ...(data.name !== undefined && { name: data.name }),
      ...(data.jobRun !== undefined && { jobRun: data.jobRun }),
      ...(data.plannedSpeed !== undefined && {
        plannedSpeed: data.plannedSpeed,
      }),
      startProduction,
      expectedRunTime,
      ...(data.programmedMultiplier !== undefined && {
        programmedMultiplier: data.programmedMultiplier,
      }),
      ...(data.realMultiplier !== undefined && {
        realMultiplier: data.realMultiplier,
      }),
      ...(data.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: data.zeroSpeedThreshold,
      }),
      ...(data.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: data.productionSpeedThreshold,
      }),
      ...(data.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: data.zeroSpeedTimeout,
      }),
      ...(data.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: data.productionSpeedTimeout,
      }),
      ...(data.cycleToRun !== undefined && { cycleToRun: data.cycleToRun }),
      ...(data.cycleTime !== undefined && { cycleTime: data.cycleTime }),
      machineId: data.machineId || '',
      ...(data.userId !== undefined && { userId: data.userId }),
    });

    // Persistir no repositório
    const updatedProcessOrder = await this.processOrderRepository.update(id, {
      name: existingProcessOrder.name,
      jobRun: existingProcessOrder.jobRun,
      plannedSpeed: existingProcessOrder.plannedSpeed,
      startProduction: existingProcessOrder.startProduction,
      expectedRunTime: existingProcessOrder.expectedRunTime,
      ...(existingProcessOrder.programmedMultiplier !== undefined && {
        programmedMultiplier: existingProcessOrder.programmedMultiplier,
      }),
      ...(existingProcessOrder.realMultiplier !== undefined && {
        realMultiplier: existingProcessOrder.realMultiplier,
      }),
      ...(existingProcessOrder.zeroSpeedThreshold !== undefined && {
        zeroSpeedThreshold: existingProcessOrder.zeroSpeedThreshold,
      }),
      ...(existingProcessOrder.productionSpeedThreshold !== undefined && {
        productionSpeedThreshold: existingProcessOrder.productionSpeedThreshold,
      }),
      ...(existingProcessOrder.zeroSpeedTimeout !== undefined && {
        zeroSpeedTimeout: existingProcessOrder.zeroSpeedTimeout,
      }),
      ...(existingProcessOrder.productionSpeedTimeout !== undefined && {
        productionSpeedTimeout: existingProcessOrder.productionSpeedTimeout,
      }),
      ...(existingProcessOrder.cycleToRun !== undefined && {
        cycleToRun: existingProcessOrder.cycleToRun,
      }),
      ...(existingProcessOrder.cycleTime !== undefined && {
        cycleTime: existingProcessOrder.cycleTime,
      }),
      machineId: existingProcessOrder.machineId || '',
      ...(existingProcessOrder.userId !== undefined && {
        userId: existingProcessOrder.userId,
      }),
    });

    if (!updatedProcessOrder) {
      throw new Error('Falha ao atualizar ordem de processo');
    }

    return this.mapToResponse(updatedProcessOrder);
  }

  async deleteProcessOrder(
    id: string,
    permanent: boolean = false
  ): Promise<void> {
    // Verificar se a ordem de processo existe
    const existingProcessOrder = await this.processOrderRepository.findById(id);

    if (!existingProcessOrder) {
      throw new Error('Ordem de processo não encontrada');
    }

    if (existingProcessOrder.isDeleted && !permanent) {
      throw new Error('Ordem de processo já está excluída');
    }

    // Executar exclusão
    let success: boolean;

    if (permanent) {
      success = await this.processOrderRepository.delete(id);
    } else {
      success = await this.processOrderRepository.softDelete(id);
    }

    if (!success) {
      throw new Error('Falha ao excluir ordem de processo');
    }
  }

  async restoreProcessOrder(id: string): Promise<void> {
    // Verificar se a ordem de processo existe (incluindo excluídas)
    const existingProcessOrder = await this.processOrderRepository.findById(
      id,
      true
    );

    if (!existingProcessOrder) {
      throw new Error('Ordem de processo não encontrada');
    }

    if (!existingProcessOrder.isDeleted) {
      throw new Error('Ordem de processo não está excluída');
    }

    // Restaurar
    const success = await this.processOrderRepository.restore(id);

    if (!success) {
      throw new Error('Falha ao restaurar ordem de processo');
    }
  }

  async getProcessOrderStats(): Promise<ProcessOrderStatsResponse> {
    const [total, active, _deleted] = await Promise.all([
      this.processOrderRepository.count({}),
      this.processOrderRepository.count({ includeDeleted: false }),
      this.processOrderRepository.count({ includeDeleted: true }),
    ]);

    // Buscar estatísticas detalhadas
    const allProcessOrders = await this.processOrderRepository.findAll({
      includeDeleted: false,
    });
    const byProductOrder = this.groupByProductOrder(allProcessOrders);
    const byMachine = this.groupByMachine(allProcessOrders);
    const byUser = this.groupByUser(allProcessOrders);
    const averagePlannedSpeed =
      this.calculateAveragePlannedSpeed(allProcessOrders);
    const averageRealMultiplier =
      this.calculateAverageRealMultiplier(allProcessOrders);

    return {
      total,
      active,
      deleted: total - active,
      byProductOrder,
      byMachine,
      byUser,
      averagePlannedSpeed,
      averageRealMultiplier,
    };
  }

  private mapToResponse(processOrder: ProcessOrder): ProcessOrderResponse {
    return {
      id: processOrder.id,
      name: processOrder.name,
      jobRun: processOrder.jobRun,
      plannedSpeed: processOrder.plannedSpeed,
      startProduction: processOrder.startProduction.toISOString(),
      expectedRunTime: processOrder.expectedRunTime.toISOString(),
      programmedMultiplier: processOrder.programmedMultiplier || null,
      realMultiplier: processOrder.realMultiplier || null,
      zeroSpeedThreshold: processOrder.zeroSpeedThreshold || null,
      productionSpeedThreshold: processOrder.productionSpeedThreshold || null,
      zeroSpeedTimeout: processOrder.zeroSpeedTimeout || null,
      productionSpeedTimeout: processOrder.productionSpeedTimeout || null,
      cycleToRun: processOrder.cycleToRun || null,
      cycleTime: processOrder.cycleTime || null,
      machineId: processOrder.machineId || null,
      userId: processOrder.userId || null,
      productOrderId: processOrder.productOrderId,
      isDeleted: processOrder.isDeleted,
      createdAt: processOrder.createdAt.toISOString(),
      updatedAt:
        processOrder.updatedAt?.toISOString() ||
        processOrder.createdAt.toISOString(),
      deletedAt: processOrder.deletedAt?.toISOString() || null,
    };
  }

  private groupByProductOrder(
    processOrders: ProcessOrder[]
  ): Array<{ productOrderId: string; count: number }> {
    const groups = new Map<string, number>();

    processOrders.forEach(processOrder => {
      const key = processOrder.productOrderId;
      groups.set(key, (groups.get(key) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([productOrderId, count]) => ({
      productOrderId,
      count,
    }));
  }

  private groupByMachine(
    processOrders: ProcessOrder[]
  ): Array<{ machineId: string; count: number }> {
    const groups = new Map<string, number>();

    processOrders.forEach(processOrder => {
      if (processOrder.machineId) {
        const key = processOrder.machineId;
        groups.set(key, (groups.get(key) || 0) + 1);
      }
    });

    return Array.from(groups.entries()).map(([machineId, count]) => ({
      machineId,
      count,
    }));
  }

  private groupByUser(
    processOrders: ProcessOrder[]
  ): Array<{ userId: string; count: number }> {
    const groups = new Map<string, number>();

    processOrders.forEach(processOrder => {
      if (processOrder.userId) {
        const key = processOrder.userId;
        groups.set(key, (groups.get(key) || 0) + 1);
      }
    });

    return Array.from(groups.entries()).map(([userId, count]) => ({
      userId,
      count,
    }));
  }

  private calculateAveragePlannedSpeed(processOrders: ProcessOrder[]): number {
    if (processOrders.length === 0) return 0;
    const total = processOrders.reduce(
      (sum, order) => sum + order.plannedSpeed,
      0
    );
    return total / processOrders.length;
  }

  private calculateAverageRealMultiplier(
    processOrders: ProcessOrder[]
  ): number {
    const ordersWithMultiplier = processOrders.filter(
      order => order.realMultiplier !== undefined
    );
    if (ordersWithMultiplier.length === 0) return 0;
    const total = ordersWithMultiplier.reduce(
      (sum, order) => sum + (order.realMultiplier || 0),
      0
    );
    return total / ordersWithMultiplier.length;
  }
}
