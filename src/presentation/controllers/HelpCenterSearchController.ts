import { Request, Response } from 'express';

import { CreateHelpCenterSearchDTO } from '../../application/dto/HelpCenterThemeDTO';
import { HelpCenterSearchApplicationService } from '../../application/services/HelpCenterSearchApplicationService';

export class HelpCenterSearchController {
  constructor(
    private readonly helpCenterSearchService: HelpCenterSearchApplicationService
  ) {}

  async createSearch(req: Request, res: Response): Promise<void> {
    try {
      const createSearchDTO: CreateHelpCenterSearchDTO = req.body;
      const search =
        await this.helpCenterSearchService.createSearch(createSearchDTO);

      res.status(201).json({
        success: true,
        data: search,
        message: 'Busca registrada com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar busca',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getUserSearches(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const searches =
        await this.helpCenterSearchService.getUserSearches(user_id);

      res.status(200).json({
        success: true,
        data: searches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar histórico de buscas do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getPopularSearches(req: Request, res: Response): Promise<void> {
    try {
      const { limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : 10;

      const popularSearches =
        await this.helpCenterSearchService.getPopularSearches(limitNumber);

      res.status(200).json({
        success: true,
        data: popularSearches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar buscas populares',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getRecentSearches(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const { limit } = req.query;
      const limitNumber = limit ? parseInt(limit as string) : 10;

      const recentSearches =
        await this.helpCenterSearchService.getRecentSearches(
          user_id,
          limitNumber
        );

      res.status(200).json({
        success: true,
        data: recentSearches,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar buscas recentes',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async deleteSearch(req: Request, res: Response): Promise<void> {
    try {
      const { search_id } = req.params;
      const deleted =
        await this.helpCenterSearchService.deleteSearch(search_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Busca não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Busca excluída com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir busca',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async deleteUserSearches(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const deleted =
        await this.helpCenterSearchService.deleteUserSearches(user_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Histórico de buscas do usuário excluído com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir histórico de buscas do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async trackSearch(req: Request, res: Response): Promise<void> {
    try {
      const { search_term, results_count, user_id } = req.body;

      if (!search_term || !results_count) {
        res.status(400).json({
          success: false,
          message: 'Termo de busca e contagem de resultados são obrigatórios',
        });
        return;
      }

      const search = await this.helpCenterSearchService.trackSearch(
        search_term,
        results_count,
        user_id
      );

      res.status(200).json({
        success: true,
        data: search,
        message: 'Busca registrada com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar busca',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
