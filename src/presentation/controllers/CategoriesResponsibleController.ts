import { Request, Response } from 'express';

import { CategoriesResponsibleApplicationService } from '../../application/services/CategoriesResponsibleApplicationService';
import {
  CreateCategoriesResponsibleRequest,
  DeleteCategoriesResponsibleRequest,
  FindCategoriesResponsibleByNameRequest,
  GetCategoriesResponsibleByIdRequest,
  RestoreCategoriesResponsibleRequest,
  UpdateCategoriesResponsibleRequest,
} from '../validators/categoriesResponsibleValidators';

export class CategoriesResponsibleController {
  constructor(
    private categoriesResponsibleApplicationService: CategoriesResponsibleApplicationService
  ) {}

  async createCategoriesResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: CreateCategoriesResponsibleRequest = req.body;
      const result =
        await this.categoriesResponsibleApplicationService.createCategoriesResponsible(
          data,
          tenantId
        );

      res.status(201).json({
        message: 'Categoria de responsável criada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao criar categoria de responsável:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getCategoriesResponsibleById(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: GetCategoriesResponsibleByIdRequest = req.params as any;
      const result =
        await this.categoriesResponsibleApplicationService.getCategoriesResponsibleById(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Categoria de responsável encontrada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao buscar categoria de responsável:', error);
      res.status(404).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getAllCategoriesResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
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
      } as any;
      const result =
        await this.categoriesResponsibleApplicationService.getAllCategoriesResponsible(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Categorias de responsável listadas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao listar categorias de responsável:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async updateCategoriesResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const categoryResponsibleId = req.params.categoryResponsibleId;
      if (!categoryResponsibleId) {
        res
          .status(400)
          .json({ error: 'ID da categoria de responsável é obrigatório' });
        return;
      }
      const data: UpdateCategoriesResponsibleRequest = req.body;
      const result =
        await this.categoriesResponsibleApplicationService.updateCategoriesResponsible(
          categoryResponsibleId,
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Categoria de responsável atualizada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao atualizar categoria de responsável:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async deleteCategoriesResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: DeleteCategoriesResponsibleRequest = req.params as any;
      await this.categoriesResponsibleApplicationService.deleteCategoriesResponsible(
        data,
        tenantId
      );

      res.status(200).json({
        message: 'Categoria de responsável excluída com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir categoria de responsável:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async restoreCategoriesResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: RestoreCategoriesResponsibleRequest = req.params as any;
      const result =
        await this.categoriesResponsibleApplicationService.restoreCategoriesResponsible(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Categoria de responsável restaurada com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao restaurar categoria de responsável:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findCategoriesResponsibleByName(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const data: FindCategoriesResponsibleByNameRequest = req.query as any;
      const result =
        await this.categoriesResponsibleApplicationService.findCategoriesResponsibleByName(
          data,
          tenantId
        );

      res.status(200).json({
        message: 'Categorias de responsável encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error(
        'Erro ao buscar categorias de responsável por nome:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findCategoriesWithResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.categoriesResponsibleApplicationService.findCategoriesWithResponsible(
          tenantId
        );

      res.status(200).json({
        message: 'Categorias com responsáveis encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao buscar categorias com responsáveis:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async findCategoriesWithoutResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const result =
        await this.categoriesResponsibleApplicationService.findCategoriesWithoutResponsible(
          tenantId
        );

      res.status(200).json({
        message: 'Categorias sem responsáveis encontradas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error('Erro ao buscar categorias sem responsáveis:', error);
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
        await this.categoriesResponsibleApplicationService.getCategoriesResponsibleStatistics(
          tenantId
        );

      res.status(200).json({
        message:
          'Estatísticas de categorias de responsável obtidas com sucesso',
        data: result,
      });
    } catch (error) {
      console.error(
        'Erro ao obter estatísticas de categorias de responsável:',
        error
      );
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }
}
