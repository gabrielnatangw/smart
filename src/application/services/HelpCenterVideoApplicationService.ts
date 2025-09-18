import {
  HelpCenterVideo,
  HelpCenterVideoApplication,
  VideoPlatform,
} from '../../domain/entities/HelpCenterTheme';
import {
  CreateHelpCenterVideoDTO,
  HelpCenterVideoDTO,
  HelpCenterVideoSearchDTO,
  UpdateHelpCenterVideoDTO,
} from '../dto/HelpCenterThemeDTO';
import { IHelpCenterVideoRepository } from '../interfaces/IHelpCenterVideoRepository';

export class HelpCenterVideoApplicationService {
  constructor(
    private readonly helpCenterVideoRepository: IHelpCenterVideoRepository
  ) {}

  async createVideo(
    createVideoDTO: CreateHelpCenterVideoDTO
  ): Promise<HelpCenterVideoDTO> {
    const video = HelpCenterVideo.create(
      createVideoDTO.title,
      createVideoDTO.theme_id,
      createVideoDTO.video_platform as VideoPlatform,
      createVideoDTO.external_video_id,
      createVideoDTO.external_url,
      createVideoDTO.description,
      createVideoDTO.thumbnail_url,
      createVideoDTO.duration,
      createVideoDTO.sort_order,
      createVideoDTO.is_featured
    );

    const createdVideo = await this.helpCenterVideoRepository.create(video);

    // Adicionar aplicações se fornecidas
    if (
      createVideoDTO.application_ids &&
      createVideoDTO.application_ids.length > 0
    ) {
      for (const application_id of createVideoDTO.application_ids) {
        await this.helpCenterVideoRepository.addApplication(
          createdVideo.video_id,
          application_id
        );
      }
    }

    return this.mapToDTO(createdVideo);
  }

  async getVideoById(video_id: string): Promise<HelpCenterVideoDTO | null> {
    const video = await this.helpCenterVideoRepository.findById(video_id);
    return video ? this.mapToDTO(video) : null;
  }

  async getVideosByTheme(theme_id: string): Promise<HelpCenterVideoDTO[]> {
    const videos = await this.helpCenterVideoRepository.findByTheme(theme_id);
    return videos.map(video => this.mapToDTO(video));
  }

  async getVideosByApplication(
    application_id: string
  ): Promise<HelpCenterVideoDTO[]> {
    const videos =
      await this.helpCenterVideoRepository.findByApplication(application_id);
    return videos.map(video => this.mapToDTO(video));
  }

