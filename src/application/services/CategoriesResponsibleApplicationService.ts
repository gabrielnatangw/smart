import { CategoriesResponsible } from '../../domain/entities/CategoriesResponsible';
import {
  CategoriesResponsibleResponseDTO,
  CategoriesResponsibleStatisticsDTO,
  CreateCategoriesResponsibleDTO,
  DeleteCategoriesResponsibleDTO,
  FindCategoriesResponsibleByNameDTO,
  GetAllCategoriesResponsibleDTO,
  GetAllCategoriesResponsibleResponseDTO,
  GetCategoriesResponsibleByIdDTO,
  RestoreCategoriesResponsibleDTO,
  UpdateCategoriesResponsibleDTO,
} from '../dto/CategoriesResponsibleDTO';
import { ICategoriesResponsibleRepository } from '../interfaces/ICategoriesResponsibleRepository';

export class CategoriesResponsibleApplicationService {
  constructor(
    private categoriesResponsibleRepository: ICategoriesResponsibleRepository
  ) {}

  async createCategoriesResponsible(
    data: CreateCategoriesResponsibleDTO,
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO> {
    // Validar se já existe uma categoria com o mesmo nome no tenant
    const existingCategory =
      await this.categoriesResponsibleRepository.existsByNameAndTenant(
        data.categoryResponsible,
        tenantId
      );

    if (existingCategory) {
      throw new Error('Já existe uma categoria de responsável com este nome');
    }

    const categoryResponsible =
      await this.categoriesResponsibleRepository.create({
        categoryResponsible: data.categoryResponsible,
        tenantId,
      });

    return this.mapToResponseDTO(categoryResponsible);
  }

  async getCategoriesResponsibleById(
    data: GetCategoriesResponsibleByIdDTO,
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO> {
    const categoryResponsible =
      await this.categoriesResponsibleRepository.findById({
        categoryResponsibleId: data.categoryResponsibleId,
        tenantId,
      });

    if (!categoryResponsible) {
      throw new Error('Categoria de responsável não encontrada');
    }

    return this.mapToResponseDTO(categoryResponsible);
  }

  async getAllCategoriesResponsible(
    data: GetAllCategoriesResponsibleDTO,
    tenantId: string
  ): Promise<GetAllCategoriesResponsibleResponseDTO> {
    const result = await this.categoriesResponsibleRepository.findAll({
      tenantId,
      page: data.page,
      limit: data.limit,
      search: data.search,
      includeDeleted: data.includeDeleted,
    });

    return {
      categoriesResponsible: result.categoriesResponsible,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async updateCategoriesResponsible(
    categoryResponsibleId: string,
    data: UpdateCategoriesResponsibleDTO,
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO> {
    // Verificar se a categoria existe
    const existingCategory =
      await this.categoriesResponsibleRepository.findById({
        categoryResponsibleId,
        tenantId,
      });

    if (!existingCategory) {
      throw new Error('Categoria de responsável não encontrada');
    }

    if (existingCategory.isDeleted()) {
      throw new Error(
        'Não é possível editar uma categoria de responsável excluída'
      );
    }

    // Se estiver alterando o nome, verificar se já existe outra com o mesmo nome
    if (
      data.categoryResponsible &&
      data.categoryResponsible !== existingCategory.categoryResponsible
    ) {
      const categoryWithSameName =
        await this.categoriesResponsibleRepository.existsByNameAndTenant(
          data.categoryResponsible,
          tenantId
        );

      if (categoryWithSameName) {
        throw new Error('Já existe uma categoria de responsável com este nome');
      }
    }

    const updatedCategoryResponsible =
      await this.categoriesResponsibleRepository.update({
        categoryResponsibleId,
        categoryResponsible: data.categoryResponsible,
        tenantId,
      });

    return this.mapToResponseDTO(updatedCategoryResponsible);
  }

  async deleteCategoriesResponsible(
    data: DeleteCategoriesResponsibleDTO,
    tenantId: string
  ): Promise<void> {
    // Verificar se a categoria existe
    const existingCategory =
      await this.categoriesResponsibleRepository.findById({
        categoryResponsibleId: data.categoryResponsibleId,
        tenantId,
      });

    if (!existingCategory) {
      throw new Error('Categoria de responsável não encontrada');
    }

    if (existingCategory.isDeleted()) {
      throw new Error('Categoria de responsável já foi excluída');
    }

    // Verificar se tem responsáveis associados (opcional: decidir se permite excluir com responsáveis)
    const hasResponsible =
      await this.categoriesResponsibleRepository.hasResponsible(
        data.categoryResponsibleId,
        tenantId
      );
    if (hasResponsible) {
      throw new Error(
        'Não é possível excluir uma categoria que possui responsáveis associados'
      );
    }

    await this.categoriesResponsibleRepository.delete({
      categoryResponsibleId: data.categoryResponsibleId,
      tenantId,
    });
  }

  async restoreCategoriesResponsible(
    data: RestoreCategoriesResponsibleDTO,
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO> {
    // Verificar se a categoria existe
    const existingCategory =
      await this.categoriesResponsibleRepository.findById({
        categoryResponsibleId: data.categoryResponsibleId,
        tenantId,
      });

    if (!existingCategory) {
      throw new Error('Categoria de responsável não encontrada');
    }

    if (!existingCategory.isDeleted()) {
      throw new Error('Categoria de responsável não foi excluída');
    }

    const restoredCategoryResponsible =
      await this.categoriesResponsibleRepository.restore({
        categoryResponsibleId: data.categoryResponsibleId,
        tenantId,
      });

    return this.mapToResponseDTO(restoredCategoryResponsible);
  }

  async findCategoriesResponsibleByName(
    data: FindCategoriesResponsibleByNameDTO,
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO[]> {
    const categoriesResponsible =
      await this.categoriesResponsibleRepository.findCategoriesResponsibleByName(
        data.name,
        tenantId
      );

    return categoriesResponsible.map(category =>
      this.mapToResponseDTO(category)
    );
  }

  async findCategoriesWithResponsible(
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO[]> {
    const categoriesResponsible =
      await this.categoriesResponsibleRepository.findCategoriesWithResponsible(
        tenantId
      );
    return categoriesResponsible.map(category =>
      this.mapToResponseDTO(category)
    );
  }

  async findCategoriesWithoutResponsible(
    tenantId: string
  ): Promise<CategoriesResponsibleResponseDTO[]> {
    const categoriesResponsible =
      await this.categoriesResponsibleRepository.findCategoriesWithoutResponsible(
        tenantId
      );
    return categoriesResponsible.map(category =>
      this.mapToResponseDTO(category)
    );
  }

  async getCategoriesResponsibleStatistics(
    tenantId: string
  ): Promise<CategoriesResponsibleStatisticsDTO> {
    const statistics =
      await this.categoriesResponsibleRepository.getStatistics(tenantId);
    return {
      totalCategoriesResponsible: statistics.totalCategoriesResponsible,
      activeCategoriesResponsible: statistics.activeCategoriesResponsible,
      deletedCategoriesResponsible: statistics.deletedCategoriesResponsible,
      categoriesWithResponsible: statistics.categoriesWithResponsible,
      categoriesWithoutResponsible: statistics.categoriesWithoutResponsible,
      averageResponsiblePerCategory: statistics.averageResponsiblePerCategory,
    };
  }

  private mapToResponseDTO(
    categoryResponsible: CategoriesResponsible
  ): CategoriesResponsibleResponseDTO {
    return {
      categoryResponsibleId: categoryResponsible.categoryResponsibleId,
      categoryResponsible: categoryResponsible.categoryResponsible,
      tenantId: categoryResponsible.tenantId,
      createdAt: categoryResponsible.createdAt,
      updatedAt: categoryResponsible.updatedAt,
      deletedAt: categoryResponsible.deletedAt,
    };
  }
}
