import { Request, Response } from 'express';

import { StopCauseApplicationService } from '../../application/services/StopCauseApplicationService';
import {
  CreateStopCauseRequest,
  DeleteStopCauseRequest,
  FindStopCausesByDescriptionRequest,
  GetAncestorsRequest,
  GetChildrenRequest,
  GetDescendantsRequest,
  GetParentRequest,
  GetStopCauseByIdRequest,
  MoveStopCauseRequest,
  RestoreStopCauseRequest,
  UpdateStopCauseRequest,
} from '../validators/stopCauseValidators';

export class StopCauseController {
  constructor(
    private stopCauseApplicationService: StopCauseApplicationService
  ) {}

  async createStopCause(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: CreateStopCauseRequest = req.body;
      const result = await this.stopCauseApplicationService.createStopCause(
        data,
        tenantId
      );

      res.status(201).json({
        message: 'Causa de parada criada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao criar causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getStopCauseById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetStopCauseByIdRequest = req.params as any;
      const result = await this.stopCauseApplicationService.getStopCauseById(
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Causa de parada encontrada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao buscar causa de parada:', error);
      res.status(404).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getAllStopCauses(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        includeDeleted: req.query.includeDeleted === 'true',
        includeHierarchy: req.query.includeHierarchy === 'true',
      } as any;
      const result = await this.stopCauseApplicationService.getAllStopCauses(
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Causas de parada listadas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao listar causas de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async updateStopCause(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const stopCauseId = req.params.stopCauseId;
      if (!stopCauseId) {
        res.status(400).json({ error: 'ID da causa de parada é obrigatório' });
        return;
      }
      const data: UpdateStopCauseRequest = req.body;
      const result = await this.stopCauseApplicationService.updateStopCause(
        stopCauseId,
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Causa de parada atualizada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao atualizar causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async deleteStopCause(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: DeleteStopCauseRequest = req.params as any;
      await this.stopCauseApplicationService.deleteStopCause(data, tenantId);

      res.status(200).json({
        message: 'Causa de parada excluída com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async restoreStopCause(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: RestoreStopCauseRequest = req.params as any;
      const result = await this.stopCauseApplicationService.restoreStopCause(
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Causa de parada restaurada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao restaurar causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getHierarchy(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data = {
        includeDeleted: req.query.includeDeleted === 'true',
      } as any;
      const result = await this.stopCauseApplicationService.getHierarchy(
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Hierarquia de causas de parada obtida com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter hierarquia de causas de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getRootStopCauses(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.stopCauseApplicationService.getRootStopCauses(tenantId);

      res.status(200).json({
        message: 'Causas de parada raiz obtidas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter causas de parada raiz:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getChildren(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetChildrenRequest = req.params as any;
      const result = await this.stopCauseApplicationService.getChildren(
        data.stopCauseId,
        tenantId
      );

      res.status(200).json({
        message: 'Filhos da causa de parada obtidos com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter filhos da causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getParent(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetParentRequest = req.params as any;
      const result = await this.stopCauseApplicationService.getParent(
        data.stopCauseId,
        tenantId
      );

      res.status(200).json({
        message: 'Pai da causa de parada obtido com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter pai da causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getAncestors(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetAncestorsRequest = req.params as any;
      const result = await this.stopCauseApplicationService.getAncestors(
        data.stopCauseId,
        tenantId
      );

      res.status(200).json({
        message: 'Ancestrais da causa de parada obtidos com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter ancestrais da causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getDescendants(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetDescendantsRequest = req.params as any;
      const result = await this.stopCauseApplicationService.getDescendants(
        data.stopCauseId,
        tenantId
      );

      res.status(200).json({
        message: 'Descendentes da causa de parada obtidos com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter descendentes da causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async moveStopCause(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const stopCauseId = req.params.stopCauseId;
      if (!stopCauseId) {
        res.status(400).json({ error: 'ID da causa de parada é obrigatório' });
        return;
      }
      const data: MoveStopCauseRequest = req.body;
      const result = await this.stopCauseApplicationService.moveStopCause(
        { stopCauseId, ...data },
        tenantId
      );

      res.status(200).json({
        message: 'Causa de parada movida com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao mover causa de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findRootStopCauses(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.stopCauseApplicationService.findRootStopCauses(tenantId);

      res.status(200).json({
        message: 'Causas de parada raiz encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao encontrar causas de parada raiz:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findLeafStopCauses(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.stopCauseApplicationService.findLeafStopCauses(tenantId);

      res.status(200).json({
        message: 'Causas de parada folha encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao encontrar causas de parada folha:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findStopCausesByLevel(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data = {
        level: req.query.level ? Number(req.query.level) : 1,
      } as any;
      const result =
        await this.stopCauseApplicationService.findStopCausesByLevel(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Causas de parada por nível encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao encontrar causas de parada por nível:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findStopCausesByDescription(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: FindStopCausesByDescriptionRequest = req.query as any;
      const result =
        await this.stopCauseApplicationService.findStopCausesByDescription(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Causas de parada por descrição encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao encontrar causas de parada por descrição:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.stopCauseApplicationService.getStopCauseStatistics(tenantId);

      res.status(200).json({
        message: 'Estatísticas de causas de parada obtidas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter estatísticas de causas de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getStopCauseTree(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.stopCauseApplicationService.getStopCauseTree(tenantId);

      res.status(200).json({
        message: 'Árvore de causas de parada obtida com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao obter árvore de causas de parada:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }
}
