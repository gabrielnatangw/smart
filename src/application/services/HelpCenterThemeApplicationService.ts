import {
  HelpCenterTheme,
  HelpCenterThemeApplication,
} from '../../domain/entities/HelpCenterTheme';
import {
  CreateHelpCenterThemeDTO,
  HelpCenterThemeApplicationDTO,
  HelpCenterThemeDTO,
  UpdateHelpCenterThemeDTO,
} from '../dto/HelpCenterThemeDTO';
import { IHelpCenterThemeRepository } from '../interfaces/IHelpCenterThemeRepository';

export class HelpCenterThemeApplicationService {
  constructor(
    private readonly helpCenterThemeRepository: IHelpCenterThemeRepository
  ) {}

  async createTheme(
    createThemeDTO: CreateHelpCenterThemeDTO
  ): Promise<HelpCenterThemeDTO> {
    const theme = HelpCenterTheme.create(
      createThemeDTO.title,
      createThemeDTO.description,
      createThemeDTO.icon_name,
      createThemeDTO.color,
      createThemeDTO.sort_order
    );

    const createdTheme = await this.helpCenterThemeRepository.create(theme);

    // Adicionar aplicações se fornecidas
    if (
      createThemeDTO.application_ids &&
      createThemeDTO.application_ids.length > 0
    ) {
      for (const application_id of createThemeDTO.application_ids) {
        await this.helpCenterThemeRepository.addApplication(
          createdTheme.theme_id,
          application_id
        );
      }
    }

    return this.mapToDTO(createdTheme);
  }

  async getThemeById(theme_id: string): Promise<HelpCenterThemeDTO | null> {
    const theme = await this.helpCenterThemeRepository.findById(theme_id);
    return theme ? this.mapToDTO(theme) : null;
  }

  async getAllThemes(): Promise<HelpCenterThemeDTO[]> {
    const themes = await this.helpCenterThemeRepository.findAll();
    return themes.map(theme => this.mapToDTO(theme));
  }

  async getThemesByApplication(
    application_id: string
  ): Promise<HelpCenterThemeDTO[]> {
    const themes =
      await this.helpCenterThemeRepository.findByApplication(application_id);
    return themes.map(theme => this.mapToDTO(theme));
  }

  async getActiveThemes(): Promise<HelpCenterThemeDTO[]> {
    const themes = await this.helpCenterThemeRepository.findActive();
    return themes.map(theme => this.mapToDTO(theme));
  }

  async updateTheme(
    theme_id: string,
    updateThemeDTO: UpdateHelpCenterThemeDTO
  ): Promise<HelpCenterThemeDTO | null> {
    const existingTheme =
      await this.helpCenterThemeRepository.findById(theme_id);
    if (!existingTheme) {
      return null;
    }

    const updatedTheme = existingTheme.update(
      updateThemeDTO.title,
      updateThemeDTO.description,
      updateThemeDTO.icon_name,
      updateThemeDTO.color,
      updateThemeDTO.sort_order,
      updateThemeDTO.is_active
    );

    const savedTheme =
      await this.helpCenterThemeRepository.update(updatedTheme);

    // Atualizar aplicações se fornecidas
    if (updateThemeDTO.application_ids !== undefined) {
      // Remover todas as aplicações existentes
      const existingApplications =
        await this.helpCenterThemeRepository.getApplicationsByTheme(theme_id);
      for (const app of existingApplications) {
        await this.helpCenterThemeRepository.removeApplication(
          theme_id,
          app.application_id
        );
      }

      // Adicionar novas aplicações
      for (const application_id of updateThemeDTO.application_ids) {
        await this.helpCenterThemeRepository.addApplication(
          theme_id,
          application_id
        );
      }
    }

    return this.mapToDTO(savedTheme);
  }

  async deleteTheme(theme_id: string): Promise<boolean> {
    const theme = await this.helpCenterThemeRepository.findById(theme_id);
    if (!theme) {
      return false;
    }

    await this.helpCenterThemeRepository.softDelete(theme_id);
    return true;
  }

  async addApplicationToTheme(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterThemeApplicationDTO | null> {
    const theme = await this.helpCenterThemeRepository.findById(theme_id);
    if (!theme) {
      return null;
    }

    const themeApplication =
      await this.helpCenterThemeRepository.addApplication(
        theme_id,
        application_id
      );
    return this.mapApplicationToDTO(themeApplication);
  }

  async removeApplicationFromTheme(
    theme_id: string,
    application_id: string
  ): Promise<boolean> {
    const theme = await this.helpCenterThemeRepository.findById(theme_id);
    if (!theme) {
      return false;
    }

    await this.helpCenterThemeRepository.removeApplication(
      theme_id,
      application_id
    );
    return true;
  }

  async getThemeApplications(
    theme_id: string
  ): Promise<HelpCenterThemeApplicationDTO[]> {
    const applications =
      await this.helpCenterThemeRepository.getApplicationsByTheme(theme_id);
    return applications.map(app => this.mapApplicationToDTO(app));
  }

  private mapToDTO(theme: HelpCenterTheme): HelpCenterThemeDTO {
    return {
      theme_id: theme.theme_id,
      title: theme.title,
      description: theme.description,
      icon_name: theme.icon_name,
      color: theme.color,
      sort_order: theme.sort_order,
      is_active: theme.is_active,
      created_at: theme.created_at,
      updated_at: theme.updated_at,
      deleted_at: theme.deleted_at,
      videos: theme.videos?.map(video => ({
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
      })),
      applications: theme.applications?.map(app =>
        this.mapApplicationToDTO(app)
      ),
    };
  }

  private mapApplicationToDTO(
    app: HelpCenterThemeApplication
  ): HelpCenterThemeApplicationDTO {
    return {
      theme_application_id: app.theme_application_id,
      theme_id: app.theme_id,
      application_id: app.application_id,
      created_at: app.created_at,
    };
  }

  private mapVideoApplicationToDTO(app: any): any {
    return {
      video_application_id: app.video_application_id,
      video_id: app.video_id,
      application_id: app.application_id,
      created_at: app.created_at,
    };
  }
}
