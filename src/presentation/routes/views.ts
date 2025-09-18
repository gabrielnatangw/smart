import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { SensorDataController } from '../controllers/SensorDataController';
import { ViewController } from '../controllers/ViewController';
import {
  AuthenticatedRequest,
  AuthenticationMiddleware,
} from '../middleware/authenticationMiddleware';
import { tenantIsolationMiddleware } from '../middleware/tenantMiddleware';
import {
  validateRequest,
  validateRequestParams,
  validateRequestQuery,
} from '../middleware/validateRequest';
import { sensorDataValidators } from '../validators/sensorDataValidators';
import { viewValidators } from '../validators/viewValidators';

const router = Router();

// Injeção de dependências (será configurada no app.ts)
let viewController: ViewController;
let sensorDataController: SensorDataController;

export const setViewControllers = (
  viewCtrl: ViewController,
  sensorDataCtrl: SensorDataController
) => {
  viewController = viewCtrl;
  sensorDataController = sensorDataCtrl;
};

// Initialize authentication middleware
const prisma = new PrismaClient();
const authRepository = new PrismaAuthenticationRepository(prisma);
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Middleware de autenticação e tenant para todas as rotas
router.use(authMiddleware.requireAuth);
router.use(tenantIsolationMiddleware);

// ===========================================
// ROTAS DE VIEWS
// ===========================================

// POST /api/views - Criar nova view
router.post('/', validateRequest(viewValidators.createView), (req, res) =>
  viewController.create(req, res)
);

// GET /api/views - Listar views do tenant
router.get(
  '/',
  validateRequestQuery(viewValidators.getViews),
  (req: AuthenticatedRequest, res) => {
    console.log('🔍 [DEBUG] GET /api/views: Query:', req.query);
    console.log('🔍 [DEBUG] GET /api/views: User:', {
      userId: req.user?.userId,
      tenantId: req.user?.tenantId,
      email: req.user?.email,
      userType: req.user?.userType,
    });
    return viewController.getByTenant(req, res);
  }
);

// GET /api/views/my - Listar views do usuário
router.get('/my', (req, res) => viewController.getByUser(req, res));

// GET /api/views/my/complete - Listar views do usuário com cards
router.get('/my/complete', (req, res) =>
  viewController.getByUserComplete(req, res)
);

// GET /api/views/stats - Estatísticas das views
router.get('/stats', (req, res) => viewController.getStats(req, res));

// GET /api/views/:id - Buscar view por ID
router.get(
  '/:id',
  validateRequestParams(viewValidators.getViewById),
  (req, res) => viewController.getById(req, res)
);

// PUT /api/views/:id - Atualizar view
router.put('/:id', validateRequest(viewValidators.updateView), (req, res) =>
  viewController.update(req, res)
);

// DELETE /api/views/:id - Excluir view
router.delete(
  '/:id',
  validateRequestParams(viewValidators.deleteView),
  (req, res) => viewController.delete(req, res)
);

// POST /api/views/:id/restore - Restaurar view
router.post(
  '/:id/restore',
  validateRequest(viewValidators.restoreView),
  (req, res) => viewController.restore(req, res)
);

// ===========================================
// ROTAS DE CARDS
// ===========================================

// POST /api/views/:viewId/cards - Adicionar card à view
router.post(
  '/:viewId/cards',
  validateRequest(viewValidators.addCard),
  (req, res) => viewController.addCard(req, res)
);

// PUT /api/views/cards/positions - Atualizar posições dos cards (DEVE VIR PRIMEIRO)
router.put(
  '/cards/positions',
  validateRequest(viewValidators.updateCardPositions),
  (req, res) => viewController.updateCardPositions(req, res)
);

// PUT /api/views/cards/:cardId - Atualizar card (DEVE VIR DEPOIS)
router.put(
  '/cards/:cardId',
  validateRequest(viewValidators.updateCard),
  (req, res) => viewController.updateCard(req, res)
);

// DELETE /api/views/cards/:cardId - Excluir card
router.delete(
  '/cards/:cardId',
  validateRequestParams(viewValidators.deleteCard),
  (req, res) => viewController.deleteCard(req, res)
);

// ===========================================
// ROTAS DE DADOS DE SENSORES
// ===========================================

// POST /api/views/sensor-data - Criar dados do sensor
router.post(
  '/sensor-data',
  validateRequest(sensorDataValidators.createData),
  (req, res) => sensorDataController.createData(req, res)
);

// GET /api/views/sensor-data/:sensorId - Buscar dados do sensor
router.get(
  '/sensor-data/:sensorId',
  validateRequest(sensorDataValidators.getData),
  (req, res) => sensorDataController.getData(req, res)
);

// GET /api/views/sensor-data/:sensorId/latest - Buscar dados mais recentes
router.get(
  '/sensor-data/:sensorId/latest',
  validateRequest(sensorDataValidators.getLatestData),
  (req, res) => sensorDataController.getLatestData(req, res)
);

// GET /api/views/sensor-data/:sensorId/current - Buscar valor atual
router.get(
  '/sensor-data/:sensorId/current',
  validateRequest(sensorDataValidators.getCurrentValue),
  (req, res) => sensorDataController.getCurrentValue(req, res)
);

// PUT /api/views/sensor-data/:sensorId/current - Atualizar valor atual
router.put(
  '/sensor-data/:sensorId/current',
  validateRequest(sensorDataValidators.updateCurrentValue),
  (req, res) => sensorDataController.updateCurrentValue(req, res)
);

// GET /api/views/sensor-data/current - Buscar todos os valores atuais
router.get(
  '/sensor-data/current',
  validateRequest(sensorDataValidators.getCurrentValues),
  (req, res) => sensorDataController.getCurrentValues(req, res)
);

// GET /api/views/sensor-data/stats - Estatísticas dos dados
router.get(
  '/sensor-data/stats',
  validateRequest(sensorDataValidators.getStats),
  (req, res) => sensorDataController.getStats(req, res)
);

// DELETE /api/views/sensor-data/cleanup - Limpar dados antigos
router.delete(
  '/sensor-data/cleanup',
  validateRequest(sensorDataValidators.deleteOldData),
  (req, res) => sensorDataController.deleteOldData(req, res)
);

export default router;
