import { v4 as uuidv4 } from 'uuid';

import { View } from '../../domain/entities/View';
import { ViewCard } from '../../domain/entities/ViewCard';
import { IMachineRepository } from '../interfaces/IMachineRepository';
import { IModuleRepository } from '../interfaces/IModuleRepository';
import { ISensorCurrentValueRepository } from '../interfaces/ISensorCurrentValueRepository';
import { ISensorRepository } from '../interfaces/ISensorRepository';
import {
  CreateViewCardData,
  IViewCardRepository,
  UpdateViewCardData,
} from '../interfaces/IViewCardRepository';
import {
  CreateViewData,
  IViewRepository,
  UpdateViewData,
  ViewFilters,
} from '../interfaces/IViewRepository';

export class ViewApplicationService {
  constructor(
    private viewRepository: IViewRepository,
    private viewCardRepository: IViewCardRepository,
    private sensorCurrentValueRepository: ISensorCurrentValueRepository,
    private sensorRepository: ISensorRepository,
    private moduleRepository: IModuleRepository,
    private machineRepository: IMachineRepository
  ) {}

  async createView(data: {
    name: string;
    isDefault?: boolean;
    isPublic?: boolean;
    isActive?: boolean;
    tenantId: string;
    userId: string;
    createdBy: string;
  }): Promise<View> {
    try {
      const viewData: CreateViewData = {
        ...data,
        updatedBy: data.createdBy,
      };

      const _view = View.create({
        id: uuidv4(),
        ...viewData,
      });

      return await this.viewRepository.create(viewData);
    } catch (error: any) {
      throw error;
    }
  }

  async getViewById(id: string, tenantId: string): Promise<View | null> {
    try {
      const view = await this.viewRepository.findById(id);

      if (!view || view.tenantId !== tenantId) {
        return null;
      }

      return view;
    } catch (error: any) {
      throw error;
    }
  }

  async getViewWithData(id: string, tenantId: string): Promise<View | null> {
    try {
      const view = await this.getViewById(id, tenantId);

      if (!view) {
        return null;
      }

      // Buscar cards da view
      const cards = await this.viewCardRepository.findByView(id, tenantId);

      // Buscar dados atuais dos sensores para cada card
      const cardsWithData = await Promise.all(
        cards.map(async card => {
          const currentValue =
            await this.sensorCurrentValueRepository.findBySensor(
              card.sensorId,
              tenantId
            );

          return {
            ...card,
            currentValue,
          };
        })
      );

      return {
        ...view,
        cards: cardsWithData,
      } as any;
    } catch (error: any) {
      throw error;
    }
  }

  async getViewsByTenant(
    tenantId: string,
    filters?: {
      userId?: string;
      isPublic?: boolean;
      isActive?: boolean;
      name?: string;
    }
  ): Promise<View[]> {
    try {
      const viewFilters: ViewFilters = {
        tenantId,
        ...filters,
      };

      return await this.viewRepository.findByTenant(tenantId, viewFilters);
    } catch (error: any) {
      throw error;
    }
  }

