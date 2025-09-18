import { z } from 'zod';

const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;

function isValidCNPJ(cnpj: string): boolean {
  if (!cnpj) return false;

  const cleanCNPJ = cnpj.replace(/[^\d]/g, '');

  if (cleanCNPJ.length !== 14) {
    return false;
  }

  if (/^(\d)\1+$/.test(cleanCNPJ)) {
    return false;
  }

  let sum = 0;
  let weight = 5;

  for (let i = 0; i < 12; i++) {
    const digit = cleanCNPJ.charAt(i);
    if (!digit) return false;
    sum += parseInt(digit) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  const checkDigit1 = cleanCNPJ.charAt(12);
  if (!checkDigit1 || parseInt(checkDigit1) !== digit1) {
    return false;
  }

  sum = 0;
  weight = 6;

  for (let i = 0; i < 13; i++) {
    const digit = cleanCNPJ.charAt(i);
    if (!digit) return false;
    sum += parseInt(digit) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }

  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);

  const checkDigit2 = cleanCNPJ.charAt(13);
  return checkDigit2 ? parseInt(checkDigit2) === digit2 : false;
}

export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .trim(),

  cnpj: z
    .string()
    .regex(cnpjRegex, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .refine(isValidCNPJ, 'CNPJ inválido')
    .optional(),

  address: z
    .string()
    .max(255, 'Endereço não pode exceder 255 caracteres')
    .trim()
    .optional(),

  isActive: z.boolean().default(true).optional(),
});

export const createTenantWithAdminSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .trim(),

  cnpj: z
    .string()
    .regex(cnpjRegex, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .refine(isValidCNPJ, 'CNPJ inválido')
    .optional(),

  address: z
    .string()
    .max(255, 'Endereço não pode exceder 255 caracteres')
    .trim()
    .optional(),

  isActive: z.boolean().default(true).optional(),

  adminUser: z.object({
    name: z
      .string()
      .min(1, 'Nome do administrador não pode estar vazio')
      .max(100, 'Nome do administrador não pode exceder 100 caracteres')
      .trim(),

    email: z
      .string()
      .email('Email do administrador deve ser válido')
      .max(100, 'Email do administrador não pode exceder 100 caracteres')
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(6, 'Senha do administrador deve ter pelo menos 6 caracteres')
      .max(100, 'Senha do administrador não pode exceder 100 caracteres'),

    accessType: z
      .string()
      .toLowerCase()
      .refine(val => ['admin', 'user', 'root'].includes(val), {
        message: 'Invalid option: expected one of "admin"|"user"|"root"',
      })
      .default('admin')
      .optional(),
  }),
});

export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome não pode estar vazio')
    .max(100, 'Nome não pode exceder 100 caracteres')
    .trim()
    .optional(),

  cnpj: z
    .string()
    .regex(cnpjRegex, 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX')
    .refine(isValidCNPJ, 'CNPJ inválido')
    .optional(),

  address: z
    .string()
    .max(255, 'Endereço não pode exceder 255 caracteres')
    .trim()
    .optional(),

  isActive: z.boolean().optional(),
});

export const getTenantByIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

export const deleteTenantSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),

  permanent: z.boolean().default(false).optional(),
});

export const searchTenantsSchema = z.object({
  search: z.string().trim().optional(),

  isActive: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  includeDeleted: z
    .string()
    .transform(val => val === 'true')
    .optional(),

  page: z
    .string()
    .regex(/^\d+$/, 'Página deve ser um número')
    .transform(Number)
    .refine(val => val > 0, 'Página deve ser maior que 0')
    .optional(),

  limit: z
    .string()
    .regex(/^\d+$/, 'Limite deve ser um número')
    .transform(Number)
    .refine(val => val > 0 && val <= 100, 'Limite deve estar entre 1 e 100')
    .optional(),
});

export const tenantStatsSchema = z.object({
  includeDeleted: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

export type CreateTenantRequest = z.infer<typeof createTenantSchema>;
export type CreateTenantWithAdminRequest = z.infer<
  typeof createTenantWithAdminSchema
>;
export type UpdateTenantRequest = z.infer<typeof updateTenantSchema>;
export type GetTenantByIdRequest = z.infer<typeof getTenantByIdSchema>;
export type DeleteTenantRequest = z.infer<typeof deleteTenantSchema>;
export type SearchTenantsRequest = z.infer<typeof searchTenantsSchema>;
export type TenantStatsRequest = z.infer<typeof tenantStatsSchema>;
