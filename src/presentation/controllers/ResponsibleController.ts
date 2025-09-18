import { Request, Response } from 'express';

import { ResponsibleApplicationService } from '../../application/services/ResponsibleApplicationService';
import {
  createResponsibleSchema,
  responsibleIdSchema,
  searchByCategorySchema,
  searchByCodeSchema,
  searchByNameSchema,
  searchResponsiblesSchema,
  updateResponsibleSchema,
} from '../validators/responsibleValidators';

export class ResponsibleController {
  constructor(
    private responsibleApplicationService: ResponsibleApplicationService
  ) {}

  async createResponsible(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createResponsibleSchema.parse(req.body);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsible =
        await this.responsibleApplicationService.createResponsible(
          validatedData,
          tenantId
        );

      res.status(201).json({
        success: true,
        message: 'Responsável criado com sucesso',
        data: responsible,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getAllResponsibles(req: Request, res: Response): Promise<void> {
    try {
      const validatedParams = searchResponsiblesSchema.parse(req.query);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const params = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        search: validatedParams.search,
        includeDeleted: validatedParams.includeDeleted || false,
        includeCategory: validatedParams.includeCategory || false,
      };

      const responsibles =
        await this.responsibleApplicationService.getAllResponsibles(
          params,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsáveis encontrados com sucesso',
        data: responsibles,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsibleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = responsibleIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsible =
        await this.responsibleApplicationService.getResponsibleById(
          id,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsável encontrado com sucesso',
        data: responsible,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Responsável não encontrado') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async updateResponsible(req: Request, res: Response): Promise<void> {
    try {
      const { id } = responsibleIdSchema.parse(req.params);
      const validatedData = updateResponsibleSchema.parse(req.body);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsible =
        await this.responsibleApplicationService.updateResponsible(
          id,
          validatedData,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsável atualizado com sucesso',
        data: responsible,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Responsável não encontrado') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async deleteResponsible(req: Request, res: Response): Promise<void> {
    try {
      const { id } = responsibleIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      await this.responsibleApplicationService.deleteResponsible(id, tenantId);

      res.status(200).json({
        success: true,
        message: 'Responsável excluído com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Responsável não encontrado') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async restoreResponsible(req: Request, res: Response): Promise<void> {
    try {
      const { id } = responsibleIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsible =
        await this.responsibleApplicationService.restoreResponsible(
          id,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsável restaurado com sucesso',
        data: responsible,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Responsável não encontrado') {
          res.status(404).json({
            success: false,
            message: error.message,
          });
        } else {
          res.status(400).json({
            success: false,
            message: error.message,
          });
        }
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsiblesByCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryResponsibleId } = searchByCategorySchema.parse(
        req.params
      );
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsibles =
        await this.responsibleApplicationService.getResponsiblesByCategory(
          categoryResponsibleId,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsáveis por categoria encontrados com sucesso',
        data: responsibles,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsiblesWithoutCategory(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsibles =
        await this.responsibleApplicationService.getResponsiblesWithoutCategory(
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsáveis sem categoria encontrados com sucesso',
        data: responsibles,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsibleByCode(req: Request, res: Response): Promise<void> {
    try {
      const { codeResponsible } = searchByCodeSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsible =
        await this.responsibleApplicationService.getResponsibleByCode(
          codeResponsible,
          tenantId
        );

      if (!responsible) {
        res.status(404).json({
          success: false,
          message: 'Responsável não encontrado',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Responsável encontrado com sucesso',
        data: responsible,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsiblesByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = searchByNameSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const responsibles =
        await this.responsibleApplicationService.getResponsiblesByName(
          name,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Responsáveis por nome encontrados com sucesso',
        data: responsibles,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }

  async getResponsibleStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const statistics =
        await this.responsibleApplicationService.getResponsibleStatistics(
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Estatísticas dos responsáveis encontradas com sucesso',
        data: statistics,
      });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
      }
    }
  }
}
