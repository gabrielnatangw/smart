import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ShiftApplicationService } from '../../application/services/ShiftApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaShiftRepository } from '../../infrastructure/persistence/repositories/PrismaShiftRepository';
import { ShiftController } from '../controllers/ShiftController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();
const shiftRepository = new PrismaShiftRepository(prisma);
const shiftApplicationService = new ShiftApplicationService(shiftRepository);
const shiftController = new ShiftController(shiftApplicationService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all shift routes
router.use(authMiddleware.requireAuth);

// Rotas CRUD básicas

// POST /api/shifts - Criar novo turno
router.post('/', shiftController.createShift.bind(shiftController));

// GET /api/shifts - Listar todos os turnos
router.get('/', shiftController.getAllShifts.bind(shiftController));

// GET /api/shifts/:shiftId - Obter turno por ID
router.get('/:shiftId', shiftController.getShiftById.bind(shiftController));

// PUT /api/shifts/:shiftId - Atualizar turno
router.put('/:shiftId', shiftController.updateShift.bind(shiftController));

// DELETE /api/shifts/:shiftId - Excluir turno (soft delete)
router.delete('/:shiftId', shiftController.deleteShift.bind(shiftController));

// PATCH /api/shifts/:shiftId/restore - Restaurar turno
router.patch(
  '/:shiftId/restore',
  shiftController.restoreShift.bind(shiftController)
);

// =====================
// Business Operations
// =====================

// GET /api/shifts/time-range/search - Buscar turnos por intervalo de tempo
router.get(
  '/time-range/search',
  shiftController.getShiftsByTimeRange.bind(shiftController)
);

export default router;
