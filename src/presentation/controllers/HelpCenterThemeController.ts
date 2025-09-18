import { Request, Response } from 'express';

import {
  CreateHelpCenterThemeDTO,
  UpdateHelpCenterThemeDTO,
} from '../../application/dto/HelpCenterThemeDTO';
import { HelpCenterThemeApplicationService } from '../../application/services/HelpCenterThemeApplicationService';

export class HelpCenterThemeController {
  constructor(
    private readonly helpCenterThemeService: HelpCenterThemeApplicationService
  ) {}

  async createTheme(req: Request, res: Response): Promise<void> {
    try {
      const createThemeDTO: CreateHelpCenterThemeDTO = req.body;
      const theme =
        await this.helpCenterThemeService.createTheme(createThemeDTO);

      res.status(201).json({
        success: true,
        data: theme,
        message: 'Tema criado com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getThemeById(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const theme = await this.helpCenterThemeService.getThemeById(theme_id);

      if (!theme) {
        res.status(404).json({
          success: false,
          message: 'Tema não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: theme,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getAllThemes(req: Request, res: Response): Promise<void> {
    try {
      const themes = await this.helpCenterThemeService.getAllThemes();

      res.status(200).json({
        success: true,
        data: themes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar temas',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getThemesByApplication(req: Request, res: Response): Promise<void> {
    try {
      const { application_id } = req.params;
      const themes =
        await this.helpCenterThemeService.getThemesByApplication(
          application_id
        );

      res.status(200).json({
        success: true,
        data: themes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar temas por aplicação',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getActiveThemes(req: Request, res: Response): Promise<void> {
    try {
      const themes = await this.helpCenterThemeService.getActiveThemes();

      res.status(200).json({
        success: true,
        data: themes,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar temas ativos',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async updateTheme(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const updateThemeDTO: UpdateHelpCenterThemeDTO = req.body;

      const theme = await this.helpCenterThemeService.updateTheme(
        theme_id,
        updateThemeDTO
      );

      if (!theme) {
        res.status(404).json({
          success: false,
          message: 'Tema não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: theme,
        message: 'Tema atualizado com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async deleteTheme(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const deleted = await this.helpCenterThemeService.deleteTheme(theme_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Tema não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Tema excluído com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async addApplicationToTheme(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const { application_id } = req.body;

      const themeApplication =
        await this.helpCenterThemeService.addApplicationToTheme(
          theme_id,
          application_id
        );

      if (!themeApplication) {
        res.status(404).json({
          success: false,
          message: 'Tema não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: themeApplication,
        message: 'Aplicação adicionada ao tema com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar aplicação ao tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async removeApplicationFromTheme(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id, application_id } = req.params;
      const removed =
        await this.helpCenterThemeService.removeApplicationFromTheme(
          theme_id,
          application_id
        );

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'Tema não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aplicação removida do tema com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover aplicação do tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getThemeApplications(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const applications =
        await this.helpCenterThemeService.getThemeApplications(theme_id);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar aplicações do tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
