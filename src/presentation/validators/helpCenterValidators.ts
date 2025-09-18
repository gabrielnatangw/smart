import { body, param, query } from 'express-validator';

export const createHelpCenterThemeValidator = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),

  body('icon_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Nome do ícone deve ter no máximo 50 caracteres'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo'),

  body('application_ids')
    .optional()
    .isArray()
    .withMessage('IDs das aplicações devem ser um array'),

  body('application_ids.*')
    .optional()
    .isUUID()
    .withMessage('Cada ID de aplicação deve ser um UUID válido'),
];

export const updateHelpCenterThemeValidator = [
  param('theme_id').isUUID().withMessage('ID do tema deve ser um UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 100 })
    .withMessage('Título deve ter entre 3 e 100 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres'),

  body('icon_name')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Nome do ícone deve ter no máximo 50 caracteres'),

  body('color')
    .optional()
    .matches(/^#[0-9A-Fa-f]{6}$/)
    .withMessage('Cor deve estar no formato hexadecimal (#RRGGBB)'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano'),

  body('application_ids')
    .optional()
    .isArray()
    .withMessage('IDs das aplicações devem ser um array'),

  body('application_ids.*')
    .optional()
    .isUUID()
    .withMessage('Cada ID de aplicação deve ser um UUID válido'),
];

export const createHelpCenterVideoValidator = [
  body('title')
    .notEmpty()
    .withMessage('Título é obrigatório')
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('video_platform')
    .notEmpty()
    .withMessage('Plataforma de vídeo é obrigatória')
    .isIn(['YOUTUBE', 'VIMEO', 'DAILYMOTION', 'CUSTOM'])
    .withMessage(
      'Plataforma de vídeo deve ser YOUTUBE, VIMEO, DAILYMOTION ou CUSTOM'
    ),

  body('external_video_id')
    .notEmpty()
    .withMessage('ID externo do vídeo é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('ID externo do vídeo deve ter entre 1 e 100 caracteres'),

  body('external_url')
    .notEmpty()
    .withMessage('URL externa é obrigatória')
    .isURL()
    .withMessage('URL externa deve ser uma URL válida'),

  body('thumbnail_url')
    .optional()
    .isURL()
    .withMessage('URL da thumbnail deve ser uma URL válida'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duração deve ser um número inteiro positivo'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('Destaque deve ser um booleano'),

  body('theme_id')
    .notEmpty()
    .withMessage('ID do tema é obrigatório')
    .isUUID()
    .withMessage('ID do tema deve ser um UUID válido'),

  body('application_ids')
    .optional()
    .isArray()
    .withMessage('IDs das aplicações devem ser um array'),

  body('application_ids.*')
    .optional()
    .isUUID()
    .withMessage('Cada ID de aplicação deve ser um UUID válido'),
];

export const updateHelpCenterVideoValidator = [
  param('video_id').isUUID().withMessage('ID do vídeo deve ser um UUID válido'),

  body('title')
    .optional()
    .isLength({ min: 3, max: 200 })
    .withMessage('Título deve ter entre 3 e 200 caracteres'),

  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),

  body('video_platform')
    .optional()
    .isIn(['YOUTUBE', 'VIMEO', 'DAILYMOTION', 'CUSTOM'])
    .withMessage(
      'Plataforma de vídeo deve ser YOUTUBE, VIMEO, DAILYMOTION ou CUSTOM'
    ),

  body('external_video_id')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('ID externo do vídeo deve ter entre 1 e 100 caracteres'),

  body('external_url')
    .optional()
    .isURL()
    .withMessage('URL externa deve ser uma URL válida'),

  body('thumbnail_url')
    .optional()
    .isURL()
    .withMessage('URL da thumbnail deve ser uma URL válida'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duração deve ser um número inteiro positivo'),

  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Ordem deve ser um número inteiro positivo'),

  body('is_active')
    .optional()
    .isBoolean()
    .withMessage('Status ativo deve ser um booleano'),

  body('is_featured')
    .optional()
    .isBoolean()
    .withMessage('Destaque deve ser um booleano'),

  body('application_ids')
    .optional()
    .isArray()
    .withMessage('IDs das aplicações devem ser um array'),

  body('application_ids.*')
    .optional()
    .isUUID()
    .withMessage('Cada ID de aplicação deve ser um UUID válido'),
];

export const createHelpCenterUserViewValidator = [
  body('user_id')
    .notEmpty()
    .withMessage('ID do usuário é obrigatório')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),

  body('video_id')
    .notEmpty()
    .withMessage('ID do vídeo é obrigatório')
    .isUUID()
    .withMessage('ID do vídeo deve ser um UUID válido'),

  body('watch_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duração assistida deve ser um número inteiro positivo'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Concluído deve ser um booleano'),
];

export const updateHelpCenterUserViewValidator = [
  param('view_id')
    .isUUID()
    .withMessage('ID da visualização deve ser um UUID válido'),

  body('watch_duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Duração assistida deve ser um número inteiro positivo'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Concluído deve ser um booleano'),
];

export const createHelpCenterSearchValidator = [
  body('search_term')
    .notEmpty()
    .withMessage('Termo de busca é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  body('results_count')
    .notEmpty()
    .withMessage('Contagem de resultados é obrigatória')
    .isInt({ min: 0 })
    .withMessage('Contagem de resultados deve ser um número inteiro positivo'),

  body('user_id')
    .optional()
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),
];

export const trackVideoProgressValidator = [
  param('user_id')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),

  param('video_id').isUUID().withMessage('ID do vídeo deve ser um UUID válido'),

  body('watch_duration')
    .notEmpty()
    .withMessage('Duração assistida é obrigatória')
    .isInt({ min: 0 })
    .withMessage('Duração assistida deve ser um número inteiro positivo'),

  body('completed')
    .optional()
    .isBoolean()
    .withMessage('Concluído deve ser um booleano'),
];

export const searchVideosValidator = [
  query('q')
    .notEmpty()
    .withMessage('Termo de busca é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),
];

export const getPopularSearchesValidator = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
];

export const getRecentSearchesValidator = [
  param('user_id')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser um número inteiro entre 1 e 100'),
];

export const trackSearchValidator = [
  body('search_term')
    .notEmpty()
    .withMessage('Termo de busca é obrigatório')
    .isLength({ min: 1, max: 100 })
    .withMessage('Termo de busca deve ter entre 1 e 100 caracteres'),

  body('results_count')
    .notEmpty()
    .withMessage('Contagem de resultados é obrigatória')
    .isInt({ min: 0 })
    .withMessage('Contagem de resultados deve ser um número inteiro positivo'),

  body('user_id')
    .optional()
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),
];

export const uuidParamValidator = [
  param('id').isUUID().withMessage('ID deve ser um UUID válido'),
];

export const applicationIdParamValidator = [
  param('application_id')
    .isUUID()
    .withMessage('ID da aplicação deve ser um UUID válido'),
];

export const themeIdParamValidator = [
  param('theme_id').isUUID().withMessage('ID do tema deve ser um UUID válido'),
];

export const videoIdParamValidator = [
  param('video_id').isUUID().withMessage('ID do vídeo deve ser um UUID válido'),
];

export const userIdParamValidator = [
  param('user_id')
    .isUUID()
    .withMessage('ID do usuário deve ser um UUID válido'),
];

export const platformParamValidator = [
  param('platform')
    .isIn(['YOUTUBE', 'VIMEO', 'DAILYMOTION', 'CUSTOM'])
    .withMessage('Plataforma deve ser YOUTUBE, VIMEO, DAILYMOTION ou CUSTOM'),
];
