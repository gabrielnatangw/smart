import { Response } from 'express';

import {
  SensorCurrentValueResponseDTO,
  ViewCardResponseDTO,
  ViewResponseDTO,
} from '../../application/dto/ViewDTO';
import { SensorDataApplicationService } from '../../application/services/SensorDataApplicationService';
import { ViewApplicationService } from '../../application/services/ViewApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';

export class ViewController {
  constructor(
    private viewService: ViewApplicationService,
    private sensorDataService: SensorDataApplicationService
  ) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { name, isDefault, isPublic, isActive } = req.body;

      if (!name || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Nome da view é obrigatório',
        });
        return;
      }

      const view = await this.viewService.createView({
        name: name.trim(),
        isDefault: isDefault ?? false,
        isPublic: isPublic ?? false,
        isActive: isActive ?? true,
        tenantId: req.user?.tenantId || '',
        userId: req.user?.userId || '',
        createdBy: req.user?.userId || '',
      });

      const response = this.mapToResponseDTO(view);
      res.status(201).json({
        success: true,
        message: 'View criada com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const includeData = req.query.includeData === 'true';

      let view;
      if (includeData) {
        view = await this.viewService.getViewWithData(
          id || '',
          req.user?.tenantId || ''
        );
      } else {
        view = await this.viewService.getViewById(
          id || '',
          req.user?.tenantId || ''
        );
      }

      if (!view) {
        res.status(404).json({
          success: false,
          message: 'View não encontrada',
        });
        return;
      }

      const response = this.mapToResponseDTO(view);
      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getByTenant = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      console.log('🔍 [DEBUG] getByTenant: Iniciando método');
      console.log('🔍 [DEBUG] getByTenant: Query params:', req.query);
      console.log('🔍 [DEBUG] getByTenant: User:', req.user);

      const { userId, isPublic, isActive, name, page, limit } = req.query;

      const filters = {
        userId: userId as string,
        isPublic: isPublic ? isPublic === 'true' : undefined,
        isActive: isActive ? isActive === 'true' : undefined,
        name: name as string,
      };

      console.log('🔍 [DEBUG] getByTenant: Filters:', filters);
      console.log('🔍 [DEBUG] getByTenant: TenantId:', req.user?.tenantId);

      const views = await this.viewService.getViewsByTenant(
        req.user?.tenantId || '',
        filters
      );
      console.log('🔍 [DEBUG] getByTenant: Views encontradas:', views.length);

      const total = await this.viewService.getViewCount({
        tenantId: req.user?.tenantId || '',
        ...filters,
      });
      console.log('🔍 [DEBUG] getByTenant: Total:', total);

      const pageNum = page ? Number(page) : 1;
      const limitNum = limit ? Number(limit) : 10;
      const paginatedViews = this.paginate(views, pageNum, limitNum);

      console.log('🔍 [DEBUG] getByTenant: Enviando resposta');
      res.json({
        success: true,
        data: {
          views: paginatedViews.map(view => this.mapToResponseDTO(view)),
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum),
            hasNext: pageNum * limitNum < total,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error: any) {
      console.error('🔍 [DEBUG] getByTenant: Erro capturado:', error);
      console.error('🔍 [DEBUG] getByTenant: Stack trace:', error.stack);
      this.handleError(error, res);
    }
  };

  getByUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const views = await this.viewService.getViewsByUser(
        req.user?.userId || '',
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        data: views.map(view => this.mapToResponseDTO(view)),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getByUserComplete = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const views = await this.viewService.getViewsByUserWithData(
        req.user?.userId || '',
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        data: views.map(view => this.mapToResponseDTO(view)),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { name, isDefault, isPublic, isActive } = req.body;

      const view = await this.viewService.updateView(id || '', {
        name: name?.trim(),
        isDefault,
        isPublic,
        isActive,
        updatedBy: req.user?.userId || '',
      });

      const response = this.mapToResponseDTO(view);
      res.json({
        success: true,
        message: 'View atualizada com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.viewService.deleteView(id || '');

      res.json({
        success: true,
        message: 'View excluída com sucesso',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  restore = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      await this.viewService.restoreView(id || '');

      res.json({
        success: true,
        message: 'View restaurada com sucesso',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  addCard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { viewId } = req.params;
      const {
        sensorId,
        moduleId,
        machineId,
        positionX = 0,
        positionY = 0,
        width = 1,
        height = 1,
        chartType,
        title,
        sortOrder = 0,
      } = req.body;

      if (!sensorId || !moduleId || !chartType) {
        res.status(400).json({
          success: false,
          message: 'sensorId, moduleId e chartType são obrigatórios',
        });
        return;
      }

      // Verificar se chartType é válido
      if (typeof chartType !== 'string' || chartType.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'chartType deve ser uma string válida',
        });
        return;
      }

      const card = await this.viewService.addCardToView({
        viewId: viewId || '',
        sensorId,
        moduleId,
        machineId,
        positionX,
        positionY,
        width,
        height,
        chartType: chartType,
        title: title?.trim(),
        sortOrder,
        tenantId: req.user?.tenantId || '',
        createdBy: req.user?.userId || '',
      });

      const response = this.mapCardToResponseDTO(card);
      res.status(201).json({
        success: true,
        message: 'Card adicionado à view com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateCard = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    console.log('🔍 [DEBUG] Controller: Método updateCard chamado');
    console.log('🔍 [DEBUG] Controller: Parâmetros:', req.params);
    console.log('🔍 [DEBUG] Controller: Corpo da requisição:', req.body);
    try {
      const { cardId } = req.params;
      const {
        positionX,
        positionY,
        width,
        height,
        chartType,
        title,
        sortOrder,
      } = req.body;

      const card = await this.viewService.updateCard(cardId || '', {
        positionX,
        positionY,
        width,
        height,
        chartType: chartType ? chartType.toUpperCase() : undefined,
        title: title?.trim(),
        sortOrder,
        updatedBy: req.user?.userId || '',
      });

      const response = this.mapCardToResponseDTO(card);
      res.json({
        success: true,
        message: 'Card atualizado com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateCardPositions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    console.log('🔍 [DEBUG] updateCardPositions: Método chamado');
    console.log('🔍 [DEBUG] updateCardPositions: URL completa:', req.url);
    console.log('🔍 [DEBUG] updateCardPositions: Método HTTP:', req.method);
    console.log(
      '🔍 [DEBUG] updateCardPositions: Headers Content-Type:',
      req.headers['content-type']
    );
    console.log('🔍 [DEBUG] updateCardPositions: Body completo:', req.body);
    console.log('🔍 [DEBUG] updateCardPositions: User ID:', req.user?.userId);

    try {
      const { cards } = req.body;
      console.log('🔍 [DEBUG] updateCardPositions: Cards extraído:', cards);
      console.log(
        '🔍 [DEBUG] updateCardPositions: Tipo de cards:',
        typeof cards
      );
      console.log(
        '🔍 [DEBUG] updateCardPositions: É array?',
        Array.isArray(cards)
      );

      if (!Array.isArray(cards)) {
        console.log('❌ [ERROR] updateCardPositions: cards não é um array');
        res.status(400).json({
          success: false,
          message: 'cards deve ser um array',
        });
        return;
      }

      const updatedBy = req.user?.userId;
      if (!updatedBy) {
        console.log('❌ [ERROR] updateCardPositions: Usuário não autenticado');
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      console.log('🔍 [DEBUG] updateCardPositions: Chamando service com:', {
        cards,
        updatedBy,
      });
      await this.viewService.updateCardPositions(cards, updatedBy);

      console.log(
        '✅ [SUCCESS] updateCardPositions: Posições atualizadas com sucesso'
      );
      res.json({
        success: true,
        message: 'Posições dos cards atualizadas com sucesso',
      });
    } catch (error: any) {
      console.error('❌ [ERROR] updateCardPositions: Erro capturado:', error);
      console.error(
        '❌ [ERROR] updateCardPositions: Stack trace:',
        error.stack
      );
      this.handleError(error, res);
    }
  };

  deleteCard = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    console.log('🔍 [DEBUG] Controller: Método deleteCard chamado');
    console.log('🔍 [DEBUG] Controller: Parâmetros:', req.params);
    console.log('🔍 [DEBUG] Controller: Headers:', req.headers);

    try {
      const { cardId } = req.params;
      console.log('🔍 [DEBUG] Controller: Iniciando exclusão do card:', cardId);

      const result = await this.viewService.deleteCard(cardId || '');
      console.log('🔍 [DEBUG] Controller: Resultado da exclusão:', result);

      res.json({
        success: true,
        message: 'Card excluído com sucesso',
      });
    } catch (error: any) {
      console.error('🔍 [DEBUG] Controller: Erro na exclusão:', error);
      this.handleError(error, res);
    }
  };

  getStats = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const stats = await this.viewService.getViewStats(
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  private mapToResponseDTO(view: any): ViewResponseDTO {
    return {
      id: view.id,
      name: view.name,
      isDefault: view.isDefault,
      isPublic: view.isPublic,
      isActive: view.isActive,
      createdAt: view.createdAt,
      updatedAt: view.updatedAt,
      deletedAt: view.deletedAt,
      tenantId: view.tenantId,
      userId: view.userId,
      createdBy: view.createdBy,
      updatedBy: view.updatedBy,
      cards: view.cards
        ?.filter((card: any) => !card.deletedAt)
        .map((card: any) => this.mapCardToResponseDTO(card)),
    };
  }

  private mapCardToResponseDTO(card: any): ViewCardResponseDTO {
    return {
      id: card.id,
      viewId: card.viewId,
      sensorId: card.sensorId,
      moduleId: card.moduleId,
      machineId: card.machineId,
      positionX: card.positionX,
      positionY: card.positionY,
      width: card.width,
      height: card.height,
      chartType: card.chartType,
      title: card.title,
      sortOrder: card.sortOrder,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      deletedAt: card.deletedAt,
      tenantId: card.tenantId,
      createdBy: card.createdBy,
      updatedBy: card.updatedBy,
      // currentValue: card.currentValue ? this.mapCurrentValueToResponseDTO(card.currentValue) : undefined,
    };
  }

  private mapCurrentValueToResponseDTO(
    currentValue: any
  ): SensorCurrentValueResponseDTO {
    return {
      id: currentValue.id,
      sensorId: currentValue.sensorId,
      value: currentValue.value,
      rawValue: currentValue.rawValue,
      unit: currentValue.unit,
      quality: currentValue.quality,
      lastUpdated: currentValue.lastUpdated,
      metadata: currentValue.metadata,
      isStale: currentValue.isStale ? currentValue.isStale(5) : false,
    };
  }

  private paginate<T>(array: T[], page: number, limit: number): T[] {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return array.slice(startIndex, endIndex);
  }

  private handleError(error: any, res: Response): void {
    console.error('View error:', error);

    const errorMessage = error.message || 'Internal server error';

    switch (errorMessage) {
      case 'View not found':
        res.status(404).json({
          success: false,
          message: 'View não encontrada',
        });
        break;
      case 'Cannot update deleted view':
        res.status(400).json({
          success: false,
          message: 'Não é possível atualizar view excluída',
        });
        break;
      case 'View is already deleted':
        res.status(400).json({
          success: false,
          message: 'View já está excluída',
        });
        break;
      case 'View is not deleted':
        res.status(400).json({
          success: false,
          message: 'View não está excluída',
        });
        break;
      case 'Sensor not found or does not belong to the specified module':
        res.status(400).json({
          success: false,
          message:
            'Sensor não encontrado ou não pertence ao módulo especificado',
        });
        break;
      case 'Module not found':
        res.status(400).json({
          success: false,
          message: 'Módulo não encontrado',
        });
        break;
      case 'Machine not found':
        res.status(400).json({
          success: false,
          message: 'Máquina não encontrada',
        });
        break;
      default:
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
        break;
    }
  }
}
