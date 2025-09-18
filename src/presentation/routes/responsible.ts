import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ResponsibleApplicationService } from '../../application/services/ResponsibleApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaResponsibleRepository } from '../../infrastructure/persistence/repositories/PrismaResponsibleRepository';
import { ResponsibleController } from '../controllers/ResponsibleController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const responsibleRepository = new PrismaResponsibleRepository(prisma);
const responsibleService = new ResponsibleApplicationService(
  responsibleRepository
);
const responsibleController = new ResponsibleController(responsibleService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all responsible routes
router.use(authMiddleware.requireAuth);

// CRUD Operations
router.post('/', (req, res) =>
  responsibleController.createResponsible(req, res)
);
router.get('/', (req, res) =>
  responsibleController.getAllResponsibles(req, res)
);
router.get('/:id', (req, res) =>
  responsibleController.getResponsibleById(req, res)
);
router.put('/:id', (req, res) =>
  responsibleController.updateResponsible(req, res)
);
router.delete('/:id', (req, res) =>
  responsibleController.deleteResponsible(req, res)
);
router.patch('/:id/restore', (req, res) =>
  responsibleController.restoreResponsible(req, res)
);

// Business Operations
router.get('/category/:categoryResponsibleId', (req, res) =>
  responsibleController.getResponsiblesByCategory(req, res)
);
router.get('/without-category', (req, res) =>
  responsibleController.getResponsiblesWithoutCategory(req, res)
);
router.get('/code/:codeResponsible', (req, res) =>
  responsibleController.getResponsibleByCode(req, res)
);
router.get('/name/:name', (req, res) =>
  responsibleController.getResponsiblesByName(req, res)
);

// Statistics
router.get('/statistics', (req, res) =>
  responsibleController.getResponsibleStatistics(req, res)
);

export default router;
