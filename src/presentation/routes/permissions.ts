import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaUserPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaUserPermissionRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import { PermissionController } from '../controllers/PermissionController';
import { UserPermissionController } from '../controllers/UserPermissionController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import { PermissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repositories
const permissionRepository = new PrismaPermissionRepository(prisma);
const userPermissionRepository = new PrismaUserPermissionRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const authRepository = new PrismaAuthenticationRepository(prisma);

// Services
const permissionService = new PermissionApplicationService(
  permissionRepository,
  userPermissionRepository,
  userRepository
);

// Controllers
const permissionController = new PermissionController(permissionService);
const _userPermissionController = new UserPermissionController(
  permissionService
);

// Middleware
const authMiddleware = new AuthenticationMiddleware(authRepository);
const _permissionMiddleware = new PermissionMiddleware(permissionService);

// Apply authentication to all routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/permissions:
 *   post:
 *     summary: Criar nova permissão
 *     description: Cria uma nova permissão no sistema
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - functionName
 *               - permissionLevel
 *               - displayName
 *               - applicationId
 *             properties:
 *               functionName:
 *                 type: string
 *                 example: "users"
 *               permissionLevel:
 *                 type: string
 *                 enum: [read, write, update, delete]
 *                 example: "read"
 *               displayName:
 *                 type: string
 *                 example: "Visualizar Usuários"
 *               description:
 *                 type: string
 *                 example: "Permissão para visualizar usuários"
 *               applicationId:
 *                 type: string
 *                 format: uuid
 *                 example: "app-uuid"
 *     responses:
 *       201:
 *         description: Permissão criada com sucesso
 *       400:
 *         description: Dados inválidos
 *       500:
 *         description: Erro interno do servidor
 */
router.post('/', permissionController.createPermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: Obter permissão por ID
 *     description: Retorna uma permissão específica pelo ID
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "permission-uuid"
 *     responses:
 *       200:
 *         description: Permissão encontrada
 *       404:
 *         description: Permissão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/:id', permissionController.getPermissionById);

/**
 * @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: Atualizar permissão
 *     description: Atualiza uma permissão existente
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "permission-uuid"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *                 example: "Visualizar Usuários"
 *               description:
 *                 type: string
 *                 example: "Permissão para visualizar usuários"
 *     responses:
 *       200:
 *         description: Permissão atualizada com sucesso
 *       404:
 *         description: Permissão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.put('/:id', permissionController.updatePermission);

/**
 * @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: Excluir permissão
 *     description: Exclui uma permissão do sistema
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "permission-uuid"
 *     responses:
 *       200:
 *         description: Permissão excluída com sucesso
 *       404:
 *         description: Permissão não encontrada
 *       500:
 *         description: Erro interno do servidor
 */
router.delete('/:id', permissionController.deletePermission);

/**
 * @swagger
 * /api/permissions/function/{functionName}:
 *   get:
 *     summary: Obter permissões por função
 *     description: Retorna todas as permissões de uma função específica
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: functionName
 *         required: true
 *         schema:
 *           type: string
 *         example: "users"
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "app-uuid"
 *     responses:
 *       200:
 *         description: Lista de permissões da função
 *       400:
 *         description: Application ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get(
  '/function/:functionName',
  permissionController.getPermissionsByFunction
);

/**
 * @swagger
 * /api/permissions:
 *   get:
 *     summary: Obter todas as permissões
 *     description: Retorna todas as permissões de uma aplicação
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "app-uuid"
 *     responses:
 *       200:
 *         description: Lista de todas as permissões
 *       400:
 *         description: Application ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/', (req, res) => permissionController.getAllPermissions(req, res));

/**
 * @swagger
 * /api/permissions/tenant:
 *   get:
 *     summary: Obter permissões por tenant
 *     description: Retorna todas as permissões do tenant do usuário autenticado
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de permissões do tenant
 *       400:
 *         description: Tenant ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/tenant', (req, res) =>
  permissionController.getPermissionsByTenant(req, res)
);

/**
 * @swagger
 * /api/permissions/functions:
 *   get:
 *     summary: Obter funções disponíveis
 *     description: Retorna todas as funções disponíveis em uma aplicação
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "app-uuid"
 *     responses:
 *       200:
 *         description: Lista de funções disponíveis
 *       400:
 *         description: Application ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/functions', permissionController.getAvailableFunctions);

/**
 * @swagger
 * /api/permissions/levels/{functionName}:
 *   get:
 *     summary: Obter níveis de permissão por função
 *     description: Retorna todos os níveis de permissão disponíveis para uma função
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: functionName
 *         required: true
 *         schema:
 *           type: string
 *         example: "users"
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "app-uuid"
 *     responses:
 *       200:
 *         description: Lista de níveis de permissão
 *       400:
 *         description: Application ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/levels/:functionName', permissionController.getAvailableLevels);

/**
 * @swagger
 * /api/permissions/grouped:
 *   get:
 *     summary: Obter permissões agrupadas por função
 *     description: Retorna todas as permissões agrupadas por função
 *     tags: [Permissões]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: applicationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         example: "app-uuid"
 *     responses:
 *       200:
 *         description: Permissões agrupadas por função
 *       400:
 *         description: Application ID é obrigatório
 *       500:
 *         description: Erro interno do servidor
 */
router.get('/grouped', permissionController.getPermissionsByFunctionGrouped);

export default router;
