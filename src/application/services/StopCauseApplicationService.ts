import { StopCause } from '../../domain/entities/StopCause';
import {
  CreateStopCauseDTO,
  DeleteStopCauseDTO,
  GetAllStopCausesDTO,
  GetAllStopCausesResponseDTO,
  GetHierarchyDTO,
  GetStopCauseByIdDTO,
  GetStopCausesByDescriptionDTO,
  GetStopCausesByLevelDTO,
  MoveStopCauseDTO,
  RestoreStopCauseDTO,
  StopCauseHierarchyResponseDTO,
  StopCauseResponseDTO,
  StopCauseStatisticsDTO,
  StopCauseTreeDTO,
  UpdateStopCauseDTO,
} from '../dto/StopCauseDTO';
import { IStopCauseRepository } from '../interfaces/IStopCauseRepository';

export class StopCauseApplicationService {
  constructor(private stopCauseRepository: IStopCauseRepository) {}

  async createStopCause(
    data: CreateStopCauseDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO> {
    // Validar se já existe uma causa de parada com a mesma descrição no tenant
    const existingStopCause =
      await this.stopCauseRepository.existsByDescriptionAndTenant(
        data.description,
        tenantId
      );

    if (existingStopCause) {
      throw new Error('Já existe uma causa de parada com esta descrição');
    }

    // Se tem pai, validar se o pai existe
    if (data.parentId) {
      const parentExists = await this.stopCauseRepository.existsByIdAndTenant(
        data.parentId,
        tenantId
      );

      if (!parentExists) {
        throw new Error('Causa de parada pai não encontrada');
      }
    }

    const stopCause = await this.stopCauseRepository.create({
      description: data.description,
      parentId: data.parentId,
      tenantId,
    });

    return this.mapToResponseDTO(stopCause);
  }

  async getStopCauseById(
    data: GetStopCauseByIdDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO> {
    const stopCause = await this.stopCauseRepository.findById({
      stopCauseId: data.stopCauseId,
      tenantId,
    });

    if (!stopCause) {
      throw new Error('Causa de parada não encontrada');
    }

    return this.mapToResponseDTO(stopCause);
  }

  async getAllStopCauses(
    data: GetAllStopCausesDTO,
    tenantId: string
  ): Promise<GetAllStopCausesResponseDTO> {
    const result = await this.stopCauseRepository.findAll({
      tenantId,
      page: data.page,
      limit: data.limit,
      search: data.search,
      includeDeleted: data.includeDeleted,
      includeHierarchy: data.includeHierarchy,
    });

    return {
      stopCauses: result.stopCauses,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  async updateStopCause(
    stopCauseId: string,
    data: UpdateStopCauseDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO> {
    // Verificar se a causa de parada existe
    const existingStopCause = await this.stopCauseRepository.findById({
      stopCauseId,
      tenantId,
    });

    if (!existingStopCause) {
      throw new Error('Causa de parada não encontrada');
    }

    if (existingStopCause.isDeleted()) {
      throw new Error('Não é possível editar uma causa de parada excluída');
    }

    // Se estiver alterando a descrição, verificar se já existe outra com a mesma descrição
    if (
      data.description &&
      data.description !== existingStopCause.description
    ) {
      const stopCauseWithSameDescription =
        await this.stopCauseRepository.existsByDescriptionAndTenant(
          data.description,
          tenantId
        );

      if (stopCauseWithSameDescription) {
        throw new Error('Já existe uma causa de parada com esta descrição');
      }
    }

    // Se estiver alterando o pai, validar hierarquia
    if (
      data.parentId !== undefined &&
      data.parentId !== existingStopCause.parentId
    ) {
      // Validar que não está tentando se tornar pai de si mesmo
      if (data.parentId === stopCauseId) {
        throw new Error('Uma causa de parada não pode ser pai de si mesma');
      }

      // Validar que o novo pai existe
      if (data.parentId) {
        const parentExists = await this.stopCauseRepository.existsByIdAndTenant(
          data.parentId,
          tenantId
        );

        if (!parentExists) {
          throw new Error('Causa de parada pai não encontrada');
        }

        // Validar que não está criando um ciclo (pai não pode ser filho de um de seus filhos)
        const isDescendant = await this.stopCauseRepository.isDescendantOf(
          data.parentId,
          stopCauseId,
          tenantId
        );

        if (isDescendant) {
          throw new Error('Não é possível criar um ciclo hierárquico');
        }
      }
    }

    const updatedStopCause = await this.stopCauseRepository.update({
      stopCauseId,
      description: data.description,
      parentId: data.parentId,
      tenantId,
    });

    return this.mapToResponseDTO(updatedStopCause);
  }

  async deleteStopCause(
    data: DeleteStopCauseDTO,
    tenantId: string
  ): Promise<void> {
    // Verificar se a causa de parada existe
    const existingStopCause = await this.stopCauseRepository.findById({
      stopCauseId: data.stopCauseId,
      tenantId,
    });

    if (!existingStopCause) {
      throw new Error('Causa de parada não encontrada');
    }

    if (existingStopCause.isDeleted()) {
      throw new Error('Causa de parada já foi excluída');
    }

    // Verificar se tem filhos (opcional: decidir se permite excluir com filhos)
    const hasChildren = await this.stopCauseRepository.hasChildren(
      data.stopCauseId,
      tenantId
    );
    if (hasChildren) {
      throw new Error(
        'Não é possível excluir uma causa de parada que possui filhos'
      );
    }

    await this.stopCauseRepository.delete({
      stopCauseId: data.stopCauseId,
      tenantId,
    });
  }

  async restoreStopCause(
    data: RestoreStopCauseDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO> {
    // Verificar se a causa de parada existe
    const existingStopCause = await this.stopCauseRepository.findById({
      stopCauseId: data.stopCauseId,
      tenantId,
    });

    if (!existingStopCause) {
      throw new Error('Causa de parada não encontrada');
    }

    if (!existingStopCause.isDeleted()) {
      throw new Error('Causa de parada não foi excluída');
    }

    const restoredStopCause = await this.stopCauseRepository.restore({
      stopCauseId: data.stopCauseId,
      tenantId,
    });

    return this.mapToResponseDTO(restoredStopCause);
  }

  async getHierarchy(
    data: GetHierarchyDTO,
    tenantId: string
  ): Promise<StopCauseHierarchyResponseDTO> {
    const result = await this.stopCauseRepository.getHierarchy({
      tenantId,
      includeDeleted: data.includeDeleted,
    });

    return {
      stopCauses: result.stopCauses,
      total: result.total,
      rootCount: result.rootCount,
      maxDepth: result.maxDepth,
    };
  }

  async getRootStopCauses(tenantId: string): Promise<StopCauseResponseDTO[]> {
    const rootStopCauses =
      await this.stopCauseRepository.getRootStopCauses(tenantId);
    return rootStopCauses.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async getChildren(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCauseResponseDTO[]> {
    // Verificar se a causa de parada existe
    const exists = await this.stopCauseRepository.existsByIdAndTenant(
      stopCauseId,
      tenantId
    );
    if (!exists) {
      throw new Error('Causa de parada não encontrada');
    }

    const children = await this.stopCauseRepository.getChildren(
      stopCauseId,
      tenantId
    );
    return children.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async getParent(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCauseResponseDTO | null> {
    // Verificar se a causa de parada existe
    const exists = await this.stopCauseRepository.existsByIdAndTenant(
      stopCauseId,
      tenantId
    );
    if (!exists) {
      throw new Error('Causa de parada não encontrada');
    }

    const parent = await this.stopCauseRepository.getParent(
      stopCauseId,
      tenantId
    );
    return parent ? this.mapToResponseDTO(parent) : null;
  }

  async getAncestors(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCauseResponseDTO[]> {
    // Verificar se a causa de parada existe
    const exists = await this.stopCauseRepository.existsByIdAndTenant(
      stopCauseId,
      tenantId
    );
    if (!exists) {
      throw new Error('Causa de parada não encontrada');
    }

    const ancestors = await this.stopCauseRepository.getAncestors(
      stopCauseId,
      tenantId
    );
    return ancestors.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async getDescendants(
    stopCauseId: string,
    tenantId: string
  ): Promise<StopCauseResponseDTO[]> {
    // Verificar se a causa de parada existe
    const exists = await this.stopCauseRepository.existsByIdAndTenant(
      stopCauseId,
      tenantId
    );
    if (!exists) {
      throw new Error('Causa de parada não encontrada');
    }

    const descendants = await this.stopCauseRepository.getDescendants(
      stopCauseId,
      tenantId
    );
    return descendants.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async moveStopCause(
    data: MoveStopCauseDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO> {
    // Verificar se a causa de parada existe
    const exists = await this.stopCauseRepository.existsByIdAndTenant(
      data.stopCauseId,
      tenantId
    );
    if (!exists) {
      throw new Error('Causa de parada não encontrada');
    }

    // Se tem novo pai, validar que existe
    if (data.newParentId) {
      const parentExists = await this.stopCauseRepository.existsByIdAndTenant(
        data.newParentId,
        tenantId
      );

      if (!parentExists) {
        throw new Error('Causa de parada pai não encontrada');
      }

      // Validar que não está tentando se tornar pai de si mesmo
      if (data.newParentId === data.stopCauseId) {
        throw new Error('Uma causa de parada não pode ser pai de si mesma');
      }

      // Validar que não está criando um ciclo
      const isDescendant = await this.stopCauseRepository.isDescendantOf(
        data.newParentId,
        data.stopCauseId,
        tenantId
      );

      if (isDescendant) {
        throw new Error('Não é possível criar um ciclo hierárquico');
      }
    }

    const movedStopCause = await this.stopCauseRepository.moveStopCause({
      stopCauseId: data.stopCauseId,
      newParentId: data.newParentId,
      tenantId,
    });

    return this.mapToResponseDTO(movedStopCause);
  }

  async findRootStopCauses(tenantId: string): Promise<StopCauseResponseDTO[]> {
    const rootStopCauses =
      await this.stopCauseRepository.findRootStopCauses(tenantId);
    return rootStopCauses.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async findLeafStopCauses(tenantId: string): Promise<StopCauseResponseDTO[]> {
    const leafStopCauses =
      await this.stopCauseRepository.findLeafStopCauses(tenantId);
    return leafStopCauses.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async findStopCausesByLevel(
    data: GetStopCausesByLevelDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO[]> {
    const stopCauses = await this.stopCauseRepository.findStopCausesByLevel(
      data.level,
      tenantId
    );
    return stopCauses.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async findStopCausesByDescription(
    data: GetStopCausesByDescriptionDTO,
    tenantId: string
  ): Promise<StopCauseResponseDTO[]> {
    const stopCauses =
      await this.stopCauseRepository.findStopCausesByDescription(
        data.description,
        tenantId
      );
    return stopCauses.map(stopCause => this.mapToResponseDTO(stopCause));
  }

  async getStopCauseStatistics(
    tenantId: string
  ): Promise<StopCauseStatisticsDTO> {
    const statistics = await this.stopCauseRepository.getStatistics(tenantId);
    return {
      totalStopCauses: statistics.totalStopCauses,
      activeStopCauses: statistics.activeStopCauses,
      deletedStopCauses: statistics.deletedStopCauses,
      rootStopCauses: statistics.rootStopCauses,
      leafStopCauses: statistics.leafStopCauses,
      averageDepth: statistics.averageDepth,
      maxDepth: statistics.maxDepth,
      stopCausesByLevel: statistics.stopCausesByLevel,
    };
  }

  async getStopCauseTree(tenantId: string): Promise<StopCauseTreeDTO[]> {
    const hierarchy = await this.stopCauseRepository.getHierarchy({
      tenantId,
      includeDeleted: false,
    });

    return this.buildTreeFromHierarchy(hierarchy.stopCauses);
  }

  private buildTreeFromHierarchy(stopCauses: any[]): StopCauseTreeDTO[] {
    const stopCauseMap = new Map<string, StopCauseTreeDTO>();
    const rootNodes: StopCauseTreeDTO[] = [];

    // Criar nós para todas as causas de parada
    stopCauses.forEach(stopCause => {
      stopCauseMap.set(stopCause.stopCauseId, {
        stopCauseId: stopCause.stopCauseId,
        description: stopCause.description,
        level: stopCause.level,
        children: [],
        isExpanded: false,
        isSelected: false,
      });
    });

    // Construir a árvore
    stopCauses.forEach(stopCause => {
      const node = stopCauseMap.get(stopCause.stopCauseId);
      if (!node) return;

      if (stopCause.isRoot) {
        rootNodes.push(node);
      } else if (stopCause.parentId) {
        const parent = stopCauseMap.get(stopCause.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    });

    return rootNodes;
  }

  private mapToResponseDTO(stopCause: StopCause): StopCauseResponseDTO {
    const parent = stopCause.parent
      ? this.mapToResponseDTO(stopCause.parent)
      : undefined;
    const children = stopCause.children
      ? stopCause.children.map(child => this.mapToResponseDTO(child))
      : undefined;

    return {
      stopCauseId: stopCause.stopCauseId,
      description: stopCause.description,
      tenantId: stopCause.tenantId,
      createdAt: stopCause.createdAt,
      updatedAt: stopCause.updatedAt,
      deletedAt: stopCause.deletedAt,
      parentId: stopCause.parentId,
      parent,
      children,
      level: stopCause.getLevel(),
      isRoot: stopCause.isRoot(),
      isLeaf: stopCause.isLeaf(),
    };
  }
}
