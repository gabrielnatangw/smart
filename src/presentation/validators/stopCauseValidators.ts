import { z } from 'zod';

// Schemas de validação para requests
export const createStopCauseSchema = z.object({
  body: z.object({
    description: z
      .string()
      .min(1, 'Descrição da causa de parada é obrigatória')
      .max(
        255,
        'Descrição da causa de parada não pode ter mais de 255 caracteres'
      )
      .trim(),
    parentId: z.string().uuid('ID do pai deve ser um UUID válido').optional(),
  }),
});

export const updateStopCauseSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
  body: z.object({
    description: z
      .string()
      .min(1, 'Descrição da causa de parada é obrigatória')
      .max(
        255,
        'Descrição da causa de parada não pode ter mais de 255 caracteres'
      )
      .trim()
      .optional(),
    parentId: z.string().uuid('ID do pai deve ser um UUID válido').optional(),
  }),
});

export const getStopCauseByIdSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const getAllStopCausesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 1))
      .refine(val => val > 0, 'Página deve ser maior que 0'),
    limit: z
      .string()
      .optional()
      .transform(val => (val ? parseInt(val, 10) : 10))
      .refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100'),
    search: z.string().optional(),
    includeDeleted: z
      .string()
      .optional()
      .transform(val => val === 'true'),
    includeHierarchy: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  }),
});

export const deleteStopCauseSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const restoreStopCauseSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const getHierarchySchema = z.object({
  query: z.object({
    includeDeleted: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  }),
});

export const moveStopCauseSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
  body: z.object({
    newParentId: z
      .string()
      .uuid('ID do novo pai deve ser um UUID válido')
      .optional(),
  }),
});

export const getRootStopCausesSchema = z.object({
  query: z.object({
    includeDeleted: z
      .string()
      .optional()
      .transform(val => val === 'true'),
  }),
});

export const getChildrenSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const getParentSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const getAncestorsSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const getDescendantsSchema = z.object({
  params: z.object({
    stopCauseId: z
      .string()
      .uuid('ID da causa de parada deve ser um UUID válido'),
  }),
});

export const findStopCausesByLevelSchema = z.object({
  query: z.object({
    level: z
      .string()
      .min(1, 'Nível é obrigatório')
      .transform(val => parseInt(val, 10))
      .refine(val => val >= 0, 'Nível deve ser maior ou igual a 0'),
  }),
});

export const findStopCausesByDescriptionSchema = z.object({
  query: z.object({
    description: z
      .string()
      .min(1, 'Descrição é obrigatória')
      .max(255, 'Descrição não pode ter mais de 255 caracteres'),
  }),
});

export const getStatisticsSchema = z.object({});

// Tipos TypeScript
export type CreateStopCauseRequest = z.infer<
  typeof createStopCauseSchema
>['body'];
export type UpdateStopCauseRequest = z.infer<
  typeof updateStopCauseSchema
>['body'];
export type GetStopCauseByIdRequest = z.infer<
  typeof getStopCauseByIdSchema
>['params'];
export type GetAllStopCausesRequest = z.infer<
  typeof getAllStopCausesSchema
>['query'];
export type DeleteStopCauseRequest = z.infer<
  typeof deleteStopCauseSchema
>['params'];
export type RestoreStopCauseRequest = z.infer<
  typeof restoreStopCauseSchema
>['params'];
export type GetHierarchyRequest = z.infer<typeof getHierarchySchema>['query'];
export type MoveStopCauseRequest = z.infer<typeof moveStopCauseSchema>['body'];
export type GetRootStopCausesRequest = z.infer<
  typeof getRootStopCausesSchema
>['query'];
export type GetChildrenRequest = z.infer<typeof getChildrenSchema>['params'];
export type GetParentRequest = z.infer<typeof getParentSchema>['params'];
export type GetAncestorsRequest = z.infer<typeof getAncestorsSchema>['params'];
export type GetDescendantsRequest = z.infer<
  typeof getDescendantsSchema
>['params'];
export type FindStopCausesByLevelRequest = z.infer<
  typeof findStopCausesByLevelSchema
>['query'];
export type FindStopCausesByDescriptionRequest = z.infer<
  typeof findStopCausesByDescriptionSchema
>['query'];