  async getVideosByThemeAndApplication(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterVideoDTO[]> {
    const videos =
      await this.helpCenterVideoRepository.findByThemeAndApplication(
        theme_id,
        application_id
      );
    return videos.map(video => this.mapToDTO(video));
  }

  async getActiveVideos(): Promise<HelpCenterVideoDTO[]> {
    const videos = await this.helpCenterVideoRepository.findActive();
    return videos.map(video => this.mapToDTO(video));
  }

  async getFeaturedVideos(): Promise<HelpCenterVideoDTO[]> {
    const videos = await this.helpCenterVideoRepository.findFeatured();
    return videos.map(video => this.mapToDTO(video));
  }

  async searchVideos(searchTerm: string): Promise<HelpCenterVideoSearchDTO[]> {
    const videos = await this.helpCenterVideoRepository.search(searchTerm);
    return videos.map(video => this.mapToSearchDTO(video));
  }

  async updateVideo(
    video_id: string,
    updateVideoDTO: UpdateHelpCenterVideoDTO
  ): Promise<HelpCenterVideoDTO | null> {
    const existingVideo =
      await this.helpCenterVideoRepository.findById(video_id);
    if (!existingVideo) {
      return null;
    }

    const updatedVideo = existingVideo.update(
      updateVideoDTO.title,
      updateVideoDTO.description,
      updateVideoDTO.video_platform as VideoPlatform,
      updateVideoDTO.external_video_id,
      updateVideoDTO.external_url,
      updateVideoDTO.thumbnail_url,
      updateVideoDTO.duration,
      updateVideoDTO.sort_order,
      updateVideoDTO.is_active,
      updateVideoDTO.is_featured
    );

    const savedVideo =
      await this.helpCenterVideoRepository.update(updatedVideo);

    // Atualizar aplicações se fornecidas
    if (updateVideoDTO.application_ids !== undefined) {
      // Remover todas as aplicações existentes
      const existingApplications =
        await this.helpCenterVideoRepository.getApplicationsByVideo(video_id);
      for (const app of existingApplications) {
        await this.helpCenterVideoRepository.removeApplication(
          video_id,
          app.application_id
        );
      }

      // Adicionar novas aplicações
      for (const application_id of updateVideoDTO.application_ids) {
        await this.helpCenterVideoRepository.addApplication(
          video_id,
          application_id
        );
      }
    }

    return this.mapToDTO(savedVideo);
  }

  async deleteVideo(video_id: string): Promise<boolean> {
    const video = await this.helpCenterVideoRepository.findById(video_id);
    if (!video) {
      return false;
    }

    await this.helpCenterVideoRepository.softDelete(video_id);
    return true;
  }

  async addApplicationToVideo(
    video_id: string,
    application_id: string
  ): Promise<boolean> {
    const video = await this.helpCenterVideoRepository.findById(video_id);
    if (!video) {
      return false;
    }

    await this.helpCenterVideoRepository.addApplication(
      video_id,
      application_id
    );
    return true;
  }

  async removeApplicationFromVideo(
    video_id: string,
    application_id: string
  ): Promise<boolean> {
    const video = await this.helpCenterVideoRepository.findById(video_id);
    if (!video) {
      return false;
    }

    await this.helpCenterVideoRepository.removeApplication(
      video_id,
      application_id
    );
    return true;
  }

  async getVideoApplications(video_id: string): Promise<any[]> {
    const applications =
      await this.helpCenterVideoRepository.getApplicationsByVideo(video_id);
    return applications.map(app => this.mapVideoApplicationToDTO(app));
  }

  async getVideosByPlatform(platform: string): Promise<HelpCenterVideoDTO[]> {
    const videos = await this.helpCenterVideoRepository.findByPlatform(
      platform as VideoPlatform
    );
    return videos.map(video => this.mapToDTO(video));
  }

  private mapToDTO(video: HelpCenterVideo): HelpCenterVideoDTO {
    return {
      video_id: video.video_id,
      title: video.title,
      description: video.description,
      video_platform: video.video_platform,
      external_video_id: video.external_video_id,
      external_url: video.external_url,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      sort_order: video.sort_order,
      is_active: video.is_active,
      is_featured: video.is_featured,
      created_at: video.created_at,
      updated_at: video.updated_at,
      deleted_at: video.deleted_at,
      theme_id: video.theme_id,
      applications: video.applications?.map(app =>
        this.mapVideoApplicationToDTO(app)
      ),
    };
  }

  private mapToSearchDTO(video: HelpCenterVideo): HelpCenterVideoSearchDTO {
    return {
      video_id: video.video_id,
      title: video.title,
      description: video.description,
      video_platform: video.video_platform,
      external_video_id: video.external_video_id,
      external_url: video.external_url,
      thumbnail_url: video.thumbnail_url,
      duration: video.duration,
      sort_order: video.sort_order,
      is_active: video.is_active,
      is_featured: video.is_featured,
      theme_id: video.theme_id,
      applications: video.applications?.map(app =>
        this.mapVideoApplicationToDTO(app)
      ),
    };
  }

  private mapVideoApplicationToDTO(app: HelpCenterVideoApplication): any {
    return {
      video_application_id: app.video_application_id,
      video_id: app.video_id,
      application_id: app.application_id,
      created_at: app.created_at,
    };
  }
}
