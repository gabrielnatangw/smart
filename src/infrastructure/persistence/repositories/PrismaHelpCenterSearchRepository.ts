import { PrismaClient } from '@prisma/client';

import { IHelpCenterSearchRepository } from '../../../application/interfaces/IHelpCenterSearchRepository';
import { HelpCenterSearch } from '../../../domain/entities/HelpCenterTheme';

export class PrismaHelpCenterSearchRepository
  implements IHelpCenterSearchRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  async create(search: HelpCenterSearch): Promise<HelpCenterSearch> {
    const created = await this.prisma.helpCenterSearch.create({
      data: {
        search_id: search.search_id,
        user_id: search.user_id,
        search_term: search.search_term,
        results_count: search.results_count,
        searched_at: search.searched_at,
      },
    });

    return this.mapToEntity(created);
  }

  async findByUser(user_id: string): Promise<HelpCenterSearch[]> {
    const searches = await this.prisma.helpCenterSearch.findMany({
      where: { user_id },
      orderBy: { searched_at: 'desc' },
    });

    return searches.map(search => this.mapToEntity(search));
  }

  async getPopularSearches(
    limit: number = 10
  ): Promise<{ search_term: string; count: number }[]> {
    const popularSearches = await this.prisma.helpCenterSearch.groupBy({
      by: ['search_term'],
      _count: {
        search_term: true,
      },
      orderBy: {
        _count: {
          search_term: 'desc',
        },
      },
      take: limit,
    });

    return popularSearches.map(search => ({
      search_term: search.search_term,
      count: search._count.search_term,
    }));
  }

  async getRecentSearches(
    user_id: string,
    limit: number = 10
  ): Promise<HelpCenterSearch[]> {
    const searches = await this.prisma.helpCenterSearch.findMany({
      where: { user_id },
      orderBy: { searched_at: 'desc' },
      take: limit,
    });

    return searches.map(search => this.mapToEntity(search));
  }

  async delete(search_id: string): Promise<void> {
    await this.prisma.helpCenterSearch.delete({
      where: { search_id },
    });
  }

  async deleteByUser(user_id: string): Promise<void> {
    await this.prisma.helpCenterSearch.deleteMany({
      where: { user_id },
    });
  }

  private mapToEntity(data: any): HelpCenterSearch {
    return new HelpCenterSearch(
      data.search_id,
      data.user_id,
      data.search_term,
      data.results_count,
      data.searched_at
    );
  }
}
