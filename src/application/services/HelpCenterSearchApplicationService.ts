import { HelpCenterSearch } from '../../domain/entities/HelpCenterTheme';
import {
  CreateHelpCenterSearchDTO,
  HelpCenterSearchDTO,
  HelpCenterSearchResultDTO,
} from '../dto/HelpCenterThemeDTO';
import { IHelpCenterSearchRepository } from '../interfaces/IHelpCenterSearchRepository';

export class HelpCenterSearchApplicationService {
  constructor(
    private readonly helpCenterSearchRepository: IHelpCenterSearchRepository
  ) {}

  async createSearch(
    createSearchDTO: CreateHelpCenterSearchDTO
  ): Promise<HelpCenterSearchDTO> {
    const search = HelpCenterSearch.create(
      createSearchDTO.search_term,
      createSearchDTO.results_count,
      createSearchDTO.user_id
    );

    const createdSearch = await this.helpCenterSearchRepository.create(search);
    return this.mapToDTO(createdSearch);
  }

  async getUserSearches(user_id: string): Promise<HelpCenterSearchDTO[]> {
    const searches = await this.helpCenterSearchRepository.findByUser(user_id);
    return searches.map(search => this.mapToDTO(search));
  }

  async getPopularSearches(
    limit: number = 10
  ): Promise<HelpCenterSearchResultDTO[]> {
    return await this.helpCenterSearchRepository.getPopularSearches(limit);
  }

  async getRecentSearches(
    user_id: string,
    limit: number = 10
  ): Promise<HelpCenterSearchDTO[]> {
    const searches = await this.helpCenterSearchRepository.getRecentSearches(
      user_id,
      limit
    );
    return searches.map(search => this.mapToDTO(search));
  }

  async deleteSearch(search_id: string): Promise<boolean> {
    try {
      await this.helpCenterSearchRepository.delete(search_id);
      return true;
    } catch {
      return false;
    }
  }

  async deleteUserSearches(user_id: string): Promise<boolean> {
    try {
      await this.helpCenterSearchRepository.deleteByUser(user_id);
      return true;
    } catch {
      return false;
    }
  }

  async trackSearch(
    search_term: string,
    results_count: number,
    user_id?: string
  ): Promise<HelpCenterSearchDTO> {
    const createDTO: CreateHelpCenterSearchDTO = {
      search_term,
      results_count,
      user_id,
    };

    return await this.createSearch(createDTO);
  }

  private mapToDTO(search: HelpCenterSearch): HelpCenterSearchDTO {
    return {
      search_id: search.search_id,
      user_id: search.user_id,
      search_term: search.search_term,
      results_count: search.results_count,
      searched_at: search.searched_at,
    };
  }
}
