import { Router } from 'express';

import { HelpCenterSearchController } from '../controllers/HelpCenterSearchController';
import { validateRequest } from '../middleware/validateRequest';
import {
  createHelpCenterSearchValidator,
  getPopularSearchesValidator,
  getRecentSearchesValidator,
  trackSearchValidator,
  userIdParamValidator,
  uuidParamValidator,
} from '../validators/helpCenterValidators';

const router = Router();

export const createHelpCenterSearchRoutes = (
  helpCenterSearchController: HelpCenterSearchController
) => {
  // Criar busca
  router.post(
    '/',
    createHelpCenterSearchValidator,
    validateRequest,
    helpCenterSearchController.createSearch.bind(helpCenterSearchController)
  );

  // Buscar histórico de buscas do usuário
  router.get(
    '/user/:user_id',
    userIdParamValidator,
    validateRequest,
    helpCenterSearchController.getUserSearches.bind(helpCenterSearchController)
  );

  // Buscar buscas populares
  router.get(
    '/popular',
    getPopularSearchesValidator,
    validateRequest,
    helpCenterSearchController.getPopularSearches.bind(
      helpCenterSearchController
    )
  );

  // Buscar buscas recentes do usuário
  router.get(
    '/user/:user_id/recent',
    getRecentSearchesValidator,
    validateRequest,
    helpCenterSearchController.getRecentSearches.bind(
      helpCenterSearchController
    )
  );

  // Excluir busca específica
  router.delete(
    '/:search_id',
    uuidParamValidator,
    validateRequest,
    helpCenterSearchController.deleteSearch.bind(helpCenterSearchController)
  );

  // Excluir todas as buscas do usuário
  router.delete(
    '/user/:user_id/all',
    userIdParamValidator,
    validateRequest,
    helpCenterSearchController.deleteUserSearches.bind(
      helpCenterSearchController
    )
  );

  // Rastrear busca
  router.post(
    '/track',
    trackSearchValidator,
    validateRequest,
    helpCenterSearchController.trackSearch.bind(helpCenterSearchController)
  );

  return router;
};
