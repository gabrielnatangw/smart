import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { RoleApplicationService } from '../../application/services/RoleApplicationService';
import { RolePermissionApplicationService } from '../../application/services/RolePermissionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaRolePermissionRepository } from '../../infrastructure/persistence/repositories/PrismaRolePermissionRepository';
import { PrismaRoleRepository } from '../../infrastructure/persistence/repositories/PrismaRoleRepository';
import { RoleController } from '../controllers/RoleController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repositories
const roleRepository = new PrismaRoleRepository(prisma);
const rolePermissionRepository = new PrismaRolePermissionRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);

// Services
const roleService = new RoleApplicationService(roleRepository);
const rolePermissionService = new RolePermissionApplicationService(
  rolePermissionRepository,
  permissionRepository,
  roleRepository
);

// Controllers
const roleController = new RoleController(roleService, rolePermissionService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all role routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/roles:
 *   post:
 *     summary: Criar novo papel
 *     description: Cria um novo papel (role) no sistema
 *     tags: [Papéis]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Administrador"
 *               description:
 *                 type: string
 *                 example: "Papel com acesso total ao sistema"
 *     responses:
 *       201:
 *         description: Papel criado com sucesso
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
 *                   example: "Papel criado com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "role-uuid-here"
 *                     name:
 *                       type: string
 *                       example: "Administrador"
 *                     description:
 *                       type: string
 *                       example: "Papel com acesso total ao sistema"
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
 *         description: Nome do papel já existe
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
router.post('/', async (req, res) => {
  await roleController.create(req, res);
});

/**
 * @swagger
 * /api/roles:
 *   get:
 *     summary: Listar papéis
 *     description: Lista todos os papéis com paginação e filtros
 *     tags: [Papéis]
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
 *         name: name
 *         schema:
 *           type: string
 *         description: Filtrar por nome do papel
 *       - in: query
 *         name: isDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir papéis deletados
 *     responses:
 *       200:
 *         description: Lista de papéis retornada com sucesso
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
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "role-uuid-here"
 *                           name:
 *                             type: string
 *                             example: "Administrador"
 *                           description:
 *                             type: string
 *                             example: "Papel com acesso total ao sistema"
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
 *       500:
 *         description: Erro interno do servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', async (req, res) => {
  await roleController.getAll(req, res);
});

// GET /api/roles/stats - Get roles statistics
router.get('/stats', async (req, res) => {
  await roleController.getStats(req, res);
});

// GET /api/roles/by-name - Get role by name
router.get('/by-name', async (req, res) => {
  await roleController.getByName(req, res);
});

// GET /api/roles/:id - Get role by ID
router.get('/:id', async (req, res) => {
  await roleController.getById(req, res);
});

// PUT /api/roles/:id - Update role
router.put('/:id', async (req, res) => {
  await roleController.update(req, res);
});

// DELETE /api/roles/:id - Delete role (soft delete)
router.delete('/:id', async (req, res) => {
  await roleController.delete(req, res);
});

// PATCH /api/roles/:id/restore - Restore deleted role
router.patch('/:id/restore', async (req, res) => {
  await roleController.restore(req, res);
});

export default router;
