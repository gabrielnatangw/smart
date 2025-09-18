import {
  HelpCenterVideo,
  HelpCenterVideoApplication,
  VideoPlatform,
} from '../../domain/entities/HelpCenterTheme';

export interface IHelpCenterVideoRepository {
  create(video: HelpCenterVideo): Promise<HelpCenterVideo>;
  findById(video_id: string): Promise<HelpCenterVideo | null>;
  findByTheme(theme_id: string): Promise<HelpCenterVideo[]>;
  findByApplication(application_id: string): Promise<HelpCenterVideo[]>;
  findByThemeAndApplication(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterVideo[]>;
  findActive(): Promise<HelpCenterVideo[]>;
  findFeatured(): Promise<HelpCenterVideo[]>;
  search(searchTerm: string): Promise<HelpCenterVideo[]>;
  update(video: HelpCenterVideo): Promise<HelpCenterVideo>;
  delete(video_id: string): Promise<void>;
  softDelete(video_id: string): Promise<void>;
  addApplication(
    video_id: string,
    application_id: string
  ): Promise<HelpCenterVideoApplication>;
  removeApplication(video_id: string, application_id: string): Promise<void>;
  getApplicationsByVideo(
    video_id: string
  ): Promise<HelpCenterVideoApplication[]>;
  findByPlatform(platform: VideoPlatform): Promise<HelpCenterVideo[]>;
}
