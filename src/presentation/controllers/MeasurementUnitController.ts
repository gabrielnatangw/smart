import { Request, Response } from 'express';

import { MeasurementUnitResponseDTO } from '../../application/dto/MeasurementUnitDTO';
import { MeasurementUnitApplicationService } from '../../application/services/MeasurementUnitApplicationService';
import { MeasurementUnit } from '../../domain/entities/MeasurementUnit';
import {
  createMeasurementUnitSchema,
  deleteMeasurementUnitSchema,
  getMeasurementUnitByIdSchema,
  measurementUnitStatsSchema,
  searchMeasurementUnitsSchema,
  updateMeasurementUnitSchema,
  validateRequest,
} from '../validators/measurementUnitValidators';

export class MeasurementUnitController {
  constructor(
    private measurementUnitService: MeasurementUnitApplicationService
  ) {}

  private mapToResponseDTO(
    measurementUnit: MeasurementUnit
  ): MeasurementUnitResponseDTO {
    return {
      id: measurementUnit.id,
      label: measurementUnit.label,
      unitSymbol: measurementUnit.unitSymbol,
      tenantId: measurementUnit.tenantId,
      createdAt: measurementUnit.createdAt,
      updatedAt: measurementUnit.updatedAt,
      deletedAt: measurementUnit.deletedAt,
      isDeleted: measurementUnit.isDeleted,
    };
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(
        createMeasurementUnitSchema,
        req.body
      );

      if (error) {
        res.status(400).json({ error });
        return;
      }

      // Adicionar o tenantId do usuário autenticado
      const authenticatedReq = req as any;
      if (!authenticatedReq.user?.tenantId) {
        res.status(401).json({
          error: 'Tenant ID não encontrado no token de autenticação',
        });
        return;
      }

      const measurementUnitData = {
        label: value?.label || '',
        unitSymbol: value?.unitSymbol || '',
        tenantId: authenticatedReq.user.tenantId,
      };

      const measurementUnit =
        await this.measurementUnitService.createMeasurementUnit(
          measurementUnitData
        );
      const response = this.mapToResponseDTO(measurementUnit);
      res.status(201).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(getMeasurementUnitByIdSchema, {
        id: req.params.id,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [
            { field: 'id', message: 'Invalid measurement unit ID format' },
          ],
        });
        return;
      }

      const measurementUnit =
        await this.measurementUnitService.getMeasurementUnitById(
          value?.id || ''
        );
      const response = this.mapToResponseDTO(measurementUnit);
      res.json({ success: true, data: response });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getByLabel(req: Request, res: Response): Promise<void> {
    try {
      const { label } = req.query;

      if (!label) {
        res.status(400).json({
          success: false,
          message: 'Label is required',
        });
        return;
      }

      // Obter o tenantId do usuário autenticado
      const authenticatedReq = req as any;
      if (!authenticatedReq.user?.tenantId) {
        res.status(401).json({
          error: 'Tenant ID não encontrado no token de autenticação',
        });
        return;
      }

      const measurementUnit =
        await this.measurementUnitService.getMeasurementUnitByLabel(
          label as string,
          authenticatedReq.user.tenantId
        );

      if (!measurementUnit) {
        res.status(404).json({
          success: false,
          message: 'Measurement unit not found',
        });
        return;
      }

      const response = this.mapToResponseDTO(measurementUnit);
      res.json({ success: true, data: response });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(
        searchMeasurementUnitsSchema,
        req.query
      );

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'query', message: error }],
        });
        return;
      }

      const { page = 1, limit = 10, ...filters } = value || {};

      const measurementUnits =
        await this.measurementUnitService.getAllMeasurementUnits(filters);
      const total =
        await this.measurementUnitService.getMeasurementUnitCount(filters);

      // Se limit for -1 (all), retornar todos os registros sem paginação
      let paginatedData = measurementUnits;
      let paginationInfo = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: false,
        hasPrev: page > 1,
      };

      if (limit !== -1) {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        paginatedData = measurementUnits.slice(startIndex, endIndex);
        paginationInfo = {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1,
        };
      } else {
        // Para limit=all, ajustar informações de paginação
        paginationInfo = {
          page: 1,
          limit: total,
          total,
          pages: 1,
          hasNext: false,
          hasPrev: false,
        };
      }

      res.json({
        success: true,
        data: {
          measurementUnits: paginatedData.map(unit =>
            this.mapToResponseDTO(unit)
          ),
          pagination: paginationInfo,
        },
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getByTenant(req: Request, res: Response): Promise<void> {
    try {
      const { tenantId } = req.params;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID is required',
        });
        return;
      }

      const measurementUnits =
        await this.measurementUnitService.getMeasurementUnitsByTenant(tenantId);

      res.json({
        success: true,
        data: measurementUnits.map(unit => this.mapToResponseDTO(unit)),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async getStats(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(
        measurementUnitStatsSchema,
        req.query
      );

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'query', message: error }],
        });
        return;
      }

      const stats = await this.measurementUnitService.getMeasurementUnitStats(
        value || {}
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { error: idError, value: idValue } = validateRequest(
        getMeasurementUnitByIdSchema,
        {
          id: req.params.id,
        }
      );

      if (idError) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [
            { field: 'id', message: 'Invalid measurement unit ID format' },
          ],
        });
        return;
      }

      const { error: bodyError, value: bodyValue } = validateRequest(
        updateMeasurementUnitSchema,
        req.body
      );

      if (bodyError) {
        res.status(400).json({
          success: false,
          message: 'Dados inválidos',
          errors: [{ field: 'body', message: bodyError }],
        });
        return;
      }

      const measurementUnit =
        await this.measurementUnitService.updateMeasurementUnit(
          idValue?.id || '',
          bodyValue || {}
        );
      const response = this.mapToResponseDTO(measurementUnit);

      res.json({
        success: true,
        message: 'Measurement unit updated successfully',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(deleteMeasurementUnitSchema, {
        id: req.params.id,
        permanent: req.query.permanent,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'Parâmetros inválidos',
          errors: [{ field: 'params', message: error }],
        });
        return;
      }

      const success = await this.measurementUnitService.deleteMeasurementUnit(
        value?.id || ''
      );

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to delete measurement unit',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Measurement unit deleted successfully',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  async restore(req: Request, res: Response): Promise<void> {
    try {
      const { error, value } = validateRequest(getMeasurementUnitByIdSchema, {
        id: req.params.id,
      });

      if (error) {
        res.status(400).json({
          success: false,
          message: 'ID inválido',
          errors: [
            { field: 'id', message: 'Invalid measurement unit ID format' },
          ],
        });
        return;
      }

      const success = await this.measurementUnitService.restoreMeasurementUnit(
        value?.id || ''
      );

      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to restore measurement unit',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Measurement unit restored successfully',
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  }

  private handleError(error: any, res: Response): void {
    console.error('MeasurementUnit Controller Error:', error);

    if (error.message === 'Measurement unit not found') {
      res.status(404).json({
        success: false,
        message: 'Measurement unit not found',
      });
      return;
    }

    if (
      error.message === 'Measurement unit label already exists in this tenant'
    ) {
      res.status(409).json({
        success: false,
        message: 'Measurement unit label already exists in this tenant',
      });
      return;
    }

    if (error.message === 'Cannot update deleted measurement unit') {
      res.status(409).json({
        success: false,
        message: 'Cannot update deleted measurement unit',
      });
      return;
    }

    if (error.message === 'Measurement unit is not deleted') {
      res.status(409).json({
        success: false,
        message: 'Measurement unit is not deleted',
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
}
