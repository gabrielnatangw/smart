import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';
import { z } from 'zod';

import { ModuleApplicationService } from '../../application/services/ModuleApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaModuleRepository } from '../../infrastructure/persistence/repositories/PrismaModuleRepository';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import {
  createModuleWithLocationValidationSchema,
  deleteModuleSchema,
  getModuleByIdSchema,
  getModulesByMachineSchema,
  moduleStatsSchema,
  restoreModuleSchema,
  searchModulesSchema,
  unassignModuleFromMachineSchema,
  updateModuleWithLocationValidationSchema,
} from '../validators/moduleValidators';

const router = Router();
const prisma = new PrismaClient();
const moduleRepository = new PrismaModuleRepository(prisma);
const moduleService = new ModuleApplicationService(moduleRepository);

// Configure MQTT service for ModuleApplicationService
// This will be set when the app starts
export { moduleService };

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all module routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/modules:
 *   post:
 *     summary: Criar novo módulo
 *     description: Cria um novo módulo no sistema
 *     tags: [Módulos]
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
 *               - customer
 *               - country
 *               - city
 *               - blueprint
 *               - sector
 *               - machineName
 *             properties:
 *               customer:
 *                 type: string
 *                 example: "Cliente ABC"
 *               country:
 *                 type: string
 *                 example: "Brasil"
 *               city:
 *                 type: string
 *                 example: "São Paulo"
 *               blueprint:
 *                 type: string
 *                 example: "Planta A"
 *               sector:
 *                 type: string
 *                 example: "Produção"
 *               machineName:
 *                 type: string
 *                 example: "Máquina Principal"
 *               machineId:
 *                 type: string
 *                 format: uuid
 *                 example: "machine-uuid-here"
 *     responses:
 *       201:
 *         description: Módulo criado com sucesso
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
 *                   example: "Módulo criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "module-uuid-here"
 *                     customer:
 *                       type: string
 *                       example: "Cliente ABC"
 *                     country:
 *                       type: string
 *                       example: "Brasil"
 *                     city:
 *                       type: string
 *                       example: "São Paulo"
 *                     blueprint:
 *                       type: string
 *                       example: "Planta A"
 *                     sector:
 *                       type: string
 *                       example: "Produção"
 *                     machineName:
 *                       type: string
 *                       example: "Máquina Principal"
 *                     machineId:
 *                       type: string
 *                       format: uuid
 *                       example: "machine-uuid-here"
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const validatedData = createModuleWithLocationValidationSchema.parse(
      req.body
    );

    // Get tenant ID from authenticated request (should be set by middleware)
    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const module = await moduleService.createModule({
      ...validatedData,
      tenantId,
    });

    // Subscribe automático ao tópico MQTT do novo módulo
    try {
      const dynamicMqttService = (req as any).app?.locals?.dynamicMqttService;
      if (dynamicMqttService) {
        await dynamicMqttService.subscribeToModuleTopic({
          customer: module.customer,
          country: module.country,
          city: module.city,
        });
      } else {
        console.warn(
          '⚠️ DynamicMqttService não disponível para subscribe automático'
        );
      }
    } catch (mqttError) {
      console.error('❌ Erro no subscribe automático MQTT:', mqttError);
      // Não falhar a criação do módulo se o MQTT falhar
    }

    res.status(201).json({
      success: true,
      message: 'Módulo criado com sucesso',
      data: {
        id: module.id,
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId,
        tenantId: module.tenantId,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
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

    console.error('Error creating module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const validatedParams = searchModulesSchema.parse(req.query);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const filters = {
      tenantId,
      customer: validatedParams.customer,
      country: validatedParams.country,
      city: validatedParams.city,
      sector: validatedParams.sector,
      machineName: validatedParams.machineName,
      machineId: validatedParams.machineId,
      isDeleted: validatedParams.isDeleted ?? false, // Por padrão, apenas módulos ativos
    };

    const modules = await moduleService.getAllModules(filters);
    const total = await moduleService.getModuleCount(filters);

    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 10;

    // Verificar se deve retornar todos os registros
    const returnAll = limit === -1;

    let paginatedModules;
    let paginationInfo;

    if (returnAll) {
      // Retornar todos os registros sem paginação
      paginatedModules = modules;
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
      paginatedModules = modules.slice(startIndex, endIndex);
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
        modules: paginatedModules.map(module => ({
          id: module.id,
          customer: module.customer,
          country: module.country,
          city: module.city,
          blueprint: module.blueprint,
          sector: module.sector,
          machineName: module.machineName,
          machineId: module.machineId,
          tenantId: module.tenantId,
          isDeleted: module.isDeleted,
          createdAt: module.createdAt,
          updatedAt: module.updatedAt,
          deletedAt: module.deletedAt,
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

    console.error('Error fetching modules:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const _validatedParams = moduleStatsSchema.parse(req.query);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const stats = await moduleService.getModuleStats(tenantId);

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

    console.error('Error fetching module stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/by-machine/:machineId', async (req: Request, res: Response) => {
  try {
    const { machineId } = getModulesByMachineSchema.parse({
      machineId: req.params.machineId,
    });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const modules = await moduleService.getModulesByMachineId(
      machineId,
      tenantId
    );

    res.json({
      success: true,
      data: {
        modules: modules.map(module => ({
          id: module.id,
          customer: module.customer,
          country: module.country,
          city: module.city,
          blueprint: module.blueprint,
          sector: module.sector,
          machineName: module.machineName,
          machineId: module.machineId,
          tenantId: module.tenantId,
          isDeleted: module.isDeleted,
          createdAt: module.createdAt,
          updatedAt: module.updatedAt,
          deletedAt: module.deletedAt,
        })),
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

    console.error('Error fetching modules by machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getModuleByIdSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const module = await moduleService.getModuleById(id, tenantId);

    if (!module) {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        id: module.id,
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId,
        tenantId: module.tenantId,
        isDeleted: module.isDeleted,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
        deletedAt: module.deletedAt,
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

    console.error('Error fetching module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getModuleByIdSchema.parse({ id: req.params.id });
    const validatedData = updateModuleWithLocationValidationSchema.parse(
      req.body
    );

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const module = await moduleService.updateModule(
      id,
      validatedData,
      tenantId
    );

    res.json({
      success: true,
      message: 'Módulo atualizado com sucesso',
      data: {
        id: module.id,
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId,
        tenantId: module.tenantId,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
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

    if (error.message === 'Module not found') {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    if (error.message === 'Cannot update deleted module') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível atualizar módulo excluído',
      });
    }

    console.error('Error updating module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = getModuleByIdSchema.parse({ id: req.params.id });
    const { machineId } = z
      .object({ machineId: z.string().uuid() })
      .parse(req.body);

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const module = await moduleService.assignModuleToMachine(
      id,
      machineId,
      tenantId
    );

    res.json({
      success: true,
      message: 'Módulo atribuído à máquina com sucesso',
      data: {
        id: module.id,
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId,
        tenantId: module.tenantId,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
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

    if (error.message === 'Module not found') {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    if (error.message === 'Machine not found or is deleted') {
      return res.status(404).json({
        success: false,
        message: 'Máquina não encontrada ou está excluída',
      });
    }

    if (error.message === 'Cannot assign deleted module to machine') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível atribuir módulo excluído à máquina',
      });
    }

    console.error('Error assigning module to machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/unassign', async (req: Request, res: Response) => {
  try {
    const { id } = unassignModuleFromMachineSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const module = await moduleService.unassignModuleFromMachine(id, tenantId);

    res.json({
      success: true,
      message: 'Módulo desvinculado da máquina com sucesso',
      data: {
        id: module.id,
        customer: module.customer,
        country: module.country,
        city: module.city,
        blueprint: module.blueprint,
        sector: module.sector,
        machineName: module.machineName,
        machineId: module.machineId,
        tenantId: module.tenantId,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
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

    if (error.message === 'Module not found') {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    if (error.message === 'Cannot unassign deleted module from machine') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível desvincular módulo excluído da máquina',
      });
    }

    console.error('Error unassigning module from machine:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = deleteModuleSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const success = await moduleService.deleteModule(id, tenantId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao excluir módulo',
      });
    }

    res.json({
      success: true,
      message: 'Módulo excluído com sucesso',
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

    if (error.message === 'Module not found') {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    if (error.message === 'Module is already deleted') {
      return res.status(409).json({
        success: false,
        message: 'Módulo já está excluído',
      });
    }

    console.error('Error deleting module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = restoreModuleSchema.parse({ id: req.params.id });

    const tenantId = (req as any).user?.tenantId || (req as any).tenant?.id;
    if (!tenantId) {
      return res.status(401).json({
        success: false,
        message: 'Contexto de tenant não encontrado',
      });
    }

    const success = await moduleService.restoreModule(id, tenantId);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao restaurar módulo',
      });
    }

    res.json({
      success: true,
      message: 'Módulo restaurado com sucesso',
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

    if (error.message === 'Module not found') {
      return res.status(404).json({
        success: false,
        message: 'Módulo não encontrado',
      });
    }

    if (error.message === 'Module is not deleted') {
      return res.status(409).json({
        success: false,
        message: 'Módulo não está excluído',
      });
    }

    console.error('Error restoring module:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;
