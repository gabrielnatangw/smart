import {
  CreateResponsibleRequest,
  PaginatedResponsiblesResponse,
  Responsible,
  ResponsibleStatistics,
  UpdateResponsibleRequest,
} from '../../domain/entities/Responsible';
import { IResponsibleRepository } from '../interfaces/IResponsibleRepository';

export class ResponsibleApplicationService {
  constructor(private responsibleRepository: IResponsibleRepository) {}

  // CRUD Operations
  async createResponsible(
    data: CreateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible> {
    // Validações de negócio
    if (
      await this.responsibleRepository.existsByCode(
        data.codeResponsible,
        tenantId
      )
    ) {
      throw new Error('Código do responsável já existe');
    }

    if (await this.responsibleRepository.existsByName(data.name, tenantId)) {
      throw new Error('Nome do responsável já existe');
    }

    return this.responsibleRepository.create(data, tenantId);
  }

  async getResponsibleById(
    responsibleId: string,
    tenantId: string
  ): Promise<Responsible> {
    const responsible = await this.responsibleRepository.findById(
      responsibleId,
      tenantId
    );
    if (!responsible) {
      throw new Error('Responsável não encontrado');
    }
    return responsible;
  }

  async getAllResponsibles(
    params: {
      page?: number;
      limit?: number;
      search?: string;
      includeDeleted?: boolean;
      includeCategory?: boolean;
    },
    tenantId: string
  ): Promise<PaginatedResponsiblesResponse> {
    return this.responsibleRepository.findAll(params, tenantId);
  }

  async updateResponsible(
    responsibleId: string,
    data: UpdateResponsibleRequest,
    tenantId: string
  ): Promise<Responsible> {
    // Verificar se o responsável existe
    const existingResponsible = await this.responsibleRepository.findById(
      responsibleId,
      tenantId
    );
    if (!existingResponsible) {
      throw new Error('Responsável não encontrado');
    }

    // Validações de negócio para atualização
    if (
      data.codeResponsible &&
      (await this.responsibleRepository.existsByCode(
        data.codeResponsible,
        tenantId,
        responsibleId
      ))
    ) {
      throw new Error('Código do responsável já existe');
    }

    if (
      data.name &&
      (await this.responsibleRepository.existsByName(
        data.name,
        tenantId,
        responsibleId
      ))
    ) {
      throw new Error('Nome do responsável já existe');
    }

    return this.responsibleRepository.update(responsibleId, data, tenantId);
  }

  async deleteResponsible(
    responsibleId: string,
    tenantId: string
  ): Promise<void> {
    const responsible = await this.responsibleRepository.findById(
      responsibleId,
      tenantId
    );
    if (!responsible) {
      throw new Error('Responsável não encontrado');
    }

    if (responsible.deletedAt) {
      throw new Error('Responsável já está excluído');
    }

    await this.responsibleRepository.delete(responsibleId, tenantId);
  }

  async restoreResponsible(
    responsibleId: string,
    tenantId: string
  ): Promise<Responsible> {
    const responsible = await this.responsibleRepository.findById(
      responsibleId,
      tenantId
    );
    if (!responsible) {
      throw new Error('Responsável não encontrado');
    }

    if (!responsible.deletedAt) {
      throw new Error('Responsável não está excluído');
    }

    return this.responsibleRepository.restore(responsibleId, tenantId);
  }

  // Business Operations
  async getResponsiblesByCategory(
    categoryResponsibleId: string,
    tenantId: string
  ): Promise<Responsible[]> {
    return this.responsibleRepository.findByCategory(
      categoryResponsibleId,
      tenantId
    );
  }

  async getResponsiblesWithoutCategory(
    tenantId: string
  ): Promise<Responsible[]> {
    return this.responsibleRepository.findWithoutCategory(tenantId);
  }

  async getResponsibleByCode(
    codeResponsible: string,
    tenantId: string
  ): Promise<Responsible | null> {
    return this.responsibleRepository.findByCode(codeResponsible, tenantId);
  }

  async getResponsiblesByName(
    name: string,
    tenantId: string
  ): Promise<Responsible[]> {
    return this.responsibleRepository.findByName(name, tenantId);
  }

  // Statistics
  async getResponsibleStatistics(
    tenantId: string
  ): Promise<ResponsibleStatistics> {
    return this.responsibleRepository.getStatistics(tenantId);
  }
}
