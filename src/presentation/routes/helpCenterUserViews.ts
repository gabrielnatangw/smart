import { Router } from 'express';

import { HelpCenterUserViewController } from '../controllers/HelpCenterUserViewController';
import { validateRequest } from '../middleware/validateRequest';
import {
  createHelpCenterUserViewValidator,
  trackVideoProgressValidator,
  updateHelpCenterUserViewValidator,
  userIdParamValidator,
  uuidParamValidator,
  videoIdParamValidator,
} from '../validators/helpCenterValidators';

const router = Router();

export const createHelpCenterUserViewRoutes = (
  helpCenterUserViewController: HelpCenterUserViewController
) => {
  // Criar visualização
  router.post(
    '/',
    createHelpCenterUserViewValidator,
    validateRequest,
    helpCenterUserViewController.createUserView.bind(
      helpCenterUserViewController
    )
  );

  // Buscar visualizações por usuário
  router.get(
    '/user/:user_id',
    userIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getUserViews.bind(helpCenterUserViewController)
  );

  // Buscar visualizações por vídeo
  router.get(
    '/video/:video_id',
    videoIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getVideoViews.bind(
      helpCenterUserViewController
    )
  );

  // Buscar visualização específica do usuário e vídeo
  router.get(
    '/user/:user_id/video/:video_id',
    userIdParamValidator,
    videoIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getUserVideoView.bind(
      helpCenterUserViewController
    )
  );

  // Atualizar visualização
  router.put(
    '/:view_id',
    updateHelpCenterUserViewValidator,
    validateRequest,
    helpCenterUserViewController.updateUserView.bind(
      helpCenterUserViewController
    )
  );

  // Excluir visualização
  router.delete(
    '/:view_id',
    uuidParamValidator,
    validateRequest,
    helpCenterUserViewController.deleteUserView.bind(
      helpCenterUserViewController
    )
  );

  // Buscar contagem de visualizações do vídeo
  router.get(
    '/video/:video_id/count',
    videoIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getVideoViewCount.bind(
      helpCenterUserViewController
    )
  );

  // Buscar contagem de visualizações do usuário
  router.get(
    '/user/:user_id/count',
    userIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getUserViewCount.bind(
      helpCenterUserViewController
    )
  );

  // Buscar vídeos completados pelo usuário
  router.get(
    '/user/:user_id/completed',
    userIdParamValidator,
    validateRequest,
    helpCenterUserViewController.getCompletedVideosByUser.bind(
      helpCenterUserViewController
    )
  );

  // Rastrear progresso do vídeo
  router.post(
    '/track/:user_id/:video_id',
    trackVideoProgressValidator,
    validateRequest,
    helpCenterUserViewController.trackVideoProgress.bind(
      helpCenterUserViewController
    )
  );

  return router;
};
