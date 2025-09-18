import { Router } from 'express';

import { HelpCenterThemeController } from '../controllers/HelpCenterThemeController';
import { validateRequest } from '../middleware/validateRequest';
import {
  applicationIdParamValidator,
  createHelpCenterThemeValidator,
  themeIdParamValidator,
  updateHelpCenterThemeValidator,
} from '../validators/helpCenterValidators';

const router = Router();

export const createHelpCenterThemeRoutes = (
  helpCenterThemeController: HelpCenterThemeController
) => {
  // Criar tema
  router.post(
    '/',
    createHelpCenterThemeValidator,
    validateRequest,
    helpCenterThemeController.createTheme.bind(helpCenterThemeController)
  );

  // Buscar tema por ID
  router.get(
    '/:theme_id',
    themeIdParamValidator,
    validateRequest,
    helpCenterThemeController.getThemeById.bind(helpCenterThemeController)
  );

  // Buscar todos os temas
  router.get(
    '/',
    helpCenterThemeController.getAllThemes.bind(helpCenterThemeController)
  );

  // Buscar temas por aplicação
  router.get(
    '/application/:application_id',
    applicationIdParamValidator,
    validateRequest,
    helpCenterThemeController.getThemesByApplication.bind(
      helpCenterThemeController
    )
  );

  // Buscar temas ativos
  router.get(
    '/active/all',
    helpCenterThemeController.getActiveThemes.bind(helpCenterThemeController)
  );

  // Atualizar tema
  router.put(
    '/:theme_id',
    updateHelpCenterThemeValidator,
    validateRequest,
    helpCenterThemeController.updateTheme.bind(helpCenterThemeController)
  );

  // Excluir tema
  router.delete(
    '/:theme_id',
    themeIdParamValidator,
    validateRequest,
    helpCenterThemeController.deleteTheme.bind(helpCenterThemeController)
  );

  // Adicionar aplicação ao tema
  router.post(
    '/:theme_id/applications',
    themeIdParamValidator,
    validateRequest,
    helpCenterThemeController.addApplicationToTheme.bind(
      helpCenterThemeController
    )
  );

  // Remover aplicação do tema
  router.delete(
    '/:theme_id/applications/:application_id',
    themeIdParamValidator,
    applicationIdParamValidator,
    validateRequest,
    helpCenterThemeController.removeApplicationFromTheme.bind(
      helpCenterThemeController
    )
  );

  // Buscar aplicações do tema
  router.get(
    '/:theme_id/applications',
    themeIdParamValidator,
    validateRequest,
    helpCenterThemeController.getThemeApplications.bind(
      helpCenterThemeController
    )
  );

  return router;
};
