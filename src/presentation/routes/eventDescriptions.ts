import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { EventDescriptionApplicationService } from '../../application/services/EventDescriptionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaEventDescriptionRepository } from '../../infrastructure/persistence/repositories/PrismaEventDescriptionRepository';
import { EventDescriptionController } from '../controllers/EventDescriptionController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const eventDescriptionRepository = new PrismaEventDescriptionRepository(prisma);
const eventDescriptionService = new EventDescriptionApplicationService(
  eventDescriptionRepository
);
const eventDescriptionController = new EventDescriptionController(
  eventDescriptionService
);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all eventDescription routes
router.use(authMiddleware.requireAuth);

// CRUD Operations
router.post('/', (req, res) =>
  eventDescriptionController.createEventDescription(req, res)
);
router.get('/', (req, res) =>
  eventDescriptionController.getAllEventDescriptions(req, res)
);
router.get('/:id', (req, res) =>
  eventDescriptionController.getEventDescriptionById(req, res)
);
router.put('/:id', (req, res) =>
  eventDescriptionController.updateEventDescription(req, res)
);
router.delete('/:id', (req, res) =>
  eventDescriptionController.deleteEventDescription(req, res)
);
router.patch('/:id/restore', (req, res) =>
  eventDescriptionController.restoreEventDescription(req, res)
);

// Business Operations
router.get('/app/:app', (req, res) =>
  eventDescriptionController.getEventDescriptionsByApp(req, res)
);
router.get('/stop-cause/:stopCauseId', (req, res) =>
  eventDescriptionController.getEventDescriptionsByStopCause(req, res)
);
router.get('/sensor/:sensorId', (req, res) =>
  eventDescriptionController.getEventDescriptionsBySensor(req, res)
);
router.get('/responsible/:responsibleId', (req, res) =>
  eventDescriptionController.getEventDescriptionsByResponsible(req, res)
);
router.get('/process-order/:processOrderId', (req, res) =>
  eventDescriptionController.getEventDescriptionsByProcessOrder(req, res)
);

// View Operations
router.get('/unviewed', (req, res) =>
  eventDescriptionController.getUnviewedEventDescriptions(req, res)
);
router.patch('/:id/view', (req, res) =>
  eventDescriptionController.markEventDescriptionAsViewed(req, res)
);
router.patch('/mark-all-viewed', (req, res) =>
  eventDescriptionController.markAllEventDescriptionsAsViewed(req, res)
);

// Statistics
router.get('/statistics', (req, res) =>
  eventDescriptionController.getEventDescriptionStatistics(req, res)
);

export default router;
