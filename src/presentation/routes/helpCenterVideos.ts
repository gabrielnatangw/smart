import { Router } from 'express';

import { HelpCenterVideoController } from '../controllers/HelpCenterVideoController';
import { validateRequest } from '../middleware/validateRequest';
import {
  applicationIdParamValidator,
  createHelpCenterVideoValidator,
  platformParamValidator,
  searchVideosValidator,
  themeIdParamValidator,
  updateHelpCenterVideoValidator,
  videoIdParamValidator,
} from '../validators/helpCenterValidators';

const router = Router();

export const createHelpCenterVideoRoutes = (
  helpCenterVideoController: HelpCenterVideoController
) => {
  // Criar vídeo
  router.post(
    '/',
    createHelpCenterVideoValidator,
    validateRequest,
    helpCenterVideoController.createVideo.bind(helpCenterVideoController)
  );

  // Buscar vídeo por ID
  router.get(
    '/:video_id',
    videoIdParamValidator,
    validateRequest,
    helpCenterVideoController.getVideoById.bind(helpCenterVideoController)
  );

  // Buscar vídeos por tema
  router.get(
    '/theme/:theme_id',
    themeIdParamValidator,
    validateRequest,
    helpCenterVideoController.getVideosByTheme.bind(helpCenterVideoController)
  );

  // Buscar vídeos por aplicação
  router.get(
    '/application/:application_id',
    applicationIdParamValidator,
    validateRequest,
    helpCenterVideoController.getVideosByApplication.bind(
      helpCenterVideoController
    )
  );

  // Buscar vídeos por tema e aplicação
  router.get(
    '/theme/:theme_id/application/:application_id',
    themeIdParamValidator,
    applicationIdParamValidator,
    validateRequest,
    helpCenterVideoController.getVideosByThemeAndApplication.bind(
      helpCenterVideoController
    )
  );

  // Buscar vídeos ativos
  router.get(
    '/active/all',
    helpCenterVideoController.getActiveVideos.bind(helpCenterVideoController)
  );

  // Buscar vídeos em destaque
  router.get(
    '/featured/all',
    helpCenterVideoController.getFeaturedVideos.bind(helpCenterVideoController)
  );

  // Buscar vídeos por plataforma
  router.get(
    '/platform/:platform',
    platformParamValidator,
    validateRequest,
    helpCenterVideoController.getVideosByPlatform.bind(
      helpCenterVideoController
    )
  );

  // Buscar vídeos (search)
  router.get(
    '/search',
    searchVideosValidator,
    validateRequest,
    helpCenterVideoController.searchVideos.bind(helpCenterVideoController)
  );

  // Atualizar vídeo
  router.put(
    '/:video_id',
    updateHelpCenterVideoValidator,
    validateRequest,
    helpCenterVideoController.updateVideo.bind(helpCenterVideoController)
  );

  // Excluir vídeo
  router.delete(
    '/:video_id',
    videoIdParamValidator,
    validateRequest,
    helpCenterVideoController.deleteVideo.bind(helpCenterVideoController)
  );

  // Adicionar aplicação ao vídeo
  router.post(
    '/:video_id/applications',
    videoIdParamValidator,
    validateRequest,
    helpCenterVideoController.addApplicationToVideo.bind(
      helpCenterVideoController
    )
  );

  // Remover aplicação do vídeo
  router.delete(
    '/:video_id/applications/:application_id',
    videoIdParamValidator,
    applicationIdParamValidator,
    validateRequest,
    helpCenterVideoController.removeApplicationFromVideo.bind(
      helpCenterVideoController
    )
  );

  // Buscar aplicações do vídeo
  router.get(
    '/:video_id/applications',
    videoIdParamValidator,
    validateRequest,
    helpCenterVideoController.getVideoApplications.bind(
      helpCenterVideoController
    )
  );

  return router;
};
