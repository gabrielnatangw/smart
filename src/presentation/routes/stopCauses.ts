import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { StopCauseApplicationService } from '../../application/services/StopCauseApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaStopCauseRepository } from '../../infrastructure/persistence/repositories/PrismaStopCauseRepository';
import { StopCauseController } from '../controllers/StopCauseController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createStopCauseSchema,
  deleteStopCauseSchema,
  findStopCausesByDescriptionSchema,
  findStopCausesByLevelSchema,
  getAllStopCausesSchema,
  getAncestorsSchema,
  getChildrenSchema,
  getDescendantsSchema,
  getHierarchySchema,
  getParentSchema,
  getRootStopCausesSchema,
  getStatisticsSchema,
  getStopCauseByIdSchema,
  moveStopCauseSchema,
  restoreStopCauseSchema,
  updateStopCauseSchema,
} from '../validators/stopCauseValidators';

const router = Router();

// Inicializar dependências
const prisma = new PrismaClient();
const stopCauseRepository = new PrismaStopCauseRepository(prisma);
const stopCauseApplicationService = new StopCauseApplicationService(
  stopCauseRepository
);
const stopCauseController = new StopCauseController(
  stopCauseApplicationService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all stopCause routes
router.use(authMiddleware.requireAuth);

// =====================
// CRUD Operations
// =====================

// POST /api/stop-causes - Criar nova causa de parada
router.post(
  '/',
  validateRequest(createStopCauseSchema),
  stopCauseController.createStopCause.bind(stopCauseController)
);

// GET /api/stop-causes/:stopCauseId - Buscar causa de parada por ID
router.get(
  '/:stopCauseId',
  validateRequest(getStopCauseByIdSchema),
  stopCauseController.getStopCauseById.bind(stopCauseController)
);

// GET /api/stop-causes - Listar todas as causas de parada
router.get(
  '/',
  validateRequest(getAllStopCausesSchema),
  stopCauseController.getAllStopCauses.bind(stopCauseController)
);

// PUT /api/stop-causes/:stopCauseId - Atualizar causa de parada
router.put(
  '/:stopCauseId',
  validateRequest(updateStopCauseSchema),
  stopCauseController.updateStopCause.bind(stopCauseController)
);

// DELETE /api/stop-causes/:stopCauseId - Excluir causa de parada (soft delete)
router.delete(
  '/:stopCauseId',
  validateRequest(deleteStopCauseSchema),
  stopCauseController.deleteStopCause.bind(stopCauseController)
);

// POST /api/stop-causes/:stopCauseId/restore - Restaurar causa de parada
router.post(
  '/:stopCauseId/restore',
  validateRequest(restoreStopCauseSchema),
  stopCauseController.restoreStopCause.bind(stopCauseController)
);

// =====================
// Hierarchy Operations
// =====================

// GET /api/stop-causes/hierarchy - Obter hierarquia completa
router.get(
  '/hierarchy',
  validateRequest(getHierarchySchema),
  stopCauseController.getHierarchy.bind(stopCauseController)
);

// GET /api/stop-causes/root - Obter causas de parada raiz
router.get(
  '/root',
  validateRequest(getRootStopCausesSchema),
  stopCauseController.getRootStopCauses.bind(stopCauseController)
);

// GET /api/stop-causes/:stopCauseId/children - Obter filhos de uma causa de parada
router.get(
  '/:stopCauseId/children',
  validateRequest(getChildrenSchema),
  stopCauseController.getChildren.bind(stopCauseController)
);

// GET /api/stop-causes/:stopCauseId/parent - Obter pai de uma causa de parada
router.get(
  '/:stopCauseId/parent',
  validateRequest(getParentSchema),
  stopCauseController.getParent.bind(stopCauseController)
);

// GET /api/stop-causes/:stopCauseId/ancestors - Obter ancestrais de uma causa de parada
router.get(
  '/:stopCauseId/ancestors',
  validateRequest(getAncestorsSchema),
  stopCauseController.getAncestors.bind(stopCauseController)
);

// GET /api/stop-causes/:stopCauseId/descendants - Obter descendentes de uma causa de parada
router.get(
  '/:stopCauseId/descendants',
  validateRequest(getDescendantsSchema),
  stopCauseController.getDescendants.bind(stopCauseController)
);

// PUT /api/stop-causes/:stopCauseId/move - Mover causa de parada na hierarquia
router.put(
  '/:stopCauseId/move',
  validateRequest(moveStopCauseSchema),
  stopCauseController.moveStopCause.bind(stopCauseController)
);

// =====================
// Business Operations
// =====================

// GET /api/stop-causes/search/root - Buscar causas de parada raiz
router.get(
  '/search/root',
  validateRequest(getRootStopCausesSchema),
  stopCauseController.findRootStopCauses.bind(stopCauseController)
);

// GET /api/stop-causes/search/leaf - Buscar causas de parada folha
router.get(
  '/search/leaf',
  validateRequest(getAllStopCausesSchema),
  stopCauseController.findLeafStopCauses.bind(stopCauseController)
);

// GET /api/stop-causes/search/level - Buscar causas de parada por nível
router.get(
  '/search/level',
  validateRequest(findStopCausesByLevelSchema),
  stopCauseController.findStopCausesByLevel.bind(stopCauseController)
);

// GET /api/stop-causes/search/description - Buscar causas de parada por descrição
router.get(
  '/search/description',
  validateRequest(findStopCausesByDescriptionSchema),
  stopCauseController.findStopCausesByDescription.bind(stopCauseController)
);

// =====================
// Statistics & Analytics
// =====================

// GET /api/stop-causes/statistics - Obter estatísticas
router.get(
  '/statistics',
  validateRequest(getStatisticsSchema),
  stopCauseController.getStatistics.bind(stopCauseController)
);

// GET /api/stop-causes/tree - Obter árvore de causas de parada
router.get(
  '/tree',
  validateRequest(getHierarchySchema),
  stopCauseController.getStopCauseTree.bind(stopCauseController)
);

export default router;
