import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { TenantSubscriptionApplicationService } from '../../application/services/TenantSubscriptionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaTenantSubscriptionRepository } from '../../infrastructure/persistence/repositories/PrismaTenantSubscriptionRepository';
import { TenantSubscriptionController } from '../controllers/TenantSubscriptionController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const tenantSubscriptionRepository = new PrismaTenantSubscriptionRepository(
  prisma
);
const tenantSubscriptionService = new TenantSubscriptionApplicationService(
  tenantSubscriptionRepository
);
const tenantSubscriptionController = new TenantSubscriptionController(
  tenantSubscriptionService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all tenantSubscription routes
router.use(authMiddleware.requireAuth);

// CRUD Operations

// POST /api/tenant-subscriptions - Criar inscrição de tenant
router.post(
  '/',
  tenantSubscriptionController.createTenantSubscription.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions - Listar todas as inscrições
router.get(
  '/',
  tenantSubscriptionController.getAllTenantSubscriptions.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions/:id - Obter inscrição por ID
router.get(
  '/:id',
  tenantSubscriptionController.getTenantSubscriptionById.bind(
    tenantSubscriptionController
  )
);

// PUT /api/tenant-subscriptions/:id - Atualizar inscrição
router.put(
  '/:id',
  tenantSubscriptionController.updateTenantSubscription.bind(
    tenantSubscriptionController
  )
);

// DELETE /api/tenant-subscriptions/:id - Excluir inscrição (soft delete)
router.delete(
  '/:id',
  tenantSubscriptionController.deleteTenantSubscription.bind(
    tenantSubscriptionController
  )
);

// POST /api/tenant-subscriptions/:id/restore - Restaurar inscrição
router.post(
  '/:id/restore',
  tenantSubscriptionController.restoreTenantSubscription.bind(
    tenantSubscriptionController
  )
);

// =====================
// Business Operations
// =====================

// GET /api/tenant-subscriptions/tenant/:tenantId - Obter inscrições por tenant
router.get(
  '/tenant/:tenantId',
  tenantSubscriptionController.getTenantSubscriptionsByTenant.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions/application/:applicationId - Obter inscrições por aplicação
router.get(
  '/application/:applicationId',
  tenantSubscriptionController.getTenantSubscriptionsByApplication.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions/tenant/:tenantId/application/:applicationId - Obter inscrição específica
router.get(
  '/tenant/:tenantId/application/:applicationId',
  tenantSubscriptionController.getTenantSubscriptionByTenantAndApplication.bind(
    tenantSubscriptionController
  )
);

// =====================
// Advanced Operations
// =====================

// GET /api/tenant-subscriptions/expiring - Obter inscrições próximas do vencimento
router.get(
  '/expiring',
  tenantSubscriptionController.getExpiringSubscriptions.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions/plan/:plan - Obter inscrições por plano
router.get(
  '/plan/:plan',
  tenantSubscriptionController.getSubscriptionsByPlan.bind(
    tenantSubscriptionController
  )
);

// =====================
// Statistics & Analytics
// =====================

// GET /api/tenant-subscriptions/statistics/tenant/:tenantId - Estatísticas por tenant
router.get(
  '/statistics/tenant/:tenantId',
  tenantSubscriptionController.getTenantSubscriptionStatistics.bind(
    tenantSubscriptionController
  )
);

// GET /api/tenant-subscriptions/statistics/application/:applicationId - Estatísticas por aplicação
router.get(
  '/statistics/application/:applicationId',
  tenantSubscriptionController.getTenantSubscriptionStatistics.bind(
    tenantSubscriptionController
  )
);

export default router;
