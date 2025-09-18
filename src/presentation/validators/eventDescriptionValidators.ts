import { z } from 'zod';

// Schema para criação de descrição de evento
export const createEventDescriptionSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim(),
  message: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(1000, 'Mensagem não pode ter mais de 1000 caracteres')
    .trim(),
  app: z
    .string()
    .min(1, 'Aplicação é obrigatória')
    .max(100, 'Aplicação não pode ter mais de 100 caracteres')
    .trim(),
  viewed: z.boolean().optional().default(false),
  jobRunDataId: z
    .string()
    .min(1, 'Job Run Data ID deve ter pelo menos 1 caractere')
    .max(100, 'Job Run Data ID não pode ter mais de 100 caracteres')
    .optional(),
  stopCauseId: z
    .string()
    .uuid('ID da stop cause deve ser um UUID válido')
    .optional(),
  sensorId: z.string().uuid('ID do sensor deve ser um UUID válido').optional(),
  responsibleId: z
    .string()
    .uuid('ID do responsável deve ser um UUID válido')
    .optional(),
  processOrderId: z
    .string()
    .uuid('ID da ordem de processo deve ser um UUID válido'),
});

// Schema para atualização de descrição de evento
export const updateEventDescriptionSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode ter mais de 200 caracteres')
    .trim()
    .optional(),
  message: z
    .string()
    .min(1, 'Mensagem é obrigatória')
    .max(1000, 'Mensagem não pode ter mais de 1000 caracteres')
    .trim()
    .optional(),
  app: z
    .string()
    .min(1, 'Aplicação é obrigatória')
    .max(100, 'Aplicação não pode ter mais de 100 caracteres')
    .trim()
    .optional(),
  viewed: z.boolean().optional(),
  jobRunDataId: z
    .string()
    .min(1, 'Job Run Data ID deve ter pelo menos 1 caractere')
    .max(100, 'Job Run Data ID não pode ter mais de 100 caracteres')
    .optional(),
  stopCauseId: z
    .string()
    .uuid('ID da stop cause deve ser um UUID válido')
    .optional(),
  sensorId: z.string().uuid('ID do sensor deve ser um UUID válido').optional(),
  responsibleId: z
    .string()
    .uuid('ID do responsável deve ser um UUID válido')
    .optional(),
  processOrderId: z
    .string()
    .uuid('ID da ordem de processo deve ser um UUID válido')
    .optional(),
});

// Schema para busca de descrições de eventos
export const searchEventDescriptionsSchema = z.object({
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
  app: z
    .string()
    .min(1, 'Aplicação deve ter pelo menos 1 caractere')
    .max(100, 'Aplicação não pode ter mais de 100 caracteres')
    .optional(),
  viewed: z
    .string()
    .transform(val => val === 'true')
    .optional(),
  stopCauseId: z
    .string()
    .uuid('ID da stop cause deve ser um UUID válido')
    .optional(),
  sensorId: z.string().uuid('ID do sensor deve ser um UUID válido').optional(),
  responsibleId: z
    .string()
    .uuid('ID do responsável deve ser um UUID válido')
    .optional(),
  processOrderId: z
    .string()
    .uuid('ID da ordem de processo deve ser um UUID válido')
    .optional(),
  dateFrom: z
    .string()
    .transform(val => new Date(val))
    .refine(
      val => !isNaN(val.getTime()),
      'Data de início deve ser uma data válida'
    )
    .optional(),
  dateTo: z
    .string()
    .transform(val => new Date(val))
    .refine(
      val => !isNaN(val.getTime()),
      'Data de fim deve ser uma data válida'
    )
    .optional(),
  includeRelations: z
    .string()
    .transform(val => val === 'true')
    .optional(),
});

// Schema para busca por aplicação
export const searchByAppSchema = z.object({
  app: z
    .string()
    .min(1, 'Aplicação é obrigatória')
    .max(100, 'Aplicação não pode ter mais de 100 caracteres')
    .trim(),
});

// Schema para busca por stop cause
export const searchByStopCauseSchema = z.object({
  stopCauseId: z.string().uuid('ID da stop cause deve ser um UUID válido'),
});

// Schema para busca por sensor
export const searchBySensorSchema = z.object({
  sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
});

// Schema para busca por responsável
export const searchByResponsibleSchema = z.object({
  responsibleId: z.string().uuid('ID do responsável deve ser um UUID válido'),
});

// Schema para busca por ordem de processo
export const searchByProcessOrderSchema = z.object({
  processOrderId: z
    .string()
    .uuid('ID da ordem de processo deve ser um UUID válido'),
});

// Schema para ID de descrição de evento
export const eventDescriptionIdSchema = z.object({
  id: z.string().uuid('ID da descrição de evento deve ser um UUID válido'),
});

// Tipos inferidos dos schemas
export type CreateEventDescriptionRequest = z.infer<
  typeof createEventDescriptionSchema
>;
export type UpdateEventDescriptionRequest = z.infer<
  typeof updateEventDescriptionSchema
>;
export type SearchEventDescriptionsRequest = z.infer<
  typeof searchEventDescriptionsSchema
>;
export type SearchByAppRequest = z.infer<typeof searchByAppSchema>;
export type SearchByStopCauseRequest = z.infer<typeof searchByStopCauseSchema>;
export type SearchBySensorRequest = z.infer<typeof searchBySensorSchema>;
export type SearchByResponsibleRequest = z.infer<
  typeof searchByResponsibleSchema
>;
export type SearchByProcessOrderRequest = z.infer<
  typeof searchByProcessOrderSchema
>;
export type EventDescriptionIdRequest = z.infer<
  typeof eventDescriptionIdSchema
>;
