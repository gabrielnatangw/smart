import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { ProductOrderApplicationService } from '../../application/services/ProductOrderApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaProductOrderRepository } from '../../infrastructure/persistence/repositories/PrismaProductOrderRepository';
import { ProductOrderController } from '../controllers/ProductOrderController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();

// Inicializar dependências
const prisma = new PrismaClient();
const productOrderRepository = new PrismaProductOrderRepository(prisma);
const productOrderService = new ProductOrderApplicationService(
  productOrderRepository
);
const productOrderController = new ProductOrderController(productOrderService);

// Initialize authentication middleware
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication middleware to all productOrder routes
router.use(authMiddleware.requireAuth);

// POST /api/product-orders - Criar ordem de produto
router.post('/', (req, res) =>
  productOrderController.createProductOrder(req, res)
);

// GET /api/product-orders - Listar ordens de produto
router.get('/', (req, res) =>
  productOrderController.getAllProductOrders(req, res)
);

// GET /api/product-orders/stats - Estatísticas de ordens de produto
router.get('/stats', (req, res) =>
  productOrderController.getProductOrderStats(req, res)
);

// GET /api/product-orders/:id - Buscar ordem de produto por ID
router.get('/:id', (req, res) =>
  productOrderController.getProductOrderById(req, res)
);

// PUT /api/product-orders/:id - Atualizar ordem de produto
router.put('/:id', (req, res) =>
  productOrderController.updateProductOrder(req, res)
);

// DELETE /api/product-orders/:id - Excluir ordem de produto
router.delete('/:id', (req, res) =>
  productOrderController.deleteProductOrder(req, res)
);

// PATCH /api/product-orders/:id/restore - Restaurar ordem de produto excluída
router.patch('/:id/restore', (req, res) =>
  productOrderController.restoreProductOrder(req, res)
);

export default router;
