import { PrismaClient } from '@prisma/client';

import { IHelpCenterVideoRepository } from '../../../application/interfaces/IHelpCenterVideoRepository';
import {
  HelpCenterVideo,
  HelpCenterVideoApplication,
  VideoPlatform,
} from '../../../domain/entities/HelpCenterTheme';

export class PrismaHelpCenterVideoRepository
  implements IHelpCenterVideoRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(video: HelpCenterVideo): Promise<HelpCenterVideo> {
    const created = await this.prisma.helpCenterVideo.create({
      data: {
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
      },
    });

    return this.mapToEntity(created);
  }

  async findById(video_id: string): Promise<HelpCenterVideo | null> {
    const video = await this.prisma.helpCenterVideo.findFirst({
      where: {
        video_id,
        deleted_at: null,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
    });

    return video ? this.mapToEntity(video) : null;
  }

  async findByTheme(theme_id: string): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        theme_id,
        deleted_at: null,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async findByApplication(application_id: string): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        deleted_at: null,
        applications: {
          some: {
            application_id,
          },
        },
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async findByThemeAndApplication(
    theme_id: string,
    application_id: string
  ): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        theme_id,
        deleted_at: null,
        applications: {
          some: {
            application_id,
          },
        },
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async findActive(): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        is_active: true,
        deleted_at: null,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async findFeatured(): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        is_featured: true,
        is_active: true,
        deleted_at: null,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async search(searchTerm: string): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        AND: [
          { deleted_at: null },
          { is_active: true },
          {
            OR: [
              { title: { contains: searchTerm, mode: 'insensitive' } },
              { description: { contains: searchTerm, mode: 'insensitive' } },
            ],
          },
        ],
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  async update(video: HelpCenterVideo): Promise<HelpCenterVideo> {
    const updated = await this.prisma.helpCenterVideo.update({
      where: { video_id: video.video_id },
      data: {
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
        updated_at: video.updated_at,
        deleted_at: video.deleted_at,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(video_id: string): Promise<void> {
    await this.prisma.helpCenterVideo.delete({
      where: { video_id },
    });
  }

  async softDelete(video_id: string): Promise<void> {
    await this.prisma.helpCenterVideo.update({
      where: { video_id },
      data: {
        deleted_at: new Date(),
        is_active: false,
      },
    });
  }

  async addApplication(
    video_id: string,
    application_id: string
  ): Promise<HelpCenterVideoApplication> {
    const created = await this.prisma.helpCenterVideoApplication.create({
      data: {
        video_application_id: crypto.randomUUID(),
        video_id,
        application_id,
        created_at: new Date(),
      },
    });

    return new HelpCenterVideoApplication(
      created.video_application_id,
      created.video_id,
      created.application_id,
      created.created_at
    );
  }

  async removeApplication(
    video_id: string,
    application_id: string
  ): Promise<void> {
    await this.prisma.helpCenterVideoApplication.deleteMany({
      where: {
        video_id,
        application_id,
      },
    });
  }

  async getApplicationsByVideo(
    video_id: string
  ): Promise<HelpCenterVideoApplication[]> {
    const applications = await this.prisma.helpCenterVideoApplication.findMany({
      where: { video_id },
      include: {
        application: true,
      },
    });

    return applications.map(
      app =>
        new HelpCenterVideoApplication(
          app.video_application_id,
          app.video_id,
          app.application_id,
          app.created_at
        )
    );
  }

  async findByPlatform(platform: VideoPlatform): Promise<HelpCenterVideo[]> {
    const videos = await this.prisma.helpCenterVideo.findMany({
      where: {
        video_platform: platform,
        deleted_at: null,
      },
      include: {
        applications: {
          include: {
            application: true,
          },
        },
        user_views: true,
      },
      orderBy: { sort_order: 'asc' },
    });

    return videos.map(video => this.mapToEntity(video));
  }

  private mapToEntity(data: any): HelpCenterVideo {
    return new HelpCenterVideo(
      data.video_id,
      data.title,
      data.description,
      data.video_platform,
      data.external_video_id,
      data.external_url,
      data.thumbnail_url,
      data.duration,
      data.sort_order,
      data.is_active,
      data.is_featured,
      data.created_at,
      data.updated_at,
      data.deleted_at,
      data.theme_id,
      data.user_views?.map((view: any) => ({
        view_id: view.view_id,
        user_id: view.user_id,
        video_id: view.video_id,
        viewed_at: view.viewed_at,
        watch_duration: view.watch_duration,
        completed: view.completed,
      })),
      data.applications?.map(
        (app: any) =>
          new HelpCenterVideoApplication(
            app.video_application_id,
            app.video_id,
            app.application_id,
            app.created_at
          )
      )
    );
  }
}
