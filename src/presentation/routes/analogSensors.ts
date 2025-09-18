import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import Joi from 'joi';

import { SensorApplicationService } from '../../application/services/SensorApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaMeasurementUnitRepository } from '../../infrastructure/persistence/repositories/PrismaMeasurementUnitRepository';
import { PrismaModuleRepository } from '../../infrastructure/persistence/repositories/PrismaModuleRepository';
import { PrismaSensorRepository } from '../../infrastructure/persistence/repositories/PrismaSensorRepository';
import {
  AuthenticatedRequest,
  AuthenticationMiddleware,
} from '../middleware/authenticationMiddleware';

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

// Apply authentication middleware to all routes
router.use(authMiddleware.requireAuth);

// Schema de validação para sensor analógico
const createAnalogSensorSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  minScale: Joi.number().required().min(-10000).max(10000),
  maxScale: Joi.number().required().min(-10000).max(10000),
  minAlarm: Joi.number().required().min(-10000).max(10000),
  maxAlarm: Joi.number().required().min(-10000).max(10000),
  gain: Joi.number().optional().min(0.001).max(1000).default(1.0),
  offset: Joi.number().optional().min(-10000).max(10000).default(0.0),
  entry: Joi.number().required().integer().min(1).max(8),
  gaugeColor: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{6}$/),
  description: Joi.string().optional().max(500),
  unit: Joi.string().optional().max(20),
  smartSensorNode_id: Joi.string().required().uuid(),
  measurement_unit_id: Joi.string().required().uuid(),
}).custom((value, helpers) => {
  // Validações de negócio específicas para sensores analógicos
  if (value.minScale >= value.maxScale) {
    return helpers.error('any.invalid', {
      message: 'minScale deve ser menor que maxScale',
    });
  }

  if (value.minAlarm < value.minScale) {
    return helpers.error('any.invalid', {
      message: 'minAlarm deve ser maior ou igual a minScale',
    });
  }

  if (value.maxAlarm > value.maxScale) {
    return helpers.error('any.invalid', {
      message: 'maxAlarm deve ser menor ou igual a maxScale',
    });
  }

  if (value.minAlarm >= value.maxAlarm) {
    return helpers.error('any.invalid', {
      message: 'minAlarm deve ser menor que maxAlarm',
    });
  }

  return value;
});

/**
 * @swagger
 * /api/analog-sensors:
 *   post:
 *     summary: Criar sensor analógico
 *     description: Cria um novo sensor analógico com validações específicas
 *     tags: [Sensores Analógicos]
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
 *               - minAlarm
 *               - maxAlarm
 *               - entry
 *               - smartSensorNode_id
 *               - measurement_unit_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sensor Temperatura Forno"
 *               minScale:
 *                 type: number
 *                 example: 0
 *               maxScale:
 *                 type: number
 *                 example: 200
 *               minAlarm:
 *                 type: number
 *                 example: 10
 *               maxAlarm:
 *                 type: number
 *                 example: 180
 *               gain:
 *                 type: number
 *                 example: 1.0
 *               offset:
 *                 type: number
 *                 example: 0.0
 *               entry:
 *                 type: number
 *                 example: 1
 *               gaugeColor:
 *                 type: string
 *                 example: "FF0000"
 *               description:
 *                 type: string
 *                 example: "Sensor de temperatura do forno principal"
 *               unit:
 *                 type: string
 *                 example: "°C"
 *               smartSensorNode_id:
 *                 type: string
 *                 example: "uuid-da-maquina"
 *               measurement_unit_id:
 *                 type: string
 *                 example: "uuid-da-unidade-medida"
 */
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Validação dos dados
    const { error, value } = createAnalogSensorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos para criação do sensor analógico',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Verificar se a máquina pertence ao tenant do usuário
    const tenantId = req.user?.tenantId;
    if (!tenantId) {
      return res.status(401).json({
        error: 'Contexto de tenant não encontrado',
      });
    }

    const machine = await prisma.machine.findFirst({
      where: {
        machine_id: value.smartSensorNode_id,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!machine) {
      return res.status(404).json({
        error: 'Máquina não encontrada ou não pertence ao seu tenant',
      });
    }

    // Verificar se o canal já está em uso na máquina
    const existingSensor = await prisma.sensor.findFirst({
      where: {
        module: {
          machine: {
            machine_id: value.smartSensorNode_id,
            tenant_id: tenantId, // Garantir que a máquina pertence ao tenant
          },
        },
        entry: value.entry,
        deleted_at: null,
      },
    });

    if (existingSensor) {
      return res.status(409).json({
        error: 'Canal de entrada já está em uso nesta máquina',
        details: {
          entry: value.entry,
          existingSensor: existingSensor.name,
        },
      });
    }

    // Verificar se o nome já existe na máquina
    const existingName = await prisma.sensor.findFirst({
      where: {
        module: {
          machine: {
            machine_id: value.smartSensorNode_id,
            tenant_id: tenantId, // Garantir que a máquina pertence ao tenant
          },
        },
        name: value.name,
        deleted_at: null,
      },
    });

    if (existingName) {
      return res.status(409).json({
        error: 'Nome do sensor já existe nesta máquina',
        details: {
          name: value.name,
        },
      });
    }

    // Criar o sensor analógico
    const sensorData = {
      name: value.name,
      minScale: value.minScale,
      maxScale: value.maxScale,
      minAlarm: value.minAlarm,
      maxAlarm: value.maxAlarm,
      gain: value.gain,
      offset: value.offset,
      inputMode: 'analog',
      entry: value.entry,
      gaugeColor: value.gaugeColor,
      sensorType: 0, // Tipo analógico
      measurementUnitId: value.measurement_unit_id,
      moduleId: value.smartSensorNode_id, // Usando smartSensorNode_id como moduleId temporariamente
    };

    const sensor = await sensorService.createSensor({
      ...sensorData,
      tenantId: req.user?.tenantId,
    });

    res.status(201).json({
      message: 'Sensor analógico criado com sucesso',
      data: {
        sensor_id: sensor.id,
        name: sensor.name,
        inputMode: 'analog',
        entry: sensor.entry,
        minScale: sensor.minScale,
        maxScale: sensor.maxScale,
        minAlarm: sensor.minAlarm,
        maxAlarm: sensor.maxAlarm,
        gain: sensor.gain,
        offset: sensor.offset,
        created_at: sensor.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar sensor analógico:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/analog-sensors/{machineId}:
 *   get:
 *     summary: Listar sensores analógicos de uma máquina
 *     description: Retorna todos os sensores analógicos de uma máquina específica
 *     tags: [Sensores Analógicos]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: machineId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID da máquina
 */
router.get('/:machineId', async (req: Request, res: Response) => {
  try {
    const { machineId } = req.params;

    const sensors = await prisma.sensor.findMany({
      where: {
        input_mode: 'analog',
        module: {
          machine: {
            machine_id: machineId,
          },
        },
        deleted_at: null,
      },
      orderBy: {
        entry: 'asc',
      },
    });

    res.status(200).json({
      message: 'Sensores analógicos encontrados',
      data: sensors.map(sensor => ({
        sensor_id: sensor.sensor_id,
        name: sensor.name,
        entry: sensor.entry,
        minScale: sensor.min_scale,
        maxScale: sensor.max_scale,
        minAlarm: sensor.min_alarm,
        maxAlarm: sensor.max_alarm,
        gain: sensor.gain,
        offset: sensor.offset,
        gaugeColor: sensor.gauge_color,
        created_at: sensor.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar sensores analógicos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

export default router;
