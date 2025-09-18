import { HelpCenterSearch } from '../../domain/entities/HelpCenterTheme';

export interface IHelpCenterSearchRepository {
  create(search: HelpCenterSearch): Promise<HelpCenterSearch>;
  findByUser(user_id: string): Promise<HelpCenterSearch[]>;
  getPopularSearches(
    limit?: number
  ): Promise<{ search_term: string; count: number }[]>;
  getRecentSearches(
    user_id: string,
    limit?: number
  ): Promise<HelpCenterSearch[]>;
  delete(search_id: string): Promise<void>;
  deleteByUser(user_id: string): Promise<void>;
}
