import { Request, Response } from 'express';

import {
  CreateHelpCenterVideoDTO,
  UpdateHelpCenterVideoDTO,
} from '../../application/dto/HelpCenterThemeDTO';
import { HelpCenterVideoApplicationService } from '../../application/services/HelpCenterVideoApplicationService';

export class HelpCenterVideoController {
  constructor(
    private readonly helpCenterVideoService: HelpCenterVideoApplicationService
  ) {}

  async createVideo(req: Request, res: Response): Promise<void> {
    try {
      const createVideoDTO: CreateHelpCenterVideoDTO = req.body;
      const video =
        await this.helpCenterVideoService.createVideo(createVideoDTO);

      res.status(201).json({
        success: true,
        data: video,
        message: 'Vídeo criado com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao criar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideoById(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const video = await this.helpCenterVideoService.getVideoById(video_id);

      if (!video) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: video,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideosByTheme(req: Request, res: Response): Promise<void> {
    try {
      const { theme_id } = req.params;
      const videos =
        await this.helpCenterVideoService.getVideosByTheme(theme_id);

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos por tema',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideosByApplication(req: Request, res: Response): Promise<void> {
    try {
      const { application_id } = req.params;
      const videos =
        await this.helpCenterVideoService.getVideosByApplication(
          application_id
        );

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos por aplicação',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideosByThemeAndApplication(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { theme_id, application_id } = req.params;
      const videos =
        await this.helpCenterVideoService.getVideosByThemeAndApplication(
          theme_id,
          application_id
        );

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos por tema e aplicação',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getActiveVideos(req: Request, res: Response): Promise<void> {
    try {
      const videos = await this.helpCenterVideoService.getActiveVideos();

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos ativos',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getFeaturedVideos(req: Request, res: Response): Promise<void> {
    try {
      const videos = await this.helpCenterVideoService.getFeaturedVideos();

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos em destaque',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async searchVideos(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Termo de busca é obrigatório',
        });
        return;
      }

      const videos = await this.helpCenterVideoService.searchVideos(q);

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async updateVideo(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const updateVideoDTO: UpdateHelpCenterVideoDTO = req.body;

      const video = await this.helpCenterVideoService.updateVideo(
        video_id,
        updateVideoDTO
      );

      if (!video) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: video,
        message: 'Vídeo atualizado com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao atualizar vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async deleteVideo(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const deleted = await this.helpCenterVideoService.deleteVideo(video_id);

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Vídeo excluído com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao excluir vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async addApplicationToVideo(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const { application_id } = req.body;

      const added = await this.helpCenterVideoService.addApplicationToVideo(
        video_id,
        application_id
      );

      if (!added) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aplicação adicionada ao vídeo com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao adicionar aplicação ao vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async removeApplicationFromVideo(req: Request, res: Response): Promise<void> {
    try {
      const { video_id, application_id } = req.params;
      const removed =
        await this.helpCenterVideoService.removeApplicationFromVideo(
          video_id,
          application_id
        );

      if (!removed) {
        res.status(404).json({
          success: false,
          message: 'Vídeo não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aplicação removida do vídeo com sucesso',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao remover aplicação do vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideoApplications(req: Request, res: Response): Promise<void> {
    try {
      const { video_id } = req.params;
      const applications =
        await this.helpCenterVideoService.getVideoApplications(video_id);

      res.status(200).json({
        success: true,
        data: applications,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar aplicações do vídeo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }

  async getVideosByPlatform(req: Request, res: Response): Promise<void> {
    try {
      const { platform } = req.params;
      const videos =
        await this.helpCenterVideoService.getVideosByPlatform(platform);

      res.status(200).json({
        success: true,
        data: videos,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Erro ao buscar vídeos por plataforma',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  }
}
