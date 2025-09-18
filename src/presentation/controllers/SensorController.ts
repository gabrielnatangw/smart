import { Request, Response } from 'express';

import { SensorResponseDTO } from '../../application/dto/SensorDTO';
import { SensorApplicationService } from '../../application/services/SensorApplicationService';
import { Sensor } from '../../domain/entities/Sensor';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';
import {
  createSensorWithRangeValidationSchema,
  deleteSensorSchema,
  getSensorByIdSchema,
  getSensorsByMeasurementUnitSchema,
  getSensorsByModuleSchema,
  restoreSensorSchema,
  searchSensorsSchema,
  sensorStatsSchema,
  updateSensorWithRangeValidationSchema,
  validateRequest,
} from '../validators/sensorValidators';

export class SensorController {
  constructor(private readonly sensorService: SensorApplicationService) {}

  create = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(
        createSensorWithRangeValidationSchema,
        req.body
      );
      if (error) {
        res.status(400).json({ error });
        return;
      }

      // Adicionar tenantId do token JWT
      const sensorData = {
        name: value?.name || '',
        minScale: value?.minScale,
        maxScale: value?.maxScale,
        minAlarm: value?.minAlarm,
        maxAlarm: value?.maxAlarm,
        gain: value?.gain,
        inputMode: value?.inputMode,
        entry: value?.entry,
        ix: value?.ix,
        gaugeColor: value?.gaugeColor,
        offset: value?.offset,
        alarmTimeout: value?.alarmTimeout,
        counterName: value?.counterName,
        frequencyCounterName: value?.frequencyCounterName,
        speedSource: value?.speedSource,
        interruptTransition: value?.interruptTransition,
        timeUnit: value?.timeUnit,
        speedUnit: value?.speedUnit,
        samplingInterval: value?.samplingInterval,
        minimumPeriod: value?.minimumPeriod,
        maximumPeriod: value?.maximumPeriod,
        frequencyResolution: value?.frequencyResolution,
        sensorType: value?.sensorType || 0,
        measurementUnitId: value?.measurementUnitId || '',
        moduleId: value?.moduleId || '',
        tenantId: req.user?.tenantId,
      };

      const sensor = await this.sensorService.createSensor(sensorData);
      const response = this.mapToResponseDTO(sensor);
      res.status(201).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(getSensorByIdSchema, req.params);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const sensor = await this.sensorService.getSensorById(value?.id || '');
      if (!sensor) {
        res.status(404).json({ error: 'Sensor not found' });
        return;
      }

