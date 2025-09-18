import {
  HelpCenterTheme,
  HelpCenterThemeApplication,
} from '../../domain/entities/HelpCenterTheme';

export interface IHelpCenterThemeRepository {
  create(theme: HelpCenterTheme): Promise<HelpCenterTheme>;
  findById(theme_id: string): Promise<HelpCenterTheme | null>;
  findAll(): Promise<HelpCenterTheme[]>;
  findByApplication(application_id: string): Promise<HelpCenterTheme[]>;
  findActive(): Promise<HelpCenterTheme[]>;
  update(theme: HelpCenterTheme): Promise<HelpCenterTheme>;
  delete(theme_id: string): Promise<void>;
  softDelete(theme_id: string): Promise<void>;
  addApplication(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterThemeApplication>;
  removeApplication(theme_id: string, application_id: string): Promise<void>;
  getApplicationsByTheme(
    theme_id: string
  ): Promise<HelpCenterThemeApplication[]>;
}
