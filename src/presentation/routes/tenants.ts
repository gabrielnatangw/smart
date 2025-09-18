import { PrismaClient } from '@prisma/client';
import { Request, Response, Router } from 'express';

import { TenantApplicationService } from '../../application/services/TenantApplicationService';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaTenantRepository } from '../../infrastructure/persistence/repositories/PrismaTenantRepository';
import { PrismaUserPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaUserPermissionRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import {
  AuthenticatedRequest,
  AuthenticationMiddleware,
} from '../middleware/authenticationMiddleware';
import {
  createTenantSchema,
  createTenantWithAdminSchema,
  deleteTenantSchema,
  getTenantByIdSchema,
  searchTenantsSchema,
  tenantStatsSchema,
  updateTenantSchema,
} from '../validators/tenantValidators';

const router = Router();
const prisma = new PrismaClient();
const tenantRepository = new PrismaTenantRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const userPermissionRepository = new PrismaUserPermissionRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);
const userService = new UserApplicationService(
  userRepository,
  userPermissionRepository,
  permissionRepository,
  prisma
);
const tenantService = new TenantApplicationService(
  tenantRepository,
  userService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all tenant routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/tenants:
 *   post:
 *     summary: Criar novo tenant
 *     description: Cria um novo tenant no sistema
 *     tags: [Tenants]
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
 *               - cnpj
 *               - address
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Empresa Exemplo"
 *               cnpj:
 *                 type: string
 *                 example: "12345678901234"
 *               address:
 *                 type: string
 *                 example: "Rua Exemplo, 123"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Tenant criado com sucesso
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
 *                   example: "Tenant criado com sucesso"
 *                 data:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: CNPJ já cadastrado
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
    const validatedData = createTenantSchema.parse(req.body);

    const tenant = await tenantService.createTenant(validatedData);

    res.status(201).json({
      success: true,
      message: 'Tenant criado com sucesso',
      data: {
        id: tenant.id,
        name: tenant.name,
        cnpj: tenant.cnpj,
        address: tenant.address,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
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

    if (error.message === 'CNPJ already registered') {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já está cadastrado',
      });
    }

    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.post('/with-admin', async (req: Request, res: Response) => {
  try {
    const validatedData = createTenantWithAdminSchema.parse(req.body);

    const processedData = {
      ...validatedData,
      adminUser: {
        ...validatedData.adminUser,
      },
    };

    const result = await tenantService.createTenantWithAdmin(processedData);

    res.status(201).json({
      success: true,
      message: 'Tenant e usuário administrador criados com sucesso',
      data: {
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
          cnpj: result.tenant.cnpj,
          address: result.tenant.address,
          isActive: result.tenant.isActive,
          createdAt: result.tenant.createdAt,
          updatedAt: result.tenant.updatedAt,
        },
        adminUser: {
          id: result.adminUser.id,
          name: result.adminUser.name,
          email: result.adminUser.email,
          accessType: result.adminUser.userType,
          userType: result.adminUser.userType,
          firstLogin: result.adminUser.firstLogin,
          isActive: result.adminUser.isActive,
          tenantId: result.adminUser.tenantId,
          createdAt: result.adminUser.createdAt,
          updatedAt: result.adminUser.updatedAt,
        },
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

    if (error.message === 'CNPJ already registered') {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já está cadastrado',
      });
    }

    if (error.message === 'Admin email already registered') {
      return res.status(409).json({
        success: false,
        message: 'Email do administrador já está cadastrado',
      });
    }

    console.error('Error creating tenant with admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

/**
 * @swagger
 * /api/tenants:
 *   get:
 *     summary: Listar tenants
 *     description: Lista todos os tenants com paginação e filtros
 *     tags: [Tenants]
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
 *         name: search
 *         schema:
 *           type: string
 *         description: Termo de busca por nome
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filtrar por status ativo
 *       - in: query
 *         name: includeDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir tenants deletados
 *     responses:
 *       200:
 *         description: Lista de tenants retornada com sucesso
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
 *                     tenants:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Tenant'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Parâmetros inválidos
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
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Verificar se o usuário é ROOT - apenas ROOT pode ver todos os tenants
    if (req.user?.userType !== 'root') {
      return res.status(403).json({
        success: false,
        message:
          'Acesso negado: apenas usuários ROOT podem listar todos os tenants',
      });
    }

    const validatedParams = searchTenantsSchema.parse(req.query);

    const filters = {
      name: validatedParams.search,
      isActive: validatedParams.isActive,
      includeDeleted: validatedParams.includeDeleted,
    };

    const tenants = await tenantService.getAllTenants(filters);
    const total = await tenantService.getTenantCount(filters);

    const page = validatedParams.page || 1;
    const limit = validatedParams.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedTenants = tenants.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        tenants: paginatedTenants.map(tenant => ({
          id: tenant.id,
          name: tenant.name,
          cnpj: tenant.cnpj,
          address: tenant.address,
          isActive: tenant.isActive,
          isDeleted: tenant.isDeleted,
          createdAt: tenant.createdAt,
          updatedAt: tenant.updatedAt,
          deletedAt: tenant.deletedAt,
        })),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
          hasNext: endIndex < total,
          hasPrev: page > 1,
        },
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

    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const _validatedParams = tenantStatsSchema.parse(req.query);

    const stats = await tenantService.getTenantStats();

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

    console.error('Error fetching tenant stats:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getTenantByIdSchema.parse({ id: req.params.id });

    const tenant = await tenantService.getTenantById(id);

    if (!tenant) {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        cnpj: tenant.cnpj,
        address: tenant.address,
        isActive: tenant.isActive,
        isDeleted: tenant.isDeleted,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        deletedAt: tenant.deletedAt,
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

    console.error('Error fetching tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = getTenantByIdSchema.parse({ id: req.params.id });
    const validatedData = updateTenantSchema.parse(req.body);

    const tenant = await tenantService.updateTenant(id, validatedData);

    res.json({
      success: true,
      message: 'Tenant atualizado com sucesso',
      data: {
        id: tenant.id,
        name: tenant.name,
        cnpj: tenant.cnpj,
        address: tenant.address,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
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

    if (error.message === 'Tenant not found') {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    if (error.message === 'Cannot update deleted tenant') {
      return res.status(409).json({
        success: false,
        message: 'Não é possível atualizar tenant excluído',
      });
    }

    if (error.message === 'CNPJ already registered by another tenant') {
      return res.status(409).json({
        success: false,
        message: 'CNPJ já está cadastrado por outro tenant',
      });
    }

    console.error('Error updating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = getTenantByIdSchema.parse({ id: req.params.id });

    const tenant = await tenantService.activateTenant(id);

    res.json({
      success: true,
      message: 'Tenant ativado com sucesso',
      data: {
        id: tenant.id,
        name: tenant.name,
        isActive: tenant.isActive,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    console.error('Error activating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/deactivate', async (req: Request, res: Response) => {
  try {
    const { id } = getTenantByIdSchema.parse({ id: req.params.id });

    const tenant = await tenantService.deactivateTenant(id);

    res.json({
      success: true,
      message: 'Tenant desativado com sucesso',
      data: {
        id: tenant.id,
        name: tenant.name,
        isActive: tenant.isActive,
        updatedAt: tenant.updatedAt,
      },
    });
  } catch (error: any) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    console.error('Error deactivating tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.patch('/:id/restore', async (req: Request, res: Response) => {
  try {
    const { id } = getTenantByIdSchema.parse({ id: req.params.id });

    const success = await tenantService.restoreTenant(id);

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao restaurar tenant',
      });
    }

    res.json({
      success: true,
      message: 'Tenant restaurado com sucesso',
    });
  } catch (error: any) {
    if (error.message === 'Tenant not found') {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    if (error.message === 'Tenant is not deleted') {
      return res.status(409).json({
        success: false,
        message: 'Tenant não está excluído',
      });
    }

    console.error('Error restoring tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const validatedData = deleteTenantSchema.parse({
      id: req.params.id,
      permanent: req.query.permanent,
    });

    const success = await tenantService.deleteTenant(
      validatedData.id,
      validatedData.permanent
    );

    if (!success) {
      return res.status(500).json({
        success: false,
        message: 'Falha ao excluir tenant',
      });
    }

    res.json({
      success: true,
      message: validatedData.permanent
        ? 'Tenant excluído permanentemente'
        : 'Tenant excluído com sucesso',
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

    if (error.message === 'Tenant not found') {
      return res.status(404).json({
        success: false,
        message: 'Tenant não encontrado',
      });
    }

    console.error('Error deleting tenant:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
    });
  }
});

export default router;
