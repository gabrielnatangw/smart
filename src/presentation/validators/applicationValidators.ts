import { z } from 'zod';

// Schema para criação de aplicação
export const createApplicationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim()
    .regex(
      /^[a-z0-9_-]+$/,
      'Nome deve conter apenas letras minúsculas, números, hífen e underscore'
    ),
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres')
    .trim(),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .trim()
    .optional(),
  isActive: z.boolean().optional().default(true),
});

// Schema para atualização de aplicação
export const updateApplicationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim()
    .regex(
      /^[a-z0-9_-]+$/,
      'Nome deve conter apenas letras minúsculas, números, hífen e underscore'
    )
    .optional(),
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres')
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
});

// Schema para busca de aplicações
export const searchApplicationsSchema = z.object({
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
  isActive: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// Schema para busca por nome
export const searchByNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .trim(),
});

// Schema para busca por nome de exibição
export const searchByDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres')
    .trim(),
});

// Schema para ID de aplicação
export const applicationIdSchema = z.object({
  id: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Tipos inferidos dos schemas
export type CreateApplicationRequest = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationRequest = z.infer<typeof updateApplicationSchema>;
export type SearchApplicationsRequest = z.infer<
  typeof searchApplicationsSchema
>;
export type SearchByNameRequest = z.infer<typeof searchByNameSchema>;
export type SearchByDisplayNameRequest = z.infer<
  typeof searchByDisplayNameSchema
>;
export type ApplicationIdRequest = z.infer<typeof applicationIdSchema>;
