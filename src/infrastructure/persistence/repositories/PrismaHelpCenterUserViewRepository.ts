import { PrismaClient } from '@prisma/client';

import { IHelpCenterUserViewRepository } from '../../../application/interfaces/IHelpCenterUserViewRepository';
import { HelpCenterUserView } from '../../../domain/entities/HelpCenterTheme';

export class PrismaHelpCenterUserViewRepository
  implements IHelpCenterUserViewRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(userView: HelpCenterUserView): Promise<HelpCenterUserView> {
    const created = await this.prisma.helpCenterUserView.create({
      data: {
        view_id: userView.view_id,
        user_id: userView.user_id,
        video_id: userView.video_id,
        viewed_at: userView.viewed_at,
        watch_duration: userView.watch_duration,
        completed: userView.completed,
      },
    });

    return this.mapToEntity(created);
  }

  async findByUser(user_id: string): Promise<HelpCenterUserView[]> {
    const views = await this.prisma.helpCenterUserView.findMany({
      where: { user_id },
      orderBy: { viewed_at: 'desc' },
    });

    return views.map(view => this.mapToEntity(view));
  }

  async findByVideo(video_id: string): Promise<HelpCenterUserView[]> {
    const views = await this.prisma.helpCenterUserView.findMany({
      where: { video_id },
      orderBy: { viewed_at: 'desc' },
    });

    return views.map(view => this.mapToEntity(view));
  }

  async findByUserAndVideo(
    user_id: string,
    video_id: string
  ): Promise<HelpCenterUserView | null> {
    const view = await this.prisma.helpCenterUserView.findFirst({
      where: {
        user_id,
        video_id,
      },
    });

    return view ? this.mapToEntity(view) : null;
  }

  async update(userView: HelpCenterUserView): Promise<HelpCenterUserView> {
    const updated = await this.prisma.helpCenterUserView.update({
      where: { view_id: userView.view_id },
      data: {
        watch_duration: userView.watch_duration,
        completed: userView.completed,
      },
    });

    return this.mapToEntity(updated);
  }

  async delete(view_id: string): Promise<void> {
    await this.prisma.helpCenterUserView.delete({
      where: { view_id },
    });
  }

  async getViewCountByVideo(video_id: string): Promise<number> {
    return await this.prisma.helpCenterUserView.count({
      where: { video_id },
    });
  }

  async getViewCountByUser(user_id: string): Promise<number> {
    return await this.prisma.helpCenterUserView.count({
      where: { user_id },
    });
  }

  async getCompletedVideosByUser(
    user_id: string
  ): Promise<HelpCenterUserView[]> {
    const views = await this.prisma.helpCenterUserView.findMany({
      where: {
        user_id,
        completed: true,
      },
      orderBy: { viewed_at: 'desc' },
    });

    return views.map(view => this.mapToEntity(view));
  }

  private mapToEntity(data: any): HelpCenterUserView {
    return new HelpCenterUserView(
      data.view_id,
      data.user_id,
      data.video_id,
      data.viewed_at,
      data.watch_duration,
      data.completed
    );
  }
}
