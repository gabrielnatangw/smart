import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import { MachineApplicationService } from '../../application/services/MachineApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaMachineRepository } from '../../infrastructure/persistence/repositories/PrismaMachineRepository';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import {
  createMachineWithYearValidationSchema,
  deleteMachineSchema,
  getMachineByIdSchema,
  machineStatsSchema,
  restoreMachineSchema,
  searchMachinesSchema,
  updateMachineWithYearValidationSchema,
} from '../validators/machineValidators';

const router = Router();
const prisma = new PrismaClient();
const machineRepository = new PrismaMachineRepository(prisma);
const machineService = new MachineApplicationService(machineRepository);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all machine routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/machines:
 *   post:
 *     summary: Criar nova máquina
 *     description: Cria uma nova máquina no sistema
 *     tags: [Máquinas]
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
 *               - operationalSector
 *               - name
 *               - manufacturer
 *               - serialNumber
 *               - yearOfManufacture
 *               - yearOfInstallation
 *               - maxPerformance
 *               - speedMeasureTech
 *             properties:
 *               operationalSector:
 *                 type: string
 *                 example: "Produção"
 *               name:
 *                 type: string
 *                 example: "Máquina de Corte"
 *               manufacturer:
 *                 type: string
 *                 example: "Empresa XYZ"
 *               serialNumber:
 *                 type: string
 *                 example: "SN123456789"
 *               yearOfManufacture:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2030
 *                 example: 2020
 *               yearOfInstallation:
 *                 type: integer
 *                 minimum: 1900
 *                 maximum: 2030
 *                 example: 2021
 *               maxPerformance:
 *                 type: number
 *                 example: 100.5
 *               speedMeasureTech:
 *                 type: string
 *                 example: "RPM"
 *     responses:
 *       201:
 *         description: Máquina criada com sucesso
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
 *                   example: "Máquina criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "machine-uuid-here"
 *                     operationalSector:
 *                       type: string
 *                       example: "Produção"
 *                     name:
 *                       type: string
 *                       example: "Máquina de Corte"
 *                     manufacturer:
 *                       type: string
 *                       example: "Empresa XYZ"
 *                     serialNumber:
 *                       type: string
 *                       example: "SN123456789"
 *                     yearOfManufacture:
 *                       type: integer
 *                       example: 2020
 *                     yearOfInstallation:
 *                       type: integer
 *                       example: 2021
 *                     maxPerformance:
 *                       type: number
 *                       example: 100.5
 *                     speedMeasureTech:
 *                       type: string
 *                       example: "RPM"
 *                     tenantId:
 *                       type: string
 *                       format: uuid
 *                       example: "tenant-uuid-here"
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
 *       401:
 *         description: Contexto de tenant não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Número de série já cadastrado
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
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createMachineWithYearValidationSchema.parse(req.body);

    // Get tenant ID from authenticated request (should be set by middleware)
    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const machine = await machineService.createMachine({
      ...validatedData,
      tenantId,
    });

    res.status(201).json({
      success: true,
      message: 'Máquina criada com sucesso',
      data: {
        id: machine.id,
        operationalSector: machine.operationalSector,
        name: machine.name,
        manufacturer: machine.manufacturer,
        serialNumber: machine.serialNumber,
        yearOfManufacture: machine.yearOfManufacture,
        yearOfInstallation: machine.yearOfInstallation,
        maxPerformance: machine.maxPerformance,
        speedMeasureTech: machine.speedMeasureTech,
        tenantId: machine.tenantId,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt,
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

    if (error.message === 'Serial number already registered for this tenant') {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Número de série já cadastrado',
        error: 'DUPLICATE_SERIAL_NUMBER',
        details: {
          field: 'serialNumber',
          suggestion: 'Use um número de série único para este tenant',
          code: 'MACHINE_001',
        },
        userMessage:
          'Este número de série já está sendo usado por outra máquina. Por favor, escolha um número diferente.',
      });
    }

    console.error('Error creating machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/machines:
 *   get:
 *     summary: Listar máquinas
 *     description: Lista todas as máquinas com paginação e filtros
 *     tags: [Máquinas]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número da página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de itens por página
 *       - in: query
 *         name: operationalSector
 *         schema:
 *           type: string
 *         description: Filtrar por setor operacional
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome da máquina
 *       - in: query
 *         name: manufacturer
 *         schema:
 *           type: string
 *         description: Filtrar por fabricante
 *       - in: query
 *         name: isDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir máquinas deletadas
 *     responses:
 *       200:
 *         description: Lista de máquinas retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     machines:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "machine-uuid-here"
 *                           operationalSector:
 *                             type: string
 *                             example: "Produção"
 *                           name:
 *                             type: string
 *                             example: "Máquina de Corte"
 *                           manufacturer:
 *                             type: string
 *                             example: "Empresa XYZ"
 *                           serialNumber:
 *                             type: string
 *                             example: "SN123456789"
 *                           yearOfManufacture:
 *                             type: integer
 *                             example: 2020
 *                           yearOfInstallation:
 *                             type: integer
 *                             example: 2021
 *                           maxPerformance:
 *                             type: number
 *                             example: 100.5
 *                           speedMeasureTech:
 *                             type: string
 *                             example: "RPM"
 *                           tenantId:
 *                             type: string
 *                             format: uuid
 *                             example: "tenant-uuid-here"
 *                           isDeleted:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-27T20:28:48.322Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-08-27T20:28:48.322Z"
 *                           deletedAt:
 *                             type: string
 *                             format: date-time
 *                             nullable: true
 *                             example: null
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parâmetros inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Contexto de tenant não encontrado
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
router.get('/', async (req: Request, res: Response) => {
  try {
    const validatedParams = searchMachinesSchema.parse(req.query);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const filters = {
      tenantId,
      operationalSector: validatedParams.operationalSector,
      name: validatedParams.name,
      manufacturer: validatedParams.manufacturer,
      isDeleted: validatedParams.isDeleted ?? false, // Por padrão, apenas máquinas ativas
    };

    const machines = await machineService.getAllMachines(filters);
    const total = await machineService.getMachineCount(filters);

    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 10;

    // Verificar se deve retornar todos os registros
    const returnAll = limit === -1;

    let paginatedMachines;
    let paginationInfo;

    if (returnAll) {
      // Retornar todos os registros sem paginação
      paginatedMachines = machines;
      paginationInfo = {
        page: 1,
        limit: total,
        total,
        pages: 1,
        hasNext: false,
        hasPrev: false,
      };
    } else {
      // Aplicar paginação normal
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      paginatedMachines = machines.slice(startIndex, endIndex);
      paginationInfo = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: endIndex < total,
        hasPrev: page > 1,
      };
    }

    res.json({
      success: true,
      data: {
        machines: paginatedMachines.map(machine => ({
          id: machine.id,
          operationalSector: machine.operationalSector,
          name: machine.name,
          manufacturer: machine.manufacturer,
          serialNumber: machine.serialNumber,
          yearOfManufacture: machine.yearOfManufacture,
          yearOfInstallation: machine.yearOfInstallation,
          maxPerformance: machine.maxPerformance,
          speedMeasureTech: machine.speedMeasureTech,
          tenantId: machine.tenantId,
          isDeleted: machine.isDeleted,
          createdAt: machine.createdAt,
          updatedAt: machine.updatedAt,
          deletedAt: machine.deletedAt,
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

    console.error('Error fetching machines:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const _validatedParams = machineStatsSchema.parse(req.query);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const stats = await machineService.getMachineStats(tenantId);

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

    console.error('Error fetching machine stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getMachineByIdSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const machine = await machineService.getMachineById(id, tenantId);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada',
      });
    }

    res.json({
      success: true,
      data: {
        id: machine.id,
        operationalSector: machine.operationalSector,
        name: machine.name,
        manufacturer: machine.manufacturer,
        serialNumber: machine.serialNumber,
        yearOfManufacture: machine.yearOfManufacture,
        yearOfInstallation: machine.yearOfInstallation,
        maxPerformance: machine.maxPerformance,
        speedMeasureTech: machine.speedMeasureTech,
        tenantId: machine.tenantId,
        isDeleted: machine.isDeleted,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt,
        deletedAt: machine.deletedAt,
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

    console.error('Error fetching machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getMachineByIdSchema.parse({ id: req.params.id });
    const validatedData = updateMachineWithYearValidationSchema.parse(req.body);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const machine = await machineService.updateMachine(
      id,
      validatedData,
      tenantId
    );

    res.json({
      success: true,
      message: 'Máquina atualizada com sucesso',
      data: {
        id: machine.id,
        operationalSector: machine.operationalSector,
        name: machine.name,
        manufacturer: machine.manufacturer,
        serialNumber: machine.serialNumber,
        yearOfManufacture: machine.yearOfManufacture,
        yearOfInstallation: machine.yearOfInstallation,
        maxPerformance: machine.maxPerformance,
        speedMeasureTech: machine.speedMeasureTech,
        tenantId: machine.tenantId,
        createdAt: machine.createdAt,
        updatedAt: machine.updatedAt,
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

    if (error.message === 'Machine not found') {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada',
      });
    }

    if (error.message === 'Cannot update deleted machine') {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Máquina excluída não pode ser atualizada',
        error: 'MACHINE_ALREADY_DELETED',
        details: {
          field: 'id',
          suggestion: 'Restaura a máquina antes de atualizá-la',
          code: 'MACHINE_002',
        },
        userMessage:
          'Esta máquina foi excluída e não pode ser atualizada. Restaura a máquina primeiro para fazer alterações.',
      });
    }

    if (
      error.message === 'Serial number already registered by another machine'
    ) {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Número de série já cadastrado',
        error: 'DUPLICATE_SERIAL_NUMBER',
        details: {
          field: 'serialNumber',
          suggestion:
            'Use um número de série único ou atualize a máquina correta',
          code: 'MACHINE_003',
        },
        userMessage:
          'Este número de série já está sendo usado por outra máquina. Escolha um número diferente ou atualize a máquina correta.',
      });
    }

    console.error('Error updating machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = deleteMachineSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const success = await machineService.deleteMachine(id, tenantId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao excluir máquina',
      });
    }

    res.json({
      success: true,
      message: 'Máquina excluída com sucesso',
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

    if (error.message === 'Machine not found') {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada',
      });
    }

    if (error.message === 'Machine is already deleted') {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Máquina já está excluída',
        error: 'MACHINE_ALREADY_DELETED',
        details: {
          field: 'id',
          suggestion: 'A máquina já foi excluída anteriormente',
          code: 'MACHINE_004',
        },
        userMessage:
          'Esta máquina já foi excluída anteriormente. Não é possível excluí-la novamente.',
      });
    }

    console.error('Error deleting machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = restoreMachineSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const success = await machineService.restoreMachine(id, tenantId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao restaurar máquina',
      });
    }

    res.json({
      success: true,
      message: 'Máquina restaurada com sucesso',
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

    if (error.message === 'Machine not found') {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada',
      });
    }

    if (error.message === 'Machine is not deleted') {
      return res.status(409).json({
        success: false,
        message: 'Conflito: Máquina não está excluída',
        error: 'MACHINE_NOT_DELETED',
        details: {
          field: 'id',
          suggestion: 'A máquina está ativa e não precisa ser restaurada',
          code: 'MACHINE_005',
        },
        userMessage:
          'Esta máquina está ativa e não foi excluída. Não é possível restaurá-la.',
      });
    }

    console.error('Error restoring machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;
