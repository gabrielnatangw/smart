import { z } from 'zod';

// Create Tenant Subscription Schema
export const createTenantSubscriptionSchema = z.object({
  isActive: z.boolean().optional().default(true),
  subscriptionPlan: z
    .string()
    .min(1, 'Plano de assinatura é obrigatório')
    .max(50, 'Plano de assinatura não pode ter mais de 50 caracteres'),
  maxUsers: z
    .number()
    .int()
    .positive('Número máximo de usuários deve ser positivo')
    .optional(),
  expiresAt: z.date().optional(),
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Update Tenant Subscription Schema
export const updateTenantSubscriptionSchema = z.object({
  isActive: z.boolean().optional(),
  subscriptionPlan: z
    .string()
    .min(1, 'Plano de assinatura é obrigatório')
    .max(50, 'Plano de assinatura não pode ter mais de 50 caracteres')
    .optional(),
  maxUsers: z
    .number()
    .int()
    .positive('Número máximo de usuários deve ser positivo')
    .optional(),
  expiresAt: z.date().optional(),
});

// Search Tenant Subscriptions Schema
export const searchTenantSubscriptionsSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  subscriptionPlan: z.string().optional(),
  tenantId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  expiresBefore: z.coerce.date().optional(),
  expiresAfter: z.coerce.date().optional(),
  sortBy: z
    .enum(['created_at', 'subscriptionPlan', 'isActive', 'expiresAt'])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// Get by ID Schema
export const getTenantSubscriptionByIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Delete/Restore Schema
export const tenantSubscriptionIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Get by Tenant ID Schema
export const getByTenantIdSchema = z.object({
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
});

// Get by Application ID Schema
export const getByApplicationIdSchema = z.object({
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Get by Tenant and Application Schema
export const getByTenantAndApplicationSchema = z.object({
  tenantId: z.string().uuid('ID do tenant deve ser um UUID válido'),
  applicationId: z.string().uuid('ID da aplicação deve ser um UUID válido'),
});

// Get by Subscription Plan Schema
export const getBySubscriptionPlanSchema = z.object({
  plan: z
    .string()
    .min(1, 'Plano é obrigatório')
    .max(50, 'Plano não pode ter mais de 50 caracteres'),
});

// Get Expiring Subscriptions Schema
export const getExpiringSubscriptionsSchema = z.object({
  days: z.coerce
    .number()
    .int()
    .positive('Número de dias deve ser positivo')
    .optional()
    .default(30),
});
