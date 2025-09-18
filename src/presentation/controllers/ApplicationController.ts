import { Request, Response } from 'express';

import { ApplicationApplicationService } from '../../application/services/ApplicationApplicationService';
import {
  applicationIdSchema,
  createApplicationSchema,
  searchApplicationsSchema,
  searchByDisplayNameSchema,
  searchByNameSchema,
  updateApplicationSchema,
} from '../validators/applicationValidators';

export class ApplicationController {
  constructor(
    private applicationApplicationService: ApplicationApplicationService
  ) {}

  async createApplication(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createApplicationSchema.parse(req.body);

      const application =
        await this.applicationApplicationService.createApplication({
          ...validatedData,
          description: validatedData.description || undefined,
        });

      res.status(201).json({
        success: true,
        message: 'Aplicação criada com sucesso',
        data: application,
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

  async getAllApplications(req: Request, res: Response): Promise<void> {
    try {
      const validatedParams = searchApplicationsSchema.parse(req.query);

      const params = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        search: validatedParams.search || undefined,
        includeDeleted: validatedParams.includeDeleted || false,
        isActive: validatedParams.isActive,
      };

      const applications =
        await this.applicationApplicationService.getAllApplications(params);

      res.status(200).json({
        success: true,
        message: 'Aplicações encontradas com sucesso',
        data: applications,
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

  async getApplicationById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = applicationIdSchema.parse(req.params);

      const application =
        await this.applicationApplicationService.getApplicationById(id);

      res.status(200).json({
        success: true,
        message: 'Aplicação encontrada com sucesso',
        data: application,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Aplicação não encontrada') {
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

  async updateApplication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = applicationIdSchema.parse(req.params);
      const validatedData = updateApplicationSchema.parse(req.body);

      const application =
        await this.applicationApplicationService.updateApplication(
          id,
          validatedData
        );

      res.status(200).json({
        success: true,
        message: 'Aplicação atualizada com sucesso',
        data: application,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Aplicação não encontrada') {
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

  async deleteApplication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = applicationIdSchema.parse(req.params);

      await this.applicationApplicationService.deleteApplication(id);

      res.status(200).json({
        success: true,
        message: 'Aplicação excluída com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Aplicação não encontrada') {
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

  async restoreApplication(req: Request, res: Response): Promise<void> {
    try {
      const { id } = applicationIdSchema.parse(req.params);

      const application =
        await this.applicationApplicationService.restoreApplication(id);

      res.status(200).json({
        success: true,
        message: 'Aplicação restaurada com sucesso',
        data: application,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Aplicação não encontrada') {
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

  async getApplicationByName(req: Request, res: Response): Promise<void> {
    try {
      const { name } = searchByNameSchema.parse(req.params);

      const application =
        await this.applicationApplicationService.getApplicationByName(name);

      if (!application) {
        res.status(404).json({
          success: false,
          message: 'Aplicação não encontrada',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aplicação encontrada com sucesso',
        data: application,
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

  async getApplicationsByDisplayName(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { displayName } = searchByDisplayNameSchema.parse(req.params);

      const applications =
        await this.applicationApplicationService.getApplicationsByDisplayName(
          displayName
        );

      res.status(200).json({
        success: true,
        message: 'Aplicações por nome de exibição encontradas com sucesso',
        data: applications,
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

  async getActiveApplications(req: Request, res: Response): Promise<void> {
    try {
      const applications =
        await this.applicationApplicationService.getActiveApplications();

      res.status(200).json({
        success: true,
        message: 'Aplicações ativas encontradas com sucesso',
        data: applications,
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

  async getInactiveApplications(req: Request, res: Response): Promise<void> {
    try {
      const applications =
        await this.applicationApplicationService.getInactiveApplications();

      res.status(200).json({
        success: true,
        message: 'Aplicações inativas encontradas com sucesso',
        data: applications,
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

  async getApplicationStatistics(req: Request, res: Response): Promise<void> {
    try {
      const statistics =
        await this.applicationApplicationService.getApplicationStatistics();

      res.status(200).json({
        success: true,
        message: 'Estatísticas das aplicações encontradas com sucesso',
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
