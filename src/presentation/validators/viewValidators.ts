import { z } from 'zod';

// ===========================================
// VALIDADORES DE VIEWS
// ===========================================

export const createViewSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .trim(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const getViewsSchema = z.object({
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional(),
  isPublic: z.enum(['true', 'false']).optional(),
  isActive: z.enum(['true', 'false']).optional(),
  name: z.string().max(255, 'Nome não pode exceder 255 caracteres').optional(),
  page: z.string().regex(/^\d+$/, 'Página deve ser um número').optional(),
  limit: z.string().regex(/^\d+$/, 'Limite deve ser um número').optional(),
});

export const getViewByIdSchema = z.object({
  id: z.string().uuid('ID da view deve ser um UUID válido'),
  query: z
    .object({
      includeData: z.enum(['true', 'false']).optional(),
    })
    .optional(),
});

export const updateViewSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode exceder 255 caracteres')
    .trim()
    .optional(),
  isDefault: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const deleteViewSchema = z.object({
  id: z.string().uuid('ID da view deve ser um UUID válido'),
});

export const restoreViewSchema = z.object({
  id: z.string().uuid('ID da view deve ser um UUID válido'),
});

// ===========================================
// VALIDADORES DE CARDS
// ===========================================

export const addCardSchema = z.object({
  sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
  moduleId: z.string().uuid('ID do módulo deve ser um UUID válido'),
  machineId: z
    .string()
    .uuid('ID da máquina deve ser um UUID válido')
    .optional(),
  positionX: z.number().min(0, 'Posição X não pode ser negativa').optional(),
  positionY: z.number().min(0, 'Posição Y não pode ser negativa').optional(),
  width: z
    .number()
    .min(1, 'Largura deve ser pelo menos 1')
    .max(12, 'Largura não pode exceder 12')
    .optional(),
  height: z
    .number()
    .min(1, 'Altura deve ser pelo menos 1')
    .max(12, 'Altura não pode exceder 12')
    .optional(),
  chartType: z.enum(
    ['GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE'],
    'Tipo de gráfico inválido'
  ),
  title: z
    .string()
    .max(255, 'Título não pode exceder 255 caracteres')
    .trim()
    .optional(),
  sortOrder: z
    .number()
    .min(0, 'Ordem de classificação não pode ser negativa')
    .optional(),
});

export const updateCardSchema = z.object({
  positionX: z.number().min(0, 'Posição X não pode ser negativa').optional(),
  positionY: z.number().min(0, 'Posição Y não pode ser negativa').optional(),
  width: z
    .number()
    .min(1, 'Largura deve ser pelo menos 1')
    .max(12, 'Largura não pode exceder 12')
    .optional(),
  height: z
    .number()
    .min(1, 'Altura deve ser pelo menos 1')
    .max(12, 'Altura não pode exceder 12')
    .optional(),
  chartType: z
    .enum(
      ['GAUGE', 'LINE', 'BAR', 'ONOFF', 'STEP', 'PIE'],
      'Tipo de gráfico inválido'
    )
    .optional(),
  title: z
    .string()
    .max(255, 'Título não pode exceder 255 caracteres')
    .trim()
    .optional(),
  sortOrder: z
    .number()
    .min(0, 'Ordem de classificação não pode ser negativa')
    .optional(),
});

export const updateCardPositionsSchema = z.object({
  cards: z
    .array(
      z.object({
        id: z.string().uuid('ID do card deve ser um UUID válido'),
        positionX: z.number().min(0, 'Posição X não pode ser negativa'),
        positionY: z.number().min(0, 'Posição Y não pode ser negativa'),
        width: z
          .number()
          .min(1, 'Largura deve ser pelo menos 1')
          .max(12, 'Largura não pode exceder 12'),
        height: z
          .number()
          .min(1, 'Altura deve ser pelo menos 1')
          .max(12, 'Altura não pode exceder 12'),
      })
    )
    .min(1, 'Pelo menos um card deve ser fornecido')
    .max(100, 'Máximo de 100 cards por operação'),
});

export const deleteCardSchema = z.object({
  cardId: z.string().uuid('ID do card deve ser um UUID válido'),
});

// ===========================================
// EXPORT DOS VALIDADORES
// ===========================================

export const getByUserCompleteSchema = z.object({});

export const viewValidators = {
  createView: createViewSchema,
  getViews: getViewsSchema,
  getViewById: getViewByIdSchema,
  updateView: updateViewSchema,
  deleteView: deleteViewSchema,
  restoreView: restoreViewSchema,
  addCard: addCardSchema,
  updateCard: updateCardSchema,
  updateCardPositions: updateCardPositionsSchema,
  deleteCard: deleteCardSchema,
  getByUserComplete: getByUserCompleteSchema,
};
