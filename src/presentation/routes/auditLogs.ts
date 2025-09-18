import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { AuditLogApplicationService } from '../../application/services/AuditLogApplicationService';
import { PrismaAuditLogRepository } from '../../infrastructure/persistence/repositories/PrismaAuditLogRepository';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { AuditLogController } from '../controllers/AuditLogController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repository and Service instances
const auditLogRepository = new PrismaAuditLogRepository(prisma);
const auditLogService = new AuditLogApplicationService(auditLogRepository);
const auditLogController = new AuditLogController(auditLogService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all audit log routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/audit-logs/stats:
 *   get:
 *     summary: Obter estatísticas de auditoria
 *     description: Retorna estatísticas dos logs de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por ação
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filtrar por recurso
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de início do filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de fim do filtro
 *     responses:
 *       200:
 *         description: Estatísticas de auditoria retornadas com sucesso
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
 *                     total:
 *                       type: integer
 *                       example: 1500
 *                     byAction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                             example: "CREATE"
 *                           count:
 *                             type: integer
 *                             example: 500
 *                     byUser:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "user-uuid-here"
 *                           userEmail:
 *                             type: string
 *                             example: "user@example.com"
 *                           count:
 *                             type: integer
 *                             example: 100
 *                     byResource:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           resource:
 *                             type: string
 *                             example: "USER"
 *                           count:
 *                             type: integer
 *                             example: 300
 *                     byDate:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-09-14"
 *                           count:
 *                             type: integer
 *                             example: 50
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
router.get(
  '/stats',
  auditLogController.getAuditLogStats.bind(auditLogController)
);

/**
 * @swagger
 * /api/audit-logs:
 *   get:
 *     summary: Listar logs de auditoria
 *     description: Lista todos os logs de auditoria do tenant com filtros e paginação
 *     tags: [Auditoria]
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
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por ação
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filtrar por recurso
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do recurso
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de início do filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de fim do filtro
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                         example: "audit-log-uuid-here"
 *                       action:
 *                         type: string
 *                         example: "CREATE"
 *                       resource:
 *                         type: string
 *                         example: "USER"
 *                       resourceId:
 *                         type: string
 *                         example: "user-uuid-here"
 *                       userId:
 *                         type: string
 *                         example: "admin-uuid-here"
 *                       userEmail:
 *                         type: string
 *                         example: "admin@example.com"
 *                       tenantId:
 *                         type: string
 *                         example: "tenant-uuid-here"
 *                       ipAddress:
 *                         type: string
 *                         example: "192.168.1.100"
 *                       userAgent:
 *                         type: string
 *                         example: "Mozilla/5.0..."
 *                       details:
 *                         type: object
 *                         example: {"reason": "User creation"}
 *                       oldValues:
 *                         type: object
 *                         example: {}
 *                       newValues:
 *                         type: object
 *                         example: {"name": "John Doe", "email": "john@example.com"}
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-14T12:30:00Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-14T12:30:00Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-09-14T12:30:00Z"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 150
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 15
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
router.get('/', auditLogController.getAuditLogs.bind(auditLogController));

/**
 * @swagger
 * /api/audit-logs/{id}:
 *   get:
 *     summary: Buscar log de auditoria por ID
 *     description: Busca um log de auditoria específico pelo ID
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do log de auditoria
 *     responses:
 *       200:
 *         description: Log de auditoria encontrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AuditLog'
 *       404:
 *         description: Log de auditoria não encontrado
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
router.get('/:id', auditLogController.getAuditLogById.bind(auditLogController));

/**
 * @swagger
 * /api/audit-logs/user/{userId}:
 *   get:
 *     summary: Buscar logs de auditoria por usuário
 *     description: Lista todos os logs de auditoria de um usuário específico
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
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
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por ação
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filtrar por recurso
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria do usuário retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.get(
  '/user/:userId',
  auditLogController.getAuditLogsByUser.bind(auditLogController)
);

/**
 * @swagger
 * /api/audit-logs/resource/{resource}:
 *   get:
 *     summary: Buscar logs de auditoria por recurso
 *     description: Lista todos os logs de auditoria de um recurso específico
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: path
 *         name: resource
 *         required: true
 *         schema:
 *           type: string
 *         description: Nome do recurso
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *         description: ID específico do recurso
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
 *     responses:
 *       200:
 *         description: Lista de logs de auditoria do recurso retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AuditLog'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
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
router.get(
  '/resource/:resource',
  auditLogController.getAuditLogsByResource.bind(auditLogController)
);

/**
 * @swagger
 * /api/audit-logs/recent:
 *   get:
 *     summary: Buscar atividades recentes
 *     description: Lista atividades recentes formatadas para dashboard
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 30
 *           default: 7
 *         description: Número de dias para buscar atividades
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Número máximo de atividades
 *     responses:
 *       200:
 *         description: Atividades recentes retornadas com sucesso
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
 *                     activities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "audit-log-uuid-here"
 *                           action:
 *                             type: string
 *                             example: "CREATE"
 *                           resource:
 *                             type: string
 *                             example: "USER"
 *                           resourceId:
 *                             type: string
 *                             example: "user-uuid-here"
 *                           userEmail:
 *                             type: string
 *                             example: "admin@example.com"
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-09-14T12:30:00Z"
 *                           formattedTime:
 *                             type: string
 *                             example: "2 horas atrás"
 *                           actionLabel:
 *                             type: string
 *                             example: "Criou"
 *                           resourceLabel:
 *                             type: string
 *                             example: "usuário"
 *                           details:
 *                             type: object
 *                             example: {"method": "POST", "url": "/api/users"}
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     period:
 *                       type: string
 *                       example: "7 dias"
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-09-14T12:30:00Z"
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
router.get(
  '/recent',
  auditLogController.getRecentActivities.bind(auditLogController)
);

// Alias para /api/activities (mais amigável para frontend)
router.get(
  '/activities',
  auditLogController.getRecentActivities.bind(auditLogController)
);

/**
 * @swagger
 * /api/audit-logs/stats:
 *   get:
 *     summary: Obter estatísticas de auditoria
 *     description: Retorna estatísticas dos logs de auditoria
 *     tags: [Auditoria]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filtrar por ID do usuário
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *         description: Filtrar por ação
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *         description: Filtrar por recurso
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de início do filtro
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Data de fim do filtro
 *     responses:
 *       200:
 *         description: Estatísticas de auditoria retornadas com sucesso
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
 *                     total:
 *                       type: integer
 *                       example: 1500
 *                     byAction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           action:
 *                             type: string
 *                             example: "CREATE"
 *                           count:
 *                             type: integer
 *                             example: 500
 *                     byUser:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                             example: "user-uuid-here"
 *                           userEmail:
 *                             type: string
 *                             example: "user@example.com"
 *                           count:
 *                             type: integer
 *                             example: 100
 *                     byResource:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           resource:
 *                             type: string
 *                             example: "USER"
 *                           count:
 *                             type: integer
 *                             example: 300
 *                     byDate:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2025-09-14"
 *                           count:
 *                             type: integer
 *                             example: 50
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

/**
 * @swagger
 * /api/audit-logs/cleanup:
 *   post:
 *     summary: Limpar logs antigos
 *     description: Remove logs de auditoria mais antigos que a data especificada
 *     tags: [Auditoria]
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
 *               - olderThan
 *             properties:
 *               olderThan:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *                 description: Data limite para remoção de logs
 *     responses:
 *       200:
 *         description: Logs antigos removidos com sucesso
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
 *                   example: "150 logs de auditoria antigos foram removidos"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedCount:
 *                       type: integer
 *                       example: 150
 *       400:
 *         description: Dados inválidos
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
router.post(
  '/cleanup',
  auditLogController.deleteOldLogs.bind(auditLogController)
);

export default router;
