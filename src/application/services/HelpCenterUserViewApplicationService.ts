import { HelpCenterUserView } from '../../domain/entities/HelpCenterTheme';
import {
  CreateHelpCenterUserViewDTO,
  HelpCenterUserViewDTO,
  UpdateHelpCenterUserViewDTO,
} from '../dto/HelpCenterThemeDTO';
import { IHelpCenterUserViewRepository } from '../interfaces/IHelpCenterUserViewRepository';

export class HelpCenterUserViewApplicationService {
  constructor(
    private readonly helpCenterUserViewRepository: IHelpCenterUserViewRepository
  ) {}

  async createUserView(
    createUserViewDTO: CreateHelpCenterUserViewDTO
  ): Promise<HelpCenterUserViewDTO> {
    // Verificar se já existe uma visualização para este usuário e vídeo
    const existingView =
      await this.helpCenterUserViewRepository.findByUserAndVideo(
        createUserViewDTO.user_id,
        createUserViewDTO.video_id
      );

    if (existingView) {
      // Atualizar visualização existente
      const updatedView = existingView.update(
        createUserViewDTO.watch_duration,
        createUserViewDTO.completed
      );
      const savedView =
        await this.helpCenterUserViewRepository.update(updatedView);
      return this.mapToDTO(savedView);
    } else {
      // Criar nova visualização
      const userView = HelpCenterUserView.create(
        createUserViewDTO.user_id,
        createUserViewDTO.video_id,
        createUserViewDTO.watch_duration,
        createUserViewDTO.completed
      );

      const createdView =
        await this.helpCenterUserViewRepository.create(userView);
      return this.mapToDTO(createdView);
    }
  }

  async getUserViews(user_id: string): Promise<HelpCenterUserViewDTO[]> {
    const views = await this.helpCenterUserViewRepository.findByUser(user_id);
    return views.map(view => this.mapToDTO(view));
  }

  async getVideoViews(video_id: string): Promise<HelpCenterUserViewDTO[]> {
    const views = await this.helpCenterUserViewRepository.findByVideo(video_id);
    return views.map(view => this.mapToDTO(view));
  }

  async getUserVideoView(
    user_id: string,
    video_id: string
  ): Promise<HelpCenterUserViewDTO | null> {
    const view = await this.helpCenterUserViewRepository.findByUserAndVideo(
      user_id,
      video_id
    );
    return view ? this.mapToDTO(view) : null;
  }

  async updateUserView(
    view_id: string,
    updateUserViewDTO: UpdateHelpCenterUserViewDTO
  ): Promise<HelpCenterUserViewDTO | null> {
    // Buscar visualização existente
    const existingViews = await this.helpCenterUserViewRepository.findByUser(
      updateUserViewDTO.user_id || ''
    );
    const existingView = existingViews.find(view => view.view_id === view_id);

    if (!existingView) {
      return null;
    }

    const updatedView = existingView.update(
      updateUserViewDTO.watch_duration,
      updateUserViewDTO.completed
    );

    const savedView =
      await this.helpCenterUserViewRepository.update(updatedView);
    return this.mapToDTO(savedView);
  }

  async deleteUserView(view_id: string): Promise<boolean> {
    try {
      await this.helpCenterUserViewRepository.delete(view_id);
      return true;
    } catch {
      return false;
    }
  }

  async getVideoViewCount(video_id: string): Promise<number> {
    return await this.helpCenterUserViewRepository.getViewCountByVideo(
      video_id
    );
  }

  async getUserViewCount(user_id: string): Promise<number> {
    return await this.helpCenterUserViewRepository.getViewCountByUser(user_id);
  }

  async getCompletedVideosByUser(
    user_id: string
  ): Promise<HelpCenterUserViewDTO[]> {
    const views =
      await this.helpCenterUserViewRepository.getCompletedVideosByUser(user_id);
    return views.map(view => this.mapToDTO(view));
  }

  async trackVideoProgress(
    user_id: string,
    video_id: string,
    watch_duration: number,
    completed: boolean = false
  ): Promise<HelpCenterUserViewDTO> {
    const createDTO: CreateHelpCenterUserViewDTO = {
      user_id,
      video_id,
      watch_duration,
      completed,
    };

    return await this.createUserView(createDTO);
  }

  private mapToDTO(userView: HelpCenterUserView): HelpCenterUserViewDTO {
    return {
      view_id: userView.view_id,
      user_id: userView.user_id,
      video_id: userView.video_id,
      viewed_at: userView.viewed_at,
      watch_duration: userView.watch_duration,
      completed: userView.completed,
    };
  }
}
