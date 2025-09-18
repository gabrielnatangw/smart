import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { MeasurementUnitApplicationService } from '../../application/services/MeasurementUnitApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaMeasurementUnitRepository } from '../../infrastructure/persistence/repositories/PrismaMeasurementUnitRepository';
import { MeasurementUnitController } from '../controllers/MeasurementUnitController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const measurementUnitRepository = new PrismaMeasurementUnitRepository(prisma);
const measurementUnitService = new MeasurementUnitApplicationService(
  measurementUnitRepository
);
const measurementUnitController = new MeasurementUnitController(
  measurementUnitService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all measurementUnit routes
router.use(authMiddleware.requireAuth);

/**
 * @swagger
 * /api/measurement-units:
 *   post:
 *     summary: Criar nova unidade de medida
 *     description: Cria uma nova unidade de medida no sistema
 *     tags: [Unidades de Medida]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [label, description]
 *             properties:
 *               label:
 *                 type: string
 *                 example: "°C"
 *               description:
 *                 type: string
 *                 example: "Graus Celsius"
 *     responses:
 *       201:
 *         description: Unidade de medida criada com sucesso
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
 *                   example: "Unidade de medida criada com sucesso"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       example: "measurement-unit-uuid-here"
 *                     label:
 *                       type: string
 *                       example: "°C"
 *                     description:
 *                       type: string
 *                       example: "Graus Celsius"
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
 *         description: Label da unidade já existe
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
  await measurementUnitController.create(req, res);
});

/**
 * @swagger
 * /api/measurement-units:
 *   get:
 *     summary: Listar unidades de medida
 *     description: Lista todas as unidades de medida com paginação e filtros
 *     tags: [Unidades de Medida]
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
 *         name: label
 *         schema:
 *           type: string
 *         description: Filtrar por label da unidade
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Filtrar por descrição
 *       - in: query
 *         name: isDeleted
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir unidades deletadas
 *     responses:
 *       200:
 *         description: Lista de unidades de medida retornada com sucesso
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
 *                     measurementUnits:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             format: uuid
 *                             example: "measurement-unit-uuid-here"
 *                           label:
 *                             type: string
 *                             example: "°C"
 *                           description:
 *                             type: string
 *                             example: "Graus Celsius"
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
  await measurementUnitController.getAll(req, res);
});

// GET /api/measurement-units/stats - Get measurement units statistics
router.get('/stats', async (req, res) => {
  await measurementUnitController.getStats(req, res);
});

// GET /api/measurement-units/by-label - Get measurement unit by label and tenant
router.get('/by-label', async (req, res) => {
  await measurementUnitController.getByLabel(req, res);
});

// GET /api/measurement-units/by-tenant/:tenantId - Get measurement units by tenant
router.get('/by-tenant/:tenantId', async (req, res) => {
  await measurementUnitController.getByTenant(req, res);
});

// GET /api/measurement-units/:id - Get measurement unit by ID
router.get('/:id', async (req, res) => {
  await measurementUnitController.getById(req, res);
});

// PUT /api/measurement-units/:id - Update measurement unit
router.put('/:id', async (req, res) => {
  await measurementUnitController.update(req, res);
});

// DELETE /api/measurement-units/:id - Delete measurement unit (soft delete)
router.delete('/:id', async (req, res) => {
  await measurementUnitController.delete(req, res);
});

// PATCH /api/measurement-units/:id/restore - Restore deleted measurement unit
router.patch('/:id/restore', async (req, res) => {
  await measurementUnitController.restore(req, res);
});

export default router;
