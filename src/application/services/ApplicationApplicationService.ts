import {
  Application,
  ApplicationStatistics,
  CreateApplicationRequest,
  PaginatedApplicationsResponse,
  UpdateApplicationRequest,
} from '../../domain/entities/Application';
import { IApplicationRepository } from '../interfaces/IApplicationRepository';

export class ApplicationApplicationService {
  constructor(private applicationRepository: IApplicationRepository) {}

  // CRUD Operations
  async createApplication(
    data: CreateApplicationRequest
  ): Promise<Application> {
    // Validações de negócio
    if (await this.applicationRepository.existsByName(data.name)) {
      throw new Error('Nome da aplicação já existe');
    }

    if (
      await this.applicationRepository.existsByDisplayName(data.displayName)
    ) {
      throw new Error('Nome de exibição da aplicação já existe');
    }

    return this.applicationRepository.create(data);
  }

  async getApplicationById(applicationId: string): Promise<Application> {
    const application =
      await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Aplicação não encontrada');
    }
    return application;
  }

  async getAllApplications(params: {
    page?: number;
    limit?: number;
    search?: string;
    includeDeleted?: boolean;
    isActive?: boolean;
  }): Promise<PaginatedApplicationsResponse> {
    return this.applicationRepository.findAll(params);
  }

  async updateApplication(
    applicationId: string,
    data: UpdateApplicationRequest
  ): Promise<Application> {
    // Verificar se a aplicação existe
    const existingApplication =
      await this.applicationRepository.findById(applicationId);
    if (!existingApplication) {
      throw new Error('Aplicação não encontrada');
    }

    // Validações de negócio para atualização
    if (
      data.name &&
      (await this.applicationRepository.existsByName(data.name, applicationId))
    ) {
      throw new Error('Nome da aplicação já existe');
    }

    if (
      data.displayName &&
      (await this.applicationRepository.existsByDisplayName(
        data.displayName,
        applicationId
      ))
    ) {
      throw new Error('Nome de exibição da aplicação já existe');
    }

    return this.applicationRepository.update(applicationId, data);
  }

  async deleteApplication(applicationId: string): Promise<void> {
    const application =
      await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Aplicação não encontrada');
    }

    if (application.deletedAt) {
      throw new Error('Aplicação já está excluída');
    }

    await this.applicationRepository.delete(applicationId);
  }

  async restoreApplication(applicationId: string): Promise<Application> {
    const application =
      await this.applicationRepository.findById(applicationId);
    if (!application) {
      throw new Error('Aplicação não encontrada');
    }

    if (!application.deletedAt) {
      throw new Error('Aplicação não está excluída');
    }

    return this.applicationRepository.restore(applicationId);
  }

  // Business Operations
  async getApplicationByName(name: string): Promise<Application | null> {
    return this.applicationRepository.findByName(name);
  }

  async getApplicationsByDisplayName(
    displayName: string
  ): Promise<Application[]> {
    return this.applicationRepository.findByDisplayName(displayName);
  }

  async getActiveApplications(): Promise<Application[]> {
    return this.applicationRepository.findActive();
  }

  async getInactiveApplications(): Promise<Application[]> {
    return this.applicationRepository.findInactive();
  }

  // Statistics
  async getApplicationStatistics(): Promise<ApplicationStatistics> {
    return this.applicationRepository.getStatistics();
  }
}
