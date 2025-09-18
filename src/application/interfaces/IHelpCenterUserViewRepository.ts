import { HelpCenterUserView } from '../../domain/entities/HelpCenterTheme';

export interface IHelpCenterUserViewRepository {
  create(userView: HelpCenterUserView): Promise<HelpCenterUserView>;
  findByUser(user_id: string): Promise<HelpCenterUserView[]>;
  findByVideo(video_id: string): Promise<HelpCenterUserView[]>;
  findByUserAndVideo(
    user_id: string,
    video_id: string
  ): Promise<HelpCenterUserView | null>;
  update(userView: HelpCenterUserView): Promise<HelpCenterUserView>;
  delete(view_id: string): Promise<void>;
  getViewCountByVideo(video_id: string): Promise<number>;
  getViewCountByUser(user_id: string): Promise<number>;
  getCompletedVideosByUser(user_id: string): Promise<HelpCenterUserView[]>;
}
