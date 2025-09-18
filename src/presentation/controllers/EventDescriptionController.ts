import { Request, Response } from 'express';

import { EventDescriptionApplicationService } from '../../application/services/EventDescriptionApplicationService';
import {
  createEventDescriptionSchema,
  eventDescriptionIdSchema,
  searchByAppSchema,
  searchByProcessOrderSchema,
  searchByResponsibleSchema,
  searchBySensorSchema,
  searchByStopCauseSchema,
  searchEventDescriptionsSchema,
  updateEventDescriptionSchema,
} from '../validators/eventDescriptionValidators';

export class EventDescriptionController {
  constructor(
    private eventDescriptionApplicationService: EventDescriptionApplicationService
  ) {}

  async createEventDescription(req: Request, res: Response): Promise<void> {
    try {
      const validatedData = createEventDescriptionSchema.parse(req.body);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescription =
        await this.eventDescriptionApplicationService.createEventDescription(
          validatedData,
          tenantId
        );

      res.status(201).json({
        success: true,
        message: 'Descrição de evento criada com sucesso',
        data: eventDescription,
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

  async getAllEventDescriptions(req: Request, res: Response): Promise<void> {
    try {
      const validatedParams = searchEventDescriptionsSchema.parse(req.query);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const params = {
        page: validatedParams.page || 1,
        limit: validatedParams.limit || 10,
        filters: {
          search: validatedParams.search,
          app: validatedParams.app,
          viewed: validatedParams.viewed,
          stopCauseId: validatedParams.stopCauseId,
          sensorId: validatedParams.sensorId,
          responsibleId: validatedParams.responsibleId,
          processOrderId: validatedParams.processOrderId,
          dateFrom: validatedParams.dateFrom,
          dateTo: validatedParams.dateTo,
        },
        includeRelations: validatedParams.includeRelations || false,
      };

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getAllEventDescriptions(
          params,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrições de eventos encontradas com sucesso',
        data: eventDescriptions,
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

  async getEventDescriptionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = eventDescriptionIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescription =
        await this.eventDescriptionApplicationService.getEventDescriptionById(
          id,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrição de evento encontrada com sucesso',
        data: eventDescription,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Descrição de evento não encontrada') {
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

  async updateEventDescription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = eventDescriptionIdSchema.parse(req.params);
      const validatedData = updateEventDescriptionSchema.parse(req.body);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescription =
        await this.eventDescriptionApplicationService.updateEventDescription(
          id,
          validatedData,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrição de evento atualizada com sucesso',
        data: eventDescription,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Descrição de evento não encontrada') {
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

  async deleteEventDescription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = eventDescriptionIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      await this.eventDescriptionApplicationService.deleteEventDescription(
        id,
        tenantId
      );

      res.status(200).json({
        success: true,
        message: 'Descrição de evento excluída com sucesso',
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Descrição de evento não encontrada') {
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

  async restoreEventDescription(req: Request, res: Response): Promise<void> {
    try {
      const { id } = eventDescriptionIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescription =
        await this.eventDescriptionApplicationService.restoreEventDescription(
          id,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrição de evento restaurada com sucesso',
        data: eventDescription,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Descrição de evento não encontrada') {
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

  async getEventDescriptionsByApp(req: Request, res: Response): Promise<void> {
    try {
      const { app } = searchByAppSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getEventDescriptionsByApp(
          app,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrições de eventos por aplicação encontradas com sucesso',
        data: eventDescriptions,
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

  async getEventDescriptionsByStopCause(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { stopCauseId } = searchByStopCauseSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getEventDescriptionsByStopCause(
          stopCauseId,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrições de eventos por stop cause encontradas com sucesso',
        data: eventDescriptions,
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

  async getEventDescriptionsBySensor(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { sensorId } = searchBySensorSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getEventDescriptionsBySensor(
          sensorId,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrições de eventos por sensor encontradas com sucesso',
        data: eventDescriptions,
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

  async getEventDescriptionsByResponsible(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { responsibleId } = searchByResponsibleSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getEventDescriptionsByResponsible(
          responsibleId,
          tenantId
        );

      res.status(200).json({
        success: true,
        message:
          'Descrições de eventos por responsável encontradas com sucesso',
        data: eventDescriptions,
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

  async getEventDescriptionsByProcessOrder(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { processOrderId } = searchByProcessOrderSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getEventDescriptionsByProcessOrder(
          processOrderId,
          tenantId
        );

      res.status(200).json({
        success: true,
        message:
          'Descrições de eventos por ordem de processo encontradas com sucesso',
        data: eventDescriptions,
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

  async getUnviewedEventDescriptions(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescriptions =
        await this.eventDescriptionApplicationService.getUnviewedEventDescriptions(
          tenantId
        );

      res.status(200).json({
        success: true,
        message:
          'Descrições de eventos não visualizadas encontradas com sucesso',
        data: eventDescriptions,
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

  async markEventDescriptionAsViewed(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { id } = eventDescriptionIdSchema.parse(req.params);
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const eventDescription =
        await this.eventDescriptionApplicationService.markEventDescriptionAsViewed(
          id,
          tenantId
        );

      res.status(200).json({
        success: true,
        message: 'Descrição de evento marcada como visualizada com sucesso',
        data: eventDescription,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Descrição de evento não encontrada') {
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

  async markAllEventDescriptionsAsViewed(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      await this.eventDescriptionApplicationService.markAllEventDescriptionsAsViewed(
        tenantId
      );

      res.status(200).json({
        success: true,
        message:
          'Todas as descrições de eventos foram marcadas como visualizadas com sucesso',
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

  async getEventDescriptionStatistics(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;

      const statistics =
        await this.eventDescriptionApplicationService.getEventDescriptionStatistics(
          tenantId
        );

      res.status(200).json({
        success: true,
        message:
          'Estatísticas das descrições de eventos encontradas com sucesso',
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
