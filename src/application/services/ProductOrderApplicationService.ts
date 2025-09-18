import { ProductOrder } from '../../domain/entities/ProductOrder';
import {
  CreateProductOrderRequest,
  ProductOrderListResponse,
  ProductOrderResponse,
  ProductOrderStatsResponse,
  UpdateProductOrderRequest,
} from '../dto/ProductOrderDTO';
import { IProductOrderRepository } from '../interfaces/IProductOrderRepository';

export class ProductOrderApplicationService {
  constructor(private productOrderRepository: IProductOrderRepository) {}

  async createProductOrder(
    data: CreateProductOrderRequest,
    tenantId: string
  ): Promise<ProductOrderResponse> {
    // Validar se a ordem de produção já existe
    const existingProductOrder =
      await this.productOrderRepository.findByProductionOrder(
        data.productionOrder,
        tenantId
      );

    if (existingProductOrder) {
      throw new Error('Ordem de produção já está cadastrada para este tenant');
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
    const productOrder = ProductOrder.create({
      productionOrder: data.productionOrder,
      name: data.name,
      jobRun: data.jobRun,
      startProduction,
      expectedRunTime,
      tenantId,
    });

    // Persistir no repositório
    const savedProductOrder = await this.productOrderRepository.create({
      productionOrder: productOrder.productionOrder,
      name: productOrder.name,
      jobRun: productOrder.jobRun,
      startProduction: productOrder.startProduction,
      expectedRunTime: productOrder.expectedRunTime,
      tenantId: productOrder.tenantId,
    });

    return this.mapToResponse(savedProductOrder);
  }

  async getProductOrderById(
    id: string,
    tenantId: string
  ): Promise<ProductOrderResponse> {
    const productOrder = await this.productOrderRepository.findById(id);

    if (!productOrder) {
      throw new Error('Ordem de produto não encontrada');
    }

    if (productOrder.tenantId !== tenantId) {
      throw new Error('Ordem de produto não pertence ao tenant');
    }

    return this.mapToResponse(productOrder);
  }

  async getAllProductOrders(
    filters: {
      productionOrder?: string;
      name?: string;
      jobRun?: number;
      startProductionFrom?: string;
      startProductionTo?: string;
      expectedRunTimeFrom?: string;
      expectedRunTimeTo?: string;
      includeDeleted?: boolean;
    },
    tenantId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<ProductOrderListResponse> {
    // Validar parâmetros de paginação
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;

    // Construir filtros
    const repositoryFilters: any = {};

    if (filters.productionOrder) {
      repositoryFilters.productionOrder = filters.productionOrder;
    }

    if (filters.name) {
      repositoryFilters.name = filters.name;
    }

    if (filters.jobRun) {
      repositoryFilters.jobRun = filters.jobRun;
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

    if (filters.includeDeleted) {
      repositoryFilters.includeDeleted = filters.includeDeleted;
    }

    // Buscar dados
    const [productOrders, total] = await Promise.all([
      this.productOrderRepository.findAll(repositoryFilters, tenantId),
      this.productOrderRepository.count(repositoryFilters, tenantId),
    ]);

    // Aplicar paginação
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProductOrders = productOrders.slice(startIndex, endIndex);

    // Calcular informações de paginação
    const pages = Math.ceil(total / limit);
    const hasNext = page < pages;
    const hasPrev = page > 1;

    return {
      productOrders: paginatedProductOrders.map(this.mapToResponse),
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

  async updateProductOrder(
    id: string,
    data: UpdateProductOrderRequest,
    tenantId: string
  ): Promise<ProductOrderResponse> {
    // Verificar se a ordem de produto existe
    const existingProductOrder = await this.productOrderRepository.findById(id);

    if (!existingProductOrder) {
      throw new Error('Ordem de produto não encontrada');
    }

    if (existingProductOrder.tenantId !== tenantId) {
      throw new Error('Ordem de produto não pertence ao tenant');
    }

    if (existingProductOrder.isDeleted) {
      throw new Error('Não é possível atualizar uma ordem de produto excluída');
    }

    // Validar unicidade da ordem de produção se estiver sendo alterada
    if (
      data.productionOrder &&
      data.productionOrder !== existingProductOrder.productionOrder
    ) {
      const duplicateExists =
        await this.productOrderRepository.existsByProductionOrder(
          data.productionOrder,
          tenantId,
          id
        );

      if (duplicateExists) {
        throw new Error(
          'Ordem de produção já está cadastrada por outra ordem de produto'
        );
      }
    }

    // Validar datas se estiverem sendo alteradas
    let startProduction = existingProductOrder.startProduction;
    let expectedRunTime = existingProductOrder.expectedRunTime;

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
    const updateData: {
      productionOrder?: string;
      name?: string;
      jobRun?: number;
      startProduction?: Date;
      expectedRunTime?: Date;
    } = {};

    if (data.productionOrder !== undefined) {
      updateData.productionOrder = data.productionOrder;
    }

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.jobRun !== undefined) {
      updateData.jobRun = data.jobRun;
    }

    if (startProduction !== undefined) {
      updateData.startProduction = startProduction;
    }

    if (expectedRunTime !== undefined) {
      updateData.expectedRunTime = expectedRunTime;
    }

    existingProductOrder.update(updateData);

    // Persistir no repositório
    const updatedProductOrder = await this.productOrderRepository.update(id, {
      productionOrder: existingProductOrder.productionOrder,
      name: existingProductOrder.name,
      jobRun: existingProductOrder.jobRun,
      startProduction: existingProductOrder.startProduction,
      expectedRunTime: existingProductOrder.expectedRunTime,
    });

    if (!updatedProductOrder) {
      throw new Error('Falha ao atualizar ordem de produto');
    }

    return this.mapToResponse(updatedProductOrder);
  }

  async deleteProductOrder(
    id: string,
    tenantId: string,
    permanent: boolean = false
  ): Promise<void> {
    // Verificar se a ordem de produto existe
    const existingProductOrder = await this.productOrderRepository.findById(id);

    if (!existingProductOrder) {
      throw new Error('Ordem de produto não encontrada');
    }

    if (existingProductOrder.tenantId !== tenantId) {
      throw new Error('Ordem de produto não pertence ao tenant');
    }

    if (existingProductOrder.isDeleted && !permanent) {
      throw new Error('Ordem de produto já está excluída');
    }

    // Executar exclusão
    let success: boolean;

    if (permanent) {
      success = await this.productOrderRepository.delete(id);
    } else {
      success = await this.productOrderRepository.softDelete(id);
    }

    if (!success) {
      throw new Error('Falha ao excluir ordem de produto');
    }
  }

  async restoreProductOrder(id: string, tenantId: string): Promise<void> {
    // Verificar se a ordem de produto existe (incluindo excluídas)
    const existingProductOrder = await this.productOrderRepository.findById(
      id,
      true
    );

    if (!existingProductOrder) {
      throw new Error('Ordem de produto não encontrada');
    }

    if (existingProductOrder.tenantId !== tenantId) {
      throw new Error('Ordem de produto não pertence ao tenant');
    }

    if (!existingProductOrder.isDeleted) {
      throw new Error('Ordem de produto não está excluída');
    }

    // Restaurar
    const success = await this.productOrderRepository.restore(id);

    if (!success) {
      throw new Error('Falha ao restaurar ordem de produto');
    }
  }

  async getProductOrderStats(
    tenantId: string
  ): Promise<ProductOrderStatsResponse> {
    const [total, active, _deleted] = await Promise.all([
      this.productOrderRepository.count({}, tenantId),
      this.productOrderRepository.count({ includeDeleted: false }, tenantId),
      this.productOrderRepository.count({ includeDeleted: true }, tenantId),
    ]);

    // Buscar estatísticas por ordem de produção
    const allProductOrders = await this.productOrderRepository.findAll(
      { includeDeleted: false },
      tenantId
    );
    const byProductionOrder = this.groupByProductionOrder(allProductOrders);
    const byJobRun = this.groupByJobRun(allProductOrders);

    return {
      total,
      active,
      deleted: total - active,
      byProductionOrder,
      byJobRun,
    };
  }

  private mapToResponse(productOrder: ProductOrder): ProductOrderResponse {
    return {
      id: productOrder.id,
      productionOrder: productOrder.productionOrder,
      name: productOrder.name,
      jobRun: productOrder.jobRun,
      startProduction: productOrder.startProduction.toISOString(),
      expectedRunTime: productOrder.expectedRunTime.toISOString(),
      tenantId: productOrder.tenantId,
      isDeleted: productOrder.isDeleted,
      createdAt: productOrder.createdAt.toISOString(),
      updatedAt:
        productOrder.updatedAt?.toISOString() ||
        productOrder.createdAt.toISOString(),
      deletedAt: productOrder.deletedAt?.toISOString() || null,
    };
  }

  private groupByProductionOrder(
    productOrders: ProductOrder[]
  ): Array<{ productionOrder: string; count: number }> {
    const groups = new Map<string, number>();

    productOrders.forEach(productOrder => {
      const key = productOrder.productionOrder;
      groups.set(key, (groups.get(key) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([productionOrder, count]) => ({
      productionOrder,
      count,
    }));
  }

  private groupByJobRun(
    productOrders: ProductOrder[]
  ): Array<{ jobRun: number; count: number }> {
    const groups = new Map<number, number>();

    productOrders.forEach(productOrder => {
      const key = productOrder.jobRun;
      groups.set(key, (groups.get(key) || 0) + 1);
    });

    return Array.from(groups.entries()).map(([jobRun, count]) => ({
      jobRun,
      count,
    }));
  }
}
