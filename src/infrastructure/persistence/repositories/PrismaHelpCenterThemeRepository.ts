import { PrismaClient } from '@prisma/client';

import { IHelpCenterThemeRepository } from '../../../application/interfaces/IHelpCenterThemeRepository';
import {
  HelpCenterTheme,
  HelpCenterThemeApplication,
} from '../../../domain/entities/HelpCenterTheme';

export class PrismaHelpCenterThemeRepository
  implements IHelpCenterThemeRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(theme: HelpCenterTheme): Promise<HelpCenterTheme> {
    const created = await this.prisma.helpCenterTheme.create({
      data: {
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
      },
    });

    return this.mapToEntity(created);
  }

  async findById(theme_id: string): Promise<HelpCenterTheme | null> {
    const theme = await this.prisma.helpCenterTheme.findFirst({
      where: {
        theme_id,
        deleted_at: null,
      },
      include: {
        videos: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        applications: {
          include: {
            application: true,
          },
        },
      },
    });

    return theme ? this.mapToEntity(theme) : null;
  }

  async findAll(): Promise<HelpCenterTheme[]> {
    const themes = await this.prisma.helpCenterTheme.findMany({
      where: { deleted_at: null },
      include: {
        videos: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        applications: {
          include: {
            application: true,
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    return themes.map(theme => this.mapToEntity(theme));
  }

  async findByApplication(application_id: string): Promise<HelpCenterTheme[]> {
    const themes = await this.prisma.helpCenterTheme.findMany({
      where: {
        deleted_at: null,
        applications: {
          some: {
            application_id,
          },
        },
      },
      include: {
        videos: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        applications: {
          include: {
            application: true,
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    return themes.map(theme => this.mapToEntity(theme));
  }

  async findActive(): Promise<HelpCenterTheme[]> {
    const themes = await this.prisma.helpCenterTheme.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      include: {
        videos: {
          where: {
            is_active: true,
            deleted_at: null,
          },
          orderBy: { sort_order: 'asc' },
        },
        applications: {
          include: {
            application: true,
          },
        },
      },
      orderBy: { sort_order: 'asc' },
    });

    return themes.map(theme => this.mapToEntity(theme));
  }

  async update(theme: HelpCenterTheme): Promise<HelpCenterTheme> {
    const updated = await this.prisma.helpCenterTheme.update({
      where: { theme_id: theme.theme_id },
      data: {
        title: theme.title,
        description: theme.description,
        icon_name: theme.icon_name,
        color: theme.color,
        sort_order: theme.sort_order,
        is_active: theme.is_active,
        updated_at: theme.updated_at,
        deleted_at: theme.deleted_at,
      },
      include: {
        videos: {
          where: { deleted_at: null },
          orderBy: { sort_order: 'asc' },
        },
        applications: {
          include: {
            application: true,
          },
        },
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(theme_id: string): Promise<void> {
    await this.prisma.helpCenterTheme.delete({
      where: { theme_id },
    });
  }

  async softDelete(theme_id: string): Promise<void> {
    await this.prisma.helpCenterTheme.update({
      where: { theme_id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });
  }

  async addApplication(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterThemeApplication> {
    const created = await this.prisma.helpCenterThemeApplication.create({
      data: {
        theme_application_id: crypto.randomUUID(),
        theme_id,
        application_id,
        created_at: new Date(),
      },
    });

    return new HelpCenterThemeApplication(
      created.theme_application_id,
      created.theme_id,
      created.application_id,
      created.created_at
    );
  }

  async removeApplication(
    theme_id: string,
    application_id: string
  ): Promise<void> {
    await this.prisma.helpCenterThemeApplication.deleteMany({
      where: {
        theme_id,
        application_id,
      },
    });
  }

  async getApplicationsByTheme(
    theme_id: string
  ): Promise<HelpCenterThemeApplication[]> {
    const applications = await this.prisma.helpCenterThemeApplication.findMany({
      where: { theme_id },
      include: {
        application: true,
      },
    });

    return applications.map(
      app =>
        new HelpCenterThemeApplication(
          app.theme_application_id,
          app.theme_id,
          app.application_id,
          app.created_at
        )
    );
  }

  private mapToEntity(data: any): HelpCenterTheme {
    return new HelpCenterTheme(
      data.theme_id,
      data.title,
      data.description,
      data.icon_name,
      data.color,
      data.sort_order,
      data.is_active,
      data.created_at,
      data.updated_at,
      data.deleted_at,
      data.videos?.map((video: any) => this.mapVideoToEntity(video)),
      data.applications?.map(
        (app: any) =>
          new HelpCenterThemeApplication(
            app.theme_application_id,
            app.theme_id,
            app.application_id,
            app.created_at
          )
      )
    );
  }

  private mapVideoToEntity(data: any): any {
    return {
      video_id: data.video_id,
      title: data.title,
      description: data.description,
      video_platform: data.video_platform,
      external_video_id: data.external_video_id,
      external_url: data.external_url,
      thumbnail_url: data.thumbnail_url,
      duration: data.duration,
      sort_order: data.sort_order,
      is_active: data.is_active,
      is_featured: data.is_featured,
      created_at: data.created_at,
      updated_at: data.updated_at,
      deleted_at: data.deleted_at,
      theme_id: data.theme_id,
    };
  }
}
