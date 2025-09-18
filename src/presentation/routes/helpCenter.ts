import { Router } from 'express';

import { HelpCenterSearchController } from '../controllers/HelpCenterSearchController';
import { HelpCenterThemeController } from '../controllers/HelpCenterThemeController';
import { HelpCenterUserViewController } from '../controllers/HelpCenterUserViewController';
import { HelpCenterVideoController } from '../controllers/HelpCenterVideoController';
import { createHelpCenterSearchRoutes } from './helpCenterSearches';
import { createHelpCenterThemeRoutes } from './helpCenterThemes';
import { createHelpCenterUserViewRoutes } from './helpCenterUserViews';
import { createHelpCenterVideoRoutes } from './helpCenterVideos';

const router = Router();

export const createHelpCenterRoutes = (
  helpCenterThemeController: HelpCenterThemeController,
  helpCenterVideoController: HelpCenterVideoController,
  helpCenterUserViewController: HelpCenterUserViewController,
  helpCenterSearchController: HelpCenterSearchController
) => {
  // Rotas dos temas
  router.use('/themes', createHelpCenterThemeRoutes(helpCenterThemeController));

  // Rotas dos vídeos
  router.use('/videos', createHelpCenterVideoRoutes(helpCenterVideoController));

  // Rotas das visualizações dos usuários
  router.use(
    '/user-views',
    createHelpCenterUserViewRoutes(helpCenterUserViewController)
  );

  // Rotas das buscas
  router.use(
    '/searches',
    createHelpCenterSearchRoutes(helpCenterSearchController)
  );

  return router;
};
