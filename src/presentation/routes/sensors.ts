import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import { SensorApplicationService } from '../../application/services/SensorApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaMeasurementUnitRepository } from '../../infrastructure/persistence/repositories/PrismaMeasurementUnitRepository';
import { PrismaModuleRepository } from '../../infrastructure/persistence/repositories/PrismaModuleRepository';
import { PrismaSensorRepository } from '../../infrastructure/persistence/repositories/PrismaSensorRepository';
import {
  AuthenticatedRequest,
  AuthenticationMiddleware,
} from '../middleware/authenticationMiddleware';
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
} from '../validators/sensorValidators';

const router = Router();
const prisma = new PrismaClient();
const sensorRepository = new PrismaSensorRepository(prisma);
const moduleRepository = new PrismaModuleRepository(prisma);
const measurementUnitRepository = new PrismaMeasurementUnitRepository(prisma);
const sensorService = new SensorApplicationService(
  sensorRepository,
  moduleRepository,
  measurementUnitRepository
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all sensor routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/sensors:
 *   post:
 *     summary: Criar novo sensor
 *     description: Cria um novo sensor no sistema
 *     tags: [Sensores]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - minScale
 *               - maxScale
 *               - sensorType
 *               - measurementUnitId
 *               - moduleId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sensor de Temperatura"
 *               minScale:
 *                 type: number
 *                 example: 0
 *               maxScale:
 *                 type: number
 *                 example: 100
 *               minAlarm:
 *                 type: number
 *                 example: 10
 *               maxAlarm:
 *                 type: number
 *                 example: 90
 *               gain:
 *                 type: number
 *                 example: 1.0
 *               inputMode:
 *                 type: string
 *                 example: "Voltage"
 *               ix:
 *                 type: number
 *                 example: 0
 *               gaugeColor:
 *                 type: string
 *                 example: "#00FF00"
 *               offset:
 *                 type: number
 *                 example: 0
 *               alarmTimeout:
 *                 type: number
 *                 example: 30
 *               counterName:
 *                 type: string
 *                 example: "Counter1"
 *               frequencyCounterName:
 *                 type: string
 *                 example: "FreqCounter1"
 *               speedSource:
 *                 type: string
 *                 example: "Speed1"
 *               interruptTransition:
 *                 type: string
 *                 example: "Rising"
 *               timeUnit:
 *                 type: string
 *                 example: "ms"
 *               speedUnit:
 *                 type: string
 *                 example: "RPM"
 *               samplingInterval:
 *                 type: number
 *                 example: 1000
 *               minimumPeriod:
 *                 type: number
 *                 example: 0.1
 *               maximumPeriod:
 *                 type: number
 *                 example: 10.0
 *               frequencyResolution:
 *                 type: number
 *                 example: 0.01
 *               sensorType:
 *                 type: string
 *                 example: "Temperature"
 *               measurementUnitId:
 *                 type: string
 *                 format: uuid
 *                 example: "measurement-unit-uuid"
 *               moduleId:
 *                 type: string
 *                 format: uuid
 *                 example: "module-uuid"
 *     responses:
 *       201:
 *         description: Sensor criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Sensor criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "sensor-uuid-here"
 *                     name:
 *                       type: string
 *                       example: "Sensor de Temperatura"
 *                     minScale:
 *                       type: number
 *                       example: 0
 *                     maxScale:
 *                       type: number
 *                       example: 100
 *                     minAlarm:
 *                       type: number
 *                       example: 10
 *                     maxAlarm:
 *                       type: number
 *                       example: 90
 *                     gain:
 *                       type: number
 *                       example: 1.0
 *                     inputMode:
 *                       type: string
 *                       example: "Voltage"
 *                     ix:
 *                       type: number
 *                       example: 0
 *                     gaugeColor:
 *                       type: string
 *                       example: "#00FF00"
 *                     offset:
 *                       type: number
 *                       example: 0
 *                     alarmTimeout:
 *                       type: number
 *                       example: 30
 *                     counterName:
 *                       type: string
 *                       example: "Counter1"
 *                     frequencyCounterName:
 *                       type: string
 *                       example: "FreqCounter1"
 *                     speedSource:
 *                       type: string
 *                       example: "Speed1"
 *                     interruptTransition:
 *                       type: string
 *                       example: "Rising"
 *                     timeUnit:
 *                       type: string
 *                       example: "ms"
 *                     speedUnit:
 *                       type: string
 *                       example: "RPM"
 *                     samplingInterval:
 *                       type: number
 *                       example: 1000
 *                     minimumPeriod:
 *                       type: number
 *                       example: 0.1
 *                     maximumPeriod:
 *                       type: number
 *                       example: 10.0
 *                     frequencyResolution:
 *                       type: number
 *                       example: 0.01
 *                     sensorType:
 *                       type: string
 *                       example: "Temperature"
 *                     measurementUnitId:
 *                       type: string
 *                       format: uuid
 *                       example: "measurement-unit-uuid"
 *                     moduleId:
 *                       type: string
 *                       format: uuid
 *                       example: "module-uuid"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-27T20:28:48.322Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-08-27T20:28:48.322Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Nome do sensor já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    console.log(
      '🔍 Dados recebidos do frontend:',
      JSON.stringify(req.body, null, 2)
    );
    const validatedData = createSensorWithRangeValidationSchema.parse(req.body);
    console.log('🔍 Dados validados:', JSON.stringify(validatedData, null, 2));

    const sensor = await sensorService.createSensor({
      ...validatedData,
      tenantId: req.user?.tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Sensor criado com sucesso',
      data: {
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
      },
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (
      error.message === 'Sensor name already exists in this measurement unit'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Nome do sensor já existe nesta unidade de medida',
      });
    }

    console.error('Error creating sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validatedParams = searchSensorsSchema.parse(req.query);

    const filters = {
      name: validatedParams.name,
      sensorType: validatedParams.sensorType,
      measurementUnitId: validatedParams.measurementUnitId,
      moduleId: validatedParams.moduleId,
      isDeleted:
        validatedParams.isDeleted !== undefined
          ? validatedParams.isDeleted
          : false,
      tenantId: req.user?.tenantId, // Filtrar por tenant do usuário logado
    };

    const sensors = await sensorService.getAllSensors(filters);
    const total = await sensorService.getSensorCount(filters);

    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 10;

    // Se limit for -1 (all), retornar todos os registros sem paginação
    let paginatedSensors = sensors;
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
      paginatedSensors = sensors.slice(startIndex, endIndex);
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
        sensors: paginatedSensors.map(sensor => ({
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
          isDeleted: sensor.isDeleted,
          createdAt: sensor.createdAt,
          updatedAt: sensor.updatedAt,
          deletedAt: sensor.deletedAt,
        })),
        pagination: paginationInfo,
      },
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Error fetching sensors:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const validatedParams = sensorStatsSchema.parse(req.query);

    const stats = await sensorService.getSensorStats({
      measurementUnitId: validatedParams.measurementUnitId,
      moduleId: validatedParams.moduleId,
    });

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros inválidos',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Error fetching sensor stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/by-module/:moduleId', async (req: Request, res: Response) => {
  try {
    const { moduleId } = getSensorsByModuleSchema.parse({
      moduleId: req.params.moduleId,
    });

    const sensors = await sensorService.getSensorsByModule(moduleId);

    res.json({
      success: true,
      data: sensors.map(sensor => ({
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
        isDeleted: sensor.isDeleted,
        createdAt: sensor.createdAt,
        updatedAt: sensor.updatedAt,
        deletedAt: sensor.deletedAt,
      })),
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'ID do módulo inválido',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Error fetching sensors by module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get(
  '/by-measurement-unit/:measurementUnitId',
  async (req: Request, res: Response) => {
    try {
      const { measurementUnitId } = getSensorsByMeasurementUnitSchema.parse({
        measurementUnitId: req.params.measurementUnitId,
      });

      const sensors =
        await sensorService.getSensorsByMeasurementUnit(measurementUnitId);

      res.json({
        success: true,
        data: sensors.map(sensor => ({
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
          isDeleted: sensor.isDeleted,
          createdAt: sensor.createdAt,
          updatedAt: sensor.updatedAt,
          deletedAt: sensor.deletedAt,
        })),
      });
    } catch (error: any) {
      if (error.issues) {
        return res.status(400).json({
          success: false,
          message: 'ID da unidade de medida inválido',
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        });
      }

      console.error('Error fetching sensors by measurement unit:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getSensorByIdSchema.parse({ id: req.params.id });

    const sensor = await sensorService.getSensorById(id);

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor não encontrado',
      });
    }

    res.json({
      success: true,
      data: {
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
        isDeleted: sensor.isDeleted,
        createdAt: sensor.createdAt,
        updatedAt: sensor.updatedAt,
        deletedAt: sensor.deletedAt,
      },
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    console.error('Error fetching sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = getSensorByIdSchema.parse({ id: req.params.id });
    const validatedData = updateSensorWithRangeValidationSchema.parse(req.body);

    const sensor = await sensorService.updateSensor(
      id,
      validatedData,
      req.user?.tenantId || ''
    );

    res.json({
      success: true,
      message: 'Sensor atualizado com sucesso',
      data: {
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
      },
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error.message === 'Sensor not found') {
      return res.status(404).json({
        success: false,
        message: 'Sensor não encontrado',
      });
    }

    if (error.message === 'Cannot update deleted sensor') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível atualizar sensor excluído',
      });
    }

    if (
      error.message === 'Sensor name already exists in this measurement unit'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Nome do sensor já existe nesta unidade de medida',
      });
    }

    console.error('Error updating sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = deleteSensorSchema.parse({ id: req.params.id });

    const success = await sensorService.deleteSensor(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao excluir sensor',
      });
    }

    res.json({
      success: true,
      message: 'Sensor excluído com sucesso',
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error.message === 'Sensor not found') {
      return res.status(404).json({
        success: false,
        message: 'Sensor não encontrado',
      });
    }

    if (error.message === 'Sensor is already deleted') {
      return res.status(409).json({
        success: false,
        message: 'Sensor já está excluído',
      });
    }

    console.error('Error deleting sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = restoreSensorSchema.parse({ id: req.params.id });

    const success = await sensorService.restoreSensor(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao restaurar sensor',
      });
    }

    res.json({
      success: true,
      message: 'Sensor restaurado com sucesso',
    });
  } catch (error: any) {
    if (error.issues) {
      return res.status(400).json({
        success: false,
        message: 'ID inválido',
        errors: error.issues.map((issue: any) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    if (error.message === 'Sensor not found') {
      return res.status(404).json({
        success: false,
        message: 'Sensor não encontrado',
      });
    }

    if (error.message === 'Sensor is not deleted') {
      return res.status(409).json({
        success: false,
        message: 'Sensor não está excluído',
      });
    }

    console.error('Error restoring sensor:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;
