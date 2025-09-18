import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ApplicationApplicationService } from '../../application/services/ApplicationApplicationService';
import { PrismaApplicationRepository } from '../../infrastructure/persistence/repositories/PrismaApplicationRepository';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { ApplicationController } from '../controllers/ApplicationController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const applicationRepository = new PrismaApplicationRepository(prisma);
const applicationApplicationService = new ApplicationApplicationService(
  applicationRepository
);
const applicationController = new ApplicationController(
  applicationApplicationService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all application routes
router.use(authMiddleware.requireAuth);

// CRUD Operations
router.post('/', (req, res) =>
  applicationController.createApplication(req, res)
);
router.get('/', (req, res) =>
  applicationController.getAllApplications(req, res)
);
router.get('/:id', (req, res) =>
  applicationController.getApplicationById(req, res)
);
router.put('/:id', (req, res) =>
  applicationController.updateApplication(req, res)
);
router.delete('/:id', (req, res) =>
  applicationController.deleteApplication(req, res)
);
router.patch('/:id/restore', (req, res) =>
  applicationController.restoreApplication(req, res)
);

// Business Operations
router.get('/name/:name', (req, res) =>
  applicationController.getApplicationByName(req, res)
);
router.get('/display-name/:displayName', (req, res) =>
  applicationController.getApplicationsByDisplayName(req, res)
);
router.get('/active', (req, res) =>
  applicationController.getActiveApplications(req, res)
);
router.get('/inactive', (req, res) =>
  applicationController.getInactiveApplications(req, res)
);

// Statistics
router.get('/statistics', (req, res) =>
  applicationController.getApplicationStatistics(req, res)
);

export default router;
