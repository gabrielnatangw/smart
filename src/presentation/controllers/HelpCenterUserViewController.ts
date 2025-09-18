import { Request, Response } from 'express';

import {
  CreateHelpCenterUserViewDTO,
  UpdateHelpCenterUserViewDTO,
} from '../../application/dto/HelpCenterThemeDTO';
import { HelpCenterUserViewApplicationService } from '../../application/services/HelpCenterUserViewApplicationService';

export class HelpCenterUserViewController {
  constructor(
    private readonly helpCenterUserViewService: HelpCenterUserViewApplicationService
  ) {}

  async createUserView(req: Request, res: Response): Promise<void> {
    try {
      const createUserViewDTO: CreateHelpCenterUserViewDTO = req.body;
      const userView =
        await this.helpCenterUserViewService.createUserView(createUserViewDTO);

      res.status(201).json({
        success: true,
        data: userView,
        message: 'Visualização registrada com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar visualização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getUserViews(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const userViews =
        await this.helpCenterUserViewService.getUserViews(user_id);

      res.status(200).json({
        success: true,
        data: userViews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar visualizações do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideoViews(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const videoViews =
        await this.helpCenterUserViewService.getVideoViews(video_id);

      res.status(200).json({
        success: true,
        data: videoViews,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar visualizações do vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getUserVideoView(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, video_id } = req.params;
      const userView = await this.helpCenterUserViewService.getUserVideoView(
        user_id,
        video_id
      );

      if (!userView) {
        res.status(404).json({
          success: false,
          message: 'Visualização não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userView,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar visualização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async updateUserView(req: Request, res: Response): Promise<void> {
    try {
      const { view_id } = req.params;
      const updateUserViewDTO: UpdateHelpCenterUserViewDTO = req.body;

      const userView = await this.helpCenterUserViewService.updateUserView(
        view_id,
        updateUserViewDTO
      );

      if (!userView) {
        res.status(404).json({
          success: false,
          message: 'Visualização não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: userView,
        message: 'Visualização atualizada com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar visualização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async deleteUserView(req: Request, res: Response): Promise<void> {
    try {
      const { view_id } = req.params;
      const deleted =
        await this.helpCenterUserViewService.deleteUserView(view_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Visualização não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Visualização excluída com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir visualização',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideoViewCount(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const count =
        await this.helpCenterUserViewService.getVideoViewCount(video_id);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contagem de visualizações',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getUserViewCount(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const count =
        await this.helpCenterUserViewService.getUserViewCount(user_id);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar contagem de visualizações do usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getCompletedVideosByUser(req: Request, res: Response): Promise<void> {
    try {
      const { user_id } = req.params;
      const completedVideos =
        await this.helpCenterUserViewService.getCompletedVideosByUser(user_id);

      res.status(200).json({
        success: true,
        data: completedVideos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos completados pelo usuário',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async trackVideoProgress(req: Request, res: Response): Promise<void> {
    try {
      const { user_id, video_id } = req.params;
      const { watch_duration, completed } = req.body;

      const userView = await this.helpCenterUserViewService.trackVideoProgress(
        user_id,
        video_id,
        watch_duration,
        completed
      );

      res.status(200).json({
        success: true,
        data: userView,
        message: 'Progresso do vídeo registrado com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao registrar progresso do vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
