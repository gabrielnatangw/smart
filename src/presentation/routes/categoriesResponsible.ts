import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { CategoriesResponsibleApplicationService } from '../../application/services/CategoriesResponsibleApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaCategoriesResponsibleRepository } from '../../infrastructure/persistence/repositories/PrismaCategoriesResponsibleRepository';
import { CategoriesResponsibleController } from '../controllers/CategoriesResponsibleController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import {
  createCategoriesResponsibleSchema,
  getAllCategoriesResponsibleSchema,
  getCategoriesResponsibleByIdSchema,
  updateCategoriesResponsibleSchema,
} from '../validators/categoriesResponsibleValidators';

const router = Router();

// Inicializar dependências
const prisma = new PrismaClient();
const categoriesResponsibleRepository =
  new PrismaCategoriesResponsibleRepository(prisma);
const categoriesResponsibleApplicationService =
  new CategoriesResponsibleApplicationService(categoriesResponsibleRepository);
const categoriesResponsibleController = new CategoriesResponsibleController(
  categoriesResponsibleApplicationService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all categoriesResponsible routes
router.use(authMiddleware.requireAuth);

// =====================
// CRUD Operations
// =====================

// POST /api/categories-responsible - Criar nova categoria de responsável
router.post(
  '/',
  validateRequest(createCategoriesResponsibleSchema),
  categoriesResponsibleController.createCategoriesResponsible.bind(
    categoriesResponsibleController
  )
);

// GET /api/categories-responsible/:categoryResponsibleId - Buscar categoria por ID
router.get(
  '/:categoryResponsibleId',
  validateRequest(getCategoriesResponsibleByIdSchema),
  categoriesResponsibleController.getCategoriesResponsibleById.bind(
    categoriesResponsibleController
  )
);

// GET /api/categories-responsible - Listar todas as categorias
router.get(
  '/',
  validateRequest(getAllCategoriesResponsibleSchema),
  categoriesResponsibleController.getAllCategoriesResponsible.bind(
    categoriesResponsibleController
  )
);

// PUT /api/categories-responsible/:categoryResponsibleId - Atualizar categoria
router.put(
  '/:categoryResponsibleId',
  validateRequest(updateCategoriesResponsibleSchema),
  categoriesResponsibleController.updateCategoriesResponsible.bind(
    categoriesResponsibleController
  )
);

// DELETE /api/categories-responsible/:categoryResponsibleId - Excluir categoria (soft delete)
router.delete(
  '/:categoryResponsibleId',
  validateRequest(getCategoriesResponsibleByIdSchema),
  categoriesResponsibleController.deleteCategoriesResponsible.bind(
    categoriesResponsibleController
  )
);

// POST /api/categories-responsible/:categoryResponsibleId/restore - Restaurar categoria
router.post(
  '/:categoryResponsibleId/restore',
  validateRequest(getCategoriesResponsibleByIdSchema),
  categoriesResponsibleController.restoreCategoriesResponsible.bind(
    categoriesResponsibleController
  )
);

// =====================
// Business Operations
// =====================

// GET /api/categories-responsible/search/name - Buscar categorias por nome
router.get(
  '/search/name',
  validateRequest(getAllCategoriesResponsibleSchema),
  categoriesResponsibleController.findCategoriesResponsibleByName.bind(
    categoriesResponsibleController
  )
);

// GET /api/categories-responsible/search/with-responsible - Buscar categorias com responsáveis
router.get(
  '/search/with-responsible',
  categoriesResponsibleController.findCategoriesWithResponsible.bind(
    categoriesResponsibleController
  )
);

// GET /api/categories-responsible/search/without-responsible - Buscar categorias sem responsáveis
router.get(
  '/search/without-responsible',
  categoriesResponsibleController.findCategoriesWithoutResponsible.bind(
    categoriesResponsibleController
  )
);

// =====================
// Statistics & Analytics
// =====================

// GET /api/categories-responsible/statistics - Obter estatísticas
router.get(
  '/statistics',
  validateRequest(getAllCategoriesResponsibleSchema),
  categoriesResponsibleController.getStatistics.bind(
    categoriesResponsibleController
  )
);

export default router;
