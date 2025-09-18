import { Request, Response } from 'express';

import { ShiftApplicationService } from '../../application/services/ShiftApplicationService';
import {
  CreateShiftRequest,
  GetShiftsByTimeRangeRequest,
  UpdateShiftRequest,
} from '../validators/shiftValidators';

export class ShiftController {
  constructor(private shiftApplicationService: ShiftApplicationService) {}

  async createShift(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const shiftData: CreateShiftRequest = req.body;
      const shift = await this.shiftApplicationService.createShift(
        shiftData,
        tenantId
      );

      res.status(201).json({
        message: 'Turno criado com sucesso',
        data: shift,
      });
    } catch (error) {
      console.error('Erro ao criar turno:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getShiftById(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const { shiftId } = req.params;
      if (!shiftId) {
        res.status(400).json({ error: 'ID do turno é obrigatório' });
        return;
      }
      const shift = await this.shiftApplicationService.getShiftById(
        { shiftId },
        tenantId
      );

      res.status(200).json({
        message: 'Turno encontrado com sucesso',
        data: shift,
      });
    } catch (error) {
      console.error('Erro ao buscar turno:', error);
      res.status(404).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getAllShifts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const queryData = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        search: req.query.search as string,
        includeDeleted: req.query.includeDeleted === 'true',
      } as any;
      const shifts = await this.shiftApplicationService.getAllShifts(
        queryData,
        tenantId
      );

      res.status(200).json({
        message: 'Turnos encontrados com sucesso',
        data: shifts,
      });
    } catch (error) {
      console.error('Erro ao buscar turnos:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async updateShift(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const { shiftId } = req.params;
      if (!shiftId) {
        res.status(400).json({ error: 'ID do turno é obrigatório' });
        return;
      }
      const shiftData: UpdateShiftRequest = req.body;
      const shift = await this.shiftApplicationService.updateShift(
        shiftId,
        shiftData,
        tenantId
      );

      res.status(200).json({
        message: 'Turno atualizado com sucesso',
        data: shift,
      });
    } catch (error) {
      console.error('Erro ao atualizar turno:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async deleteShift(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const { shiftId } = req.params;
      if (!shiftId) {
        res.status(400).json({ error: 'ID do turno é obrigatório' });
        return;
      }
      await this.shiftApplicationService.deleteShift({ shiftId }, tenantId);

      res.status(200).json({
        message: 'Turno excluído com sucesso',
      });
    } catch (error) {
      console.error('Erro ao excluir turno:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async restoreShift(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const { shiftId } = req.params;
      if (!shiftId) {
        res.status(400).json({ error: 'ID do turno é obrigatório' });
        return;
      }
      const shift = await this.shiftApplicationService.restoreShift(
        { shiftId },
        tenantId
      );

      res.status(200).json({
        message: 'Turno restaurado com sucesso',
        data: shift,
      });
    } catch (error) {
      console.error('Erro ao restaurar turno:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getActiveShifts(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const shifts =
        await this.shiftApplicationService.getActiveShifts(tenantId);

      res.status(200).json({
        message: 'Turnos ativos encontrados com sucesso',
        data: shifts,
      });
    } catch (error) {
      console.error('Erro ao buscar turnos ativos:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getShiftsByTimeRange(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const { startTime, endTime }: GetShiftsByTimeRangeRequest =
        req.query as any;
      const shifts = await this.shiftApplicationService.getShiftsByTimeRange(
        startTime,
        endTime,
        tenantId
      );

      res.status(200).json({
        message: 'Turnos encontrados com sucesso',
        data: shifts,
      });
    } catch (error) {
      console.error('Erro ao buscar turnos por período:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }

  async getShiftStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).tenant?.id || (req as any).user?.tenantId;
      if (!tenantId) {
        res.status(400).json({ error: 'Tenant ID não encontrado' });
        return;
      }

      const statistics =
        await this.shiftApplicationService.getShiftStatistics(tenantId);

      res.status(200).json({
        message: 'Estatísticas dos turnos encontradas com sucesso',
        data: statistics,
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas dos turnos:', error);
      res.status(400).json({
        error:
          error instanceof Error ? error.message : 'Erro interno do servidor',
      });
    }
  }
}
