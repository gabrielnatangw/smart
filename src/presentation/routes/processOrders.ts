import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ProcessOrderApplicationService } from '../../application/services/ProcessOrderApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaProcessOrderRepository } from '../../infrastructure/persistence/repositories/PrismaProcessOrderRepository';
import { ProcessOrderController } from '../controllers/ProcessOrderController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();

// Inicializar dependências
const prisma = new PrismaClient();
const processOrderRepository = new PrismaProcessOrderRepository(prisma);
const processOrderService = new ProcessOrderApplicationService(
  processOrderRepository
);
const processOrderController = new ProcessOrderController(processOrderService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all processOrder routes
router.use(authMiddleware.requireAuth);

// POST /api/process-orders - Criar ordem de processo
router.post('/', (req, res) =>
  processOrderController.createProcessOrder(req, res)
);

// GET /api/process-orders - Listar ordens de processo
router.get('/', (req, res) =>
  processOrderController.getAllProcessOrders(req, res)
);

// GET /api/process-orders/stats - Estatísticas de ordens de processo
router.get('/stats', (req, res) =>
  processOrderController.getProcessOrderStats(req, res)
);

// GET /api/process-orders/:id - Buscar ordem de processo por ID
router.get('/:id', (req, res) =>
  processOrderController.getProcessOrderById(req, res)
);

// GET /api/process-orders/product-order/:productOrderId - Buscar ordens de processo por ordem de produto
router.get('/product-order/:productOrderId', (req, res) =>
  processOrderController.getProcessOrdersByProductOrder(req, res)
);

// GET /api/process-orders/machine/:machineId - Buscar ordens de processo por máquina
router.get('/machine/:machineId', (req, res) =>
  processOrderController.getProcessOrdersByMachine(req, res)
);

// GET /api/process-orders/user/:userId - Buscar ordens de processo por usuário
router.get('/user/:userId', (req, res) =>
  processOrderController.getProcessOrdersByUser(req, res)
);

// PUT /api/process-orders/:id - Atualizar ordem de processo
router.put('/:id', (req, res) =>
  processOrderController.updateProcessOrder(req, res)
);

// DELETE /api/process-orders/:id - Excluir ordem de processo
router.delete('/:id', (req, res) =>
  processOrderController.deleteProcessOrder(req, res)
);

// PATCH /api/process-orders/:id/restore - Restaurar ordem de processo excluída
router.patch('/:id/restore', (req, res) =>
  processOrderController.restoreProcessOrder(req, res)
);

export default router;
