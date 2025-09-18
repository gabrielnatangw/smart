import { Response } from 'express';

import {
  SensorCurrentValueResponseDTO,
  SensorDataResponseDTO,
} from '../../application/dto/ViewDTO';
import { SensorDataApplicationService } from '../../application/services/SensorDataApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';

export class SensorDataController {
  constructor(private sensorDataService: SensorDataApplicationService) {}

  createData = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const {
        sensorId,
        value,
        rawValue,
        unit,
        quality = 'GOOD',
        metadata = {},
      } = req.body;

      if (!sensorId || value === undefined) {
        res.status(400).json({
          success: false,
          message: 'sensorId e value são obrigatórios',
        });
        return;
      }

      if (typeof value !== 'number' || isNaN(value)) {
        res.status(400).json({
          success: false,
          message: 'value deve ser um número válido',
        });
        return;
      }

      const sensorData = await this.sensorDataService.createSensorData({
        sensorId,
        value,
        rawValue,
        unit,
        quality,
        metadata,
        tenantId: req.user?.tenantId || '',
      });

      const response = this.mapToResponseDTO(sensorData);
      res.status(201).json({
        success: true,
        message: 'Dados do sensor criados com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { sensorId } = req.params;
      const { startDate, endDate, quality, limit = 1000 } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        quality: quality as string,
        limit: Number(limit),
      };

      const data = await this.sensorDataService.getSensorData(
        sensorId || '',
        req.user?.tenantId || '',
        filters
      );

      res.json({
        success: true,
        data: data.map(item => this.mapToResponseDTO(item)),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getLatestData = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sensorId } = req.params;
      const { limit = 100 } = req.query;

      const data = await this.sensorDataService.getLatestSensorData(
        sensorId || '',
        req.user?.tenantId || '',
        Number(limit)
      );

      res.json({
        success: true,
        data: data.map(item => this.mapToResponseDTO(item)),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getCurrentValue = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sensorId } = req.params;

      const currentValue = await this.sensorDataService.getCurrentValue(
        sensorId || '',
        req.user?.tenantId || ''
      );

      if (!currentValue) {
        res.status(404).json({
          success: false,
          message: 'Valor atual do sensor não encontrado',
        });
        return;
      }

      const response = this.mapCurrentValueToResponseDTO(currentValue);
      res.json({
        success: true,
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getCurrentValues = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sensorId, quality } = req.query;

      const filters = {
        sensorId: sensorId as string,
        quality: quality as string,
      };

      const currentValues =
        await this.sensorDataService.getCurrentValuesByTenant(
          req.user?.tenantId || '',
          filters
        );

      res.json({
        success: true,
        data: currentValues.map(item =>
          this.mapCurrentValueToResponseDTO(item)
        ),
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  updateCurrentValue = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { sensorId } = req.params;
      const { value, rawValue, unit, quality, metadata } = req.body;

      if (value === undefined) {
        res.status(400).json({
          success: false,
          message: 'value é obrigatório',
        });
        return;
      }

      if (typeof value !== 'number' || isNaN(value)) {
        res.status(400).json({
          success: false,
          message: 'value deve ser um número válido',
        });
        return;
      }

      const currentValue = await this.sensorDataService.updateCurrentValue(
        sensorId || '',
        {
          value,
          rawValue,
          unit,
          quality: quality ?? 'GOOD',
          metadata: metadata ?? {},
          tenantId: req.user?.tenantId || '',
        }
      );

      const response = this.mapCurrentValueToResponseDTO(currentValue);
      res.json({
        success: true,
        message: 'Valor atual do sensor atualizado com sucesso',
        data: response,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getStats = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      const filters = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const stats = await this.sensorDataService.getSensorDataStats(
        req.user?.tenantId || '',
        filters
      );

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  deleteOldData = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { days = 30 } = req.query;
      const olderThan = new Date();
      olderThan.setDate(olderThan.getDate() - Number(days));

      const deletedCount = await this.sensorDataService.deleteOldData(
        olderThan,
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        message: `${deletedCount} registros antigos foram excluídos`,
        data: {
          deletedCount,
          olderThan,
        },
      });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  private mapToResponseDTO(sensorData: any): SensorDataResponseDTO {
    return {
      id: sensorData.id,
      sensorId: sensorData.sensorId,
      value: sensorData.value,
      rawValue: sensorData.rawValue,
      unit: sensorData.unit,
      quality: sensorData.quality,
      timestamp: sensorData.timestamp,
      metadata: sensorData.metadata,
    };
  }

  private mapCurrentValueToResponseDTO(
    currentValue: any
  ): SensorCurrentValueResponseDTO {
    return {
      id: currentValue.id,
      sensorId: currentValue.sensorId,
      value: currentValue.value,
      rawValue: currentValue.rawValue,
      unit: currentValue.unit,
      quality: currentValue.quality,
      lastUpdated: currentValue.lastUpdated,
      metadata: currentValue.metadata,
      isStale: currentValue.isStale ? currentValue.isStale(5) : false,
    };
  }

  private handleError(error: any, res: Response): void {
    console.error('Sensor data error:', error);

    const errorMessage = error.message || 'Internal server error';

    switch (errorMessage) {
      case 'Sensor ID is required':
        res.status(400).json({
          success: false,
          message: 'ID do sensor é obrigatório',
        });
        break;
      case 'Value must be a valid number':
        res.status(400).json({
          success: false,
          message: 'Valor deve ser um número válido',
        });
        break;
      case 'Invalid quality value':
        res.status(400).json({
          success: false,
          message: 'Valor de qualidade inválido',
        });
        break;
      case 'Sensor current value not found':
        res.status(404).json({
          success: false,
          message: 'Valor atual do sensor não encontrado',
        });
        break;
      default:
        res.status(500).json({
          success: false,
          message: 'Erro interno do servidor',
        });
        break;
    }
  }
}
