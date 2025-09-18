import { z } from 'zod';

// Schemas de validação para requests
export const createCategoriesResponsibleSchema = z.object({
  body: z.object({
    categoryResponsible: z
      .string()
      .min(1, 'Categoria de responsável é obrigatória')
      .max(255, 'Categoria de responsável não pode ter mais de 255 caracteres')
      .trim(),
  }),
});

export const updateCategoriesResponsibleSchema = z.object({
  params: z.object({
    categoryResponsibleId: z
      .string()
      .uuid('ID da categoria de responsável deve ser um UUID válido'),
  }),
  body: z.object({
    categoryResponsible: z
      .string()
      .min(1, 'Categoria de responsável é obrigatória')
      .max(255, 'Categoria de responsável não pode ter mais de 255 caracteres')
      .trim()
      .optional(),
  }),
});

export const getCategoriesResponsibleByIdSchema = z.object({
  params: z.object({
    categoryResponsibleId: z
      .string()
      .uuid('ID da categoria de responsável deve ser um UUID válido'),
  }),
});

export const getAllCategoriesResponsibleSchema = z.object({
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
  }),
});

export const deleteCategoriesResponsibleSchema = z.object({
  params: z.object({
    categoryResponsibleId: z
      .string()
      .uuid('ID da categoria de responsável deve ser um UUID válido'),
  }),
});

export const restoreCategoriesResponsibleSchema = z.object({
  params: z.object({
    categoryResponsibleId: z
      .string()
      .uuid('ID da categoria de responsável deve ser um UUID válido'),
  }),
});

export const findCategoriesResponsibleByNameSchema = z.object({
  query: z.object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório')
      .max(255, 'Nome não pode ter mais de 255 caracteres'),
  }),
});

export const getStatisticsSchema = z.object({});

// Tipos TypeScript
export type CreateCategoriesResponsibleRequest = z.infer<
  typeof createCategoriesResponsibleSchema
>['body'];
export type UpdateCategoriesResponsibleRequest = z.infer<
  typeof updateCategoriesResponsibleSchema
>['body'];
export type GetCategoriesResponsibleByIdRequest = z.infer<
  typeof getCategoriesResponsibleByIdSchema
>['params'];
export type GetAllCategoriesResponsibleRequest = z.infer<
  typeof getAllCategoriesResponsibleSchema
>['query'];
export type DeleteCategoriesResponsibleRequest = z.infer<
  typeof deleteCategoriesResponsibleSchema
>['params'];
export type RestoreCategoriesResponsibleRequest = z.infer<
  typeof restoreCategoriesResponsibleSchema
>['params'];
export type FindCategoriesResponsibleByNameRequest = z.infer<
  typeof findCategoriesResponsibleByNameSchema
>['query'];
