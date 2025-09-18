import { z } from 'zod';

// Schema para criação de responsável
export const createResponsibleSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
  codeResponsible: z
    .string()
    .min(1, 'Código do responsável é obrigatório')
    .max(50, 'Código não pode ter mais de 50 caracteres')
    .trim()
    .regex(
      /^[A-Z0-9_-]+$/,
      'Código deve conter apenas letras maiúsculas, números, hífen e underscore'
    ),
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria deve ser um UUID válido')
    .optional(),
});

// Schema para atualização de responsável
export const updateResponsibleSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim()
    .optional(),
  codeResponsible: z
    .string()
    .min(1, 'Código do responsável é obrigatório')
    .max(50, 'Código não pode ter mais de 50 caracteres')
    .trim()
    .regex(
      /^[A-Z0-9_-]+$/,
      'Código deve conter apenas letras maiúsculas, números, hífen e underscore'
    )
    .optional(),
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria deve ser um UUID válido')
    .optional(),
});

// Schema para busca de responsáveis
export const searchResponsiblesSchema = z.object({
  page: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(val => !isNaN(val) && val > 0, 'Página deve ser um número positivo')
    .optional(),
  limit: z
    .string()
    .transform(val => parseInt(val, 10))
    .refine(
      val => !isNaN(val) && val > 0 && val <= 100,
      'Limit deve ser entre 1 e 100'
    )
    .optional(),
  search: z
    .string()
    .min(1, 'Termo de busca deve ter pelo menos 1 caractere')
    .max(100, 'Termo de busca não pode ter mais de 100 caracteres')
    .optional(),
  includeDeleted: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  includeCategory: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// Schema para busca por categoria
export const searchByCategorySchema = z.object({
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria deve ser um UUID válido'),
});

// Schema para busca por código
export const searchByCodeSchema = z.object({
  codeResponsible: z
    .string()
    .min(1, 'Código do responsável é obrigatório')
    .max(50, 'Código não pode ter mais de 50 caracteres')
    .trim(),
});

// Schema para busca por nome
export const searchByNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
});

// Schema para ID de responsável
export const responsibleIdSchema = z.object({
  id: z.string().uuid('ID do responsável deve ser um UUID válido'),
});

// Tipos inferidos dos schemas
export type CreateResponsibleRequest = z.infer<typeof createResponsibleSchema>;
export type UpdateResponsibleRequest = z.infer<typeof updateResponsibleSchema>;
export type SearchResponsiblesRequest = z.infer<
  typeof searchResponsiblesSchema
>;
export type SearchByCategoryRequest = z.infer<typeof searchByCategorySchema>;
export type SearchByCodeRequest = z.infer<typeof searchByCodeSchema>;
export type SearchByNameRequest = z.infer<typeof searchByNameSchema>;
export type ResponsibleIdRequest = z.infer<typeof responsibleIdSchema>;
