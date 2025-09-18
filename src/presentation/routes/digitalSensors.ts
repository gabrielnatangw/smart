import { PrismaClient } from '@prisma/client';
import { Response, Router } from 'express';
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

// Schema de validação para sensor digital
const createDigitalSensorSchema = Joi.object({
  name: Joi.string().required().min(3).max(100),
  entry: Joi.number().required().integer().min(1).max(8),
  gaugeColor: Joi.string()
    .optional()
    .pattern(/^[0-9a-fA-F]{6}$/),
  description: Joi.string().optional().max(500),
  smartSensorNode_id: Joi.string().required().uuid(),
  measurement_unit_id: Joi.string().required().uuid(),
});

/**
 * @swagger
 * /api/digital-sensors:
 *   post:
 *     summary: Criar sensor digital
 *     description: Cria um novo sensor digital com validações específicas
 *     tags: [Sensores Digitais]
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
 *               - entry
 *               - smartSensorNode_id
 *               - measurement_unit_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Sensor Presença Peça"
 *               entry:
 *                 type: number
 *                 example: 2
 *               gaugeColor:
 *                 type: string
 *                 example: "00FF00"
 *               description:
 *                 type: string
 *                 example: "Sensor de presença de peça na esteira"
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
    const { error, value } = createDigitalSensorSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Dados inválidos para criação do sensor digital',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
    }

    // Verificar se o canal já está em uso na máquina
    const existingSensor = await prisma.sensor.findFirst({
      where: {
        module: {
          machine: {
            machine_id: value.smartSensorNode_id,
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

    // Criar o sensor digital
    const sensorData = {
      name: value.name,
      inputMode: 'digital',
      entry: value.entry,
      gaugeColor: value.gaugeColor,
      sensorType: 1, // Tipo digital
      measurementUnitId: value.measurement_unit_id,
      moduleId: value.smartSensorNode_id, // Usando smartSensorNode_id como moduleId temporariamente
      // Campos obrigatórios para o sistema existente
      minScale: 0,
      maxScale: 1,
      minAlarm: 0,
      maxAlarm: 1,
    };

    // console.log('🔍 Creating digital sensor with tenantId:', req.user?.tenantId);
    const sensor = await sensorService.createSensor({
      ...sensorData,
      tenantId: req.user?.tenantId,
    });

    res.status(201).json({
      message: 'Sensor digital criado com sucesso',
      data: {
        sensor_id: sensor.id,
        name: sensor.name,
        inputMode: 'digital',
        entry: sensor.entry,
        gaugeColor: sensor.gaugeColor,
        description: value.description,
        created_at: sensor.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Erro ao criar sensor digital:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

/**
 * @swagger
 * /api/digital-sensors/{machineId}:
 *   get:
 *     summary: Listar sensores digitais de uma máquina
 *     description: Retorna todos os sensores digitais de uma máquina específica
 *     tags: [Sensores Digitais]
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
router.get('/:machineId', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { machineId } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    // Verificar se a máquina pertence ao tenant do usuário
    const machine = await prisma.machine.findFirst({
      where: {
        machine_id: machineId,
        tenant_id: tenantId,
        deleted_at: null,
      },
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada ou não pertence ao seu tenant',
      });
    }

    const sensors = await prisma.sensor.findMany({
      where: {
        input_mode: 'digital',
        module: {
          machine: {
            machine_id: machineId,
            tenant_id: tenantId, // Garantir que a máquina pertence ao tenant
          },
        },
        deleted_at: null,
      },
      orderBy: {
        entry: 'asc',
      },
    });

    res.status(200).json({
      message: 'Sensores digitais encontrados',
      data: sensors.map(sensor => ({
        sensor_id: sensor.sensor_id,
        name: sensor.name,
        entry: sensor.entry,
        gaugeColor: sensor.gauge_color,
        created_at: sensor.created_at,
      })),
    });
  } catch (error: any) {
    console.error('Erro ao listar sensores digitais:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message,
    });
  }
});

export default router;