      const response = this.mapToResponseDTO(sensor);
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getByName = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, measurementUnitId } = req.query;

      if (!name || !measurementUnitId) {
        res
          .status(400)
          .json({ error: 'Name and measurementUnitId are required' });
        return;
      }

      if (typeof name !== 'string' || typeof measurementUnitId !== 'string') {
        res.status(400).json({ error: 'Invalid parameters' });
        return;
      }

      const sensor = await this.sensorService.getSensorByName(
        name,
        measurementUnitId
      );
      if (!sensor) {
        res.status(404).json({ error: 'Sensor not found' });
        return;
      }

      const response = this.mapToResponseDTO(sensor);
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(searchSensorsSchema, req.query);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const sensors = await this.sensorService.getAllSensors({
        name: value?.name,
        sensorType: value?.sensorType,
        measurementUnitId: value?.measurementUnitId,
        moduleId: value?.moduleId,
        isDeleted: value?.isDeleted,
        tenantId: req.user?.tenantId, // Filtrar por tenant do usuário logado
      });

      const response = sensors.map(sensor => this.mapToResponseDTO(sensor));
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getByModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(
        getSensorsByModuleSchema,
        req.params
      );
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const sensors = await this.sensorService.getSensorsByModule(
        value?.moduleId || ''
      );
      const response = sensors.map(sensor => this.mapToResponseDTO(sensor));
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getByMeasurementUnit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(
        getSensorsByMeasurementUnitSchema,
        req.params
      );
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const sensors = await this.sensorService.getSensorsByMeasurementUnit(
        value?.measurementUnitId || ''
      );
      const response = sensors.map(sensor => this.mapToResponseDTO(sensor));
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error: paramError, value: paramValue } = validateRequest(
        getSensorByIdSchema,
        req.params
      );
      if (paramError) {
        res.status(400).json({ error: paramError });
        return;
      }

      const { error: bodyError, value: bodyValue } = validateRequest(
        updateSensorWithRangeValidationSchema,
        req.body
      );
      if (bodyError) {
        res.status(400).json({ error: bodyError });
        return;
      }

      const sensor = await this.sensorService.updateSensor(
        paramValue?.id || '',
        bodyValue || {},
        (req as any).user?.tenantId || ''
      );
      const response = this.mapToResponseDTO(sensor);
      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(deleteSensorSchema, req.params);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      await this.sensorService.deleteSensor(value?.id || '');
      res.status(200).json({ message: 'Sensor deleted successfully' });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  restore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(restoreSensorSchema, req.params);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      await this.sensorService.restoreSensor(value?.id || '');
      res.status(200).json({ message: 'Sensor restored successfully' });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(sensorStatsSchema, req.query);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const stats = await this.sensorService.getSensorStats({
        measurementUnitId: value?.measurementUnitId || '',
        moduleId: value?.moduleId || '',
      });

      res.status(200).json(stats);
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  getCount = async (req: Request, res: Response): Promise<void> => {
    try {
      const { error, value } = validateRequest(searchSensorsSchema, req.query);
      if (error) {
        res.status(400).json({ error });
        return;
      }

      const count = await this.sensorService.getSensorCount({
        name: value?.name,
        sensorType: value?.sensorType,
        measurementUnitId: value?.measurementUnitId,
        moduleId: value?.moduleId,
        isDeleted: value?.isDeleted,
      });

      res.status(200).json({ count });
    } catch (error: any) {
      this.handleError(error, res);
    }
  };

  private mapToResponseDTO(sensor: Sensor): SensorResponseDTO {
    return {
      id: sensor.id,
      name: sensor.name,
      minScale: sensor.minScale,
      maxScale: sensor.maxScale,
      minAlarm: sensor.minAlarm,
      maxAlarm: sensor.maxAlarm,
      gain: sensor.gain,
      inputMode: sensor.inputMode,
      ix: sensor.ix,
      gaugeColor: sensor.gaugeColor,
      offset: sensor.offset,
      alarmTimeout: sensor.alarmTimeout,
      counterName: sensor.counterName,
      frequencyCounterName: sensor.frequencyCounterName,
      speedSource: sensor.speedSource,
      interruptTransition: sensor.interruptTransition,
      timeUnit: sensor.timeUnit,
      speedUnit: sensor.speedUnit,
      samplingInterval: sensor.samplingInterval,
      minimumPeriod: sensor.minimumPeriod,
      maximumPeriod: sensor.maximumPeriod,
      frequencyResolution: sensor.frequencyResolution,
      sensorType: sensor.sensorType,
      measurementUnitId: sensor.measurementUnitId,
      moduleId: sensor.moduleId,
      createdAt: sensor.createdAt,
      updatedAt: sensor.updatedAt,
      deletedAt: sensor.deletedAt,
      isDeleted: sensor.isDeleted,
    };
  }

  private handleError(error: any, res: Response): void {
    console.error('Sensor error:', error);

    const errorMessage = error.message || 'Internal server error';

    switch (errorMessage) {
      case 'Sensor not found':
        res.status(404).json({ error: 'Sensor not found' });
        break;
      case 'Sensor name already exists in this measurement unit':
        res.status(409).json({
          error: 'Sensor name already exists in this measurement unit',
        });
        break;
      case 'Cannot update deleted sensor':
        res.status(400).json({ error: 'Cannot update deleted sensor' });
        break;
      case 'Sensor is already deleted':
        res.status(400).json({ error: 'Sensor is already deleted' });
        break;
      case 'Sensor is not deleted':
        res.status(400).json({ error: 'Sensor is not deleted' });
        break;
      default:
        res.status(500).json({ error: 'Internal server error' });
        break;
    }
  }
}
