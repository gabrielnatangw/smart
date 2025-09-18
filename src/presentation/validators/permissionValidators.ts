import { z } from 'zod';

// Create Permission Schema
export const createPermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .regex(
      /^[a-z0-9_-]+$/,
      'Nome deve conter apenas letras minúsculas, números, hífen e underscore'
    ),
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres'),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional(),
  module: z
    .string()
    .min(1, 'Módulo é obrigatório')
    .max(100, 'Módulo não pode ter mais de 100 caracteres'),
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Update Permission Schema
export const updatePermissionSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .regex(
      /^[a-z0-9_-]+$/,
      'Nome deve conter apenas letras minúsculas, números, hífen e underscore'
    )
    .optional(),
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição não pode ter mais de 500 caracteres')
    .optional(),
  module: z
    .string()
    .min(1, 'Módulo é obrigatório')
    .max(100, 'Módulo não pode ter mais de 100 caracteres')
    .optional(),
});

// Search Permissions Schema
export const searchPermissionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  module: z.string().optional(),
  applicationId: z.string().uuid().optional(),
  sortBy: z
    .enum(['created_at', 'name', 'displayName', 'module'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get by ID Schema
export const getPermissionByIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Delete/Restore Schema
export const permissionIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Get by Name Schema
export const getByNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
});

// Get by Display Name Schema
export const getByDisplayNameSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(200, 'Nome de exibição não pode ter mais de 200 caracteres'),
});

// Get by Module Schema
export const getByModuleSchema = z.object({
  module: z
    .string()
    .min(1, 'Módulo é obrigatório')
    .max(100, 'Módulo não pode ter mais de 100 caracteres'),
});

// Get by Application ID Schema
export const getByApplicationIdSchema = z.object({
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Get by Name and Application Schema
export const getByNameAndApplicationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome não pode ter mais de 100 caracteres'),
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});