  async getViewsByUser(userId: string, tenantId: string): Promise<View[]> {
    try {
      return await this.viewRepository.findByUser(userId, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async getViewsByUserWithData(
    userId: string,
    tenantId: string
  ): Promise<View[]> {
    try {
      return await this.viewRepository.findByUserWithCards(userId, tenantId);
    } catch (error: any) {
      throw error;
    }
  }

  async updateView(
    id: string,
    data: {
      name?: string;
      isDefault?: boolean;
      isPublic?: boolean;
      isActive?: boolean;
      updatedBy: string;
    }
  ): Promise<View> {
    try {
      const existingView = await this.viewRepository.findById(id);

      if (!existingView) {
        throw new Error('View not found');
      }

      if (existingView.isDeleted) {
        throw new Error('Cannot update deleted view');
      }

      const updateData: UpdateViewData = {
        ...data,
      };

      return await this.viewRepository.update(id, updateData);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteView(id: string): Promise<boolean> {
    try {
      const existingView = await this.viewRepository.findById(id);

      if (!existingView) {
        throw new Error('View not found');
      }

      if (existingView.isDeleted) {
        throw new Error('View is already deleted');
      }

      return await this.viewRepository.delete(id);
    } catch (error: any) {
      throw error;
    }
  }

  async restoreView(id: string): Promise<boolean> {
    try {
      const existingView = await this.viewRepository.findById(id);

      if (!existingView) {
        throw new Error('View not found');
      }

      if (!existingView.isDeleted) {
        throw new Error('View is not deleted');
      }

      return await this.viewRepository.restore(id);
    } catch (error: any) {
      throw error;
    }
  }

  async addCardToView(data: {
    viewId: string;
    sensorId: string;
    moduleId: string;
    machineId?: string;
    positionX?: number;
    positionY?: number;
    width?: number;
    height?: number;
    chartType: string;
    title?: string;
    sortOrder?: number;
    tenantId: string;
    createdBy: string;
  }): Promise<ViewCard> {
    try {
      // Verificar se a view existe
      const view = await this.viewRepository.findById(data.viewId);
      if (!view || view.tenantId !== data.tenantId) {
        throw new Error('View not found');
      }

      // Verificar se o sensor existe
      const sensor = await this.sensorRepository.findById(data.sensorId);
      if (!sensor || sensor.moduleId !== data.moduleId) {
        throw new Error(
          'Sensor not found or does not belong to the specified module'
        );
      }

      // Verificar se o módulo existe
      const module = await this.moduleRepository.findById(
        data.moduleId,
        data.tenantId
      );
      if (!module) {
        throw new Error('Module not found');
      }

      // Verificar se a máquina existe (se fornecida)
      if (data.machineId) {
        const machine = await this.machineRepository.findById(
          data.machineId,
          data.tenantId
        );
        if (!machine) {
          throw new Error('Machine not found');
        }
      }

      // Verificar se já existe um card ATIVO para este sensor com este tipo de gráfico nesta view
      const existingCard =
        await this.viewCardRepository.findByViewSensorAndChartType(
          data.viewId,
          data.sensorId,
          data.chartType
        );

      if (existingCard && !existingCard.isDeleted) {
        // Se já existe um card ATIVO com o mesmo sensor e tipo de gráfico, atualizar o card existente
        const updateData = {
          positionX:
            data.positionX !== undefined
              ? data.positionX
              : existingCard.positionX,
          positionY:
            data.positionY !== undefined
              ? data.positionY
              : existingCard.positionY,
          width: data.width !== undefined ? data.width : existingCard.width,
          height: data.height !== undefined ? data.height : existingCard.height,
          chartType: data.chartType || existingCard.chartType,
          title: data.title !== undefined ? data.title : existingCard.title,
          sortOrder:
            data.sortOrder !== undefined
              ? data.sortOrder
              : existingCard.sortOrder,
          updatedBy: data.createdBy,
        };

        return await this.viewCardRepository.update(
          existingCard.id,
          updateData
        );
      }

      // Se não existe, criar novo card
      const cardData: CreateViewCardData = {
        viewId: data.viewId,
        sensorId: data.sensorId,
        moduleId: data.moduleId,
        machineId: data.machineId,
        positionX: data.positionX ?? 0,
        positionY: data.positionY ?? 0,
        width: data.width ?? 1,
        height: data.height ?? 1,
        chartType: data.chartType,
        title: data.title,
        sortOrder: data.sortOrder ?? 0,
        tenantId: data.tenantId,
        createdBy: data.createdBy,
        updatedBy: data.createdBy,
      };

      const _card = ViewCard.create({
        id: uuidv4(),
        ...cardData,
      });

      return await this.viewCardRepository.create(cardData);
    } catch (error: any) {
      throw error;
    }
  }

  async updateCard(
    id: string,
    data: {
      positionX?: number;
      positionY?: number;
      width?: number;
      height?: number;
      chartType?: string;
      title?: string;
      sortOrder?: number;
      updatedBy: string;
    }
  ): Promise<ViewCard> {
    try {
      const existingCard = await this.viewCardRepository.findById(id);

      if (!existingCard) {
        throw new Error('View card not found');
      }

      if (existingCard.deletedAt) {
        throw new Error('Cannot update deleted view card');
      }

      const updateData: UpdateViewCardData = {
        ...data,
      };

      return await this.viewCardRepository.update(id, updateData);
    } catch (error: any) {
      throw error;
    }
  }

  async updateCardPositions(
    cards: Array<{
      id: string;
      positionX: number;
      positionY: number;
      width: number;
      height: number;
    }>,
    updatedBy: string
  ): Promise<void> {
    try {
      await this.viewCardRepository.updatePositions(cards, updatedBy);
    } catch (error: any) {
      throw error;
    }
  }

  async deleteCard(id: string): Promise<boolean> {
    try {
      console.log('🔍 [DEBUG] Service: Iniciando exclusão do card:', id);

      // Buscar card (apenas não deletados)
      const existingCard = await this.viewCardRepository.findById(id);
      console.log(
        '🔍 [DEBUG] Service: Card encontrado:',
        existingCard ? 'Sim' : 'Não'
      );

      if (!existingCard) {
        // Verificar se existe mas está deletado (idempotência)
        const deletedCard =
          await this.viewCardRepository.findByIdIncludingDeleted(id);
        if (deletedCard && deletedCard.isDeleted) {
          console.log('🔍 [DEBUG] Service: Card já deletado, retornando true');
          return true;
        }
        throw new Error('View card not found');
      }

      console.log('🔍 [DEBUG] Service: Chamando repositório para deletar');
      const result = await this.viewCardRepository.delete(id);
      console.log('🔍 [DEBUG] Service: Resultado do repositório:', result);

      return result;
    } catch (error: any) {
      console.error('🔍 [DEBUG] Service: Erro na exclusão:', error);
      throw error;
    }
  }

  async getViewCount(filters: ViewFilters): Promise<number> {
    try {
      return await this.viewRepository.count(filters);
    } catch (error: any) {
      throw error;
    }
  }

  async getViewStats(tenantId: string): Promise<{
    total: number;
    active: number;
    deleted: number;
    public: number;
    private: number;
    byUser: Array<{ userId: string; count: number }>;
  }> {
    try {
      const [total, active, deleted, publicViews, privateViews] =
        await Promise.all([
          this.viewRepository.count({ tenantId }),
          this.viewRepository.count({ tenantId, isActive: true }),
          this.viewRepository.count({ tenantId, isActive: false }),
          this.viewRepository.count({ tenantId, isPublic: true }),
          this.viewRepository.count({ tenantId, isPublic: false }),
        ]);

      const allViews = await this.viewRepository.findByTenant(tenantId);

      const byUser = allViews.reduce(
        (acc, view) => {
          const existing = acc.find(item => item.userId === view.userId);
          if (existing) {
            existing.count++;
          } else {
            acc.push({ userId: view.userId, count: 1 });
          }
          return acc;
        },
        [] as Array<{ userId: string; count: number }>
      );

      return {
        total,
        active,
        deleted,
        public: publicViews,
        private: privateViews,
        byUser: byUser.sort((a, b) => b.count - a.count),
      };
    } catch (error: any) {
      throw error;
    }
  }
}
