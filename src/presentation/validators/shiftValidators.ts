import { z } from 'zod';

// Schemas de validação para requests
export const createShiftSchema = z.object({
  body: z.object({
    shiftName: z
      .string()
      .min(1, 'Nome do turno é obrigatório')
      .max(100, 'Nome do turno não pode ter mais de 100 caracteres')
      .trim(),
    shiftStart: z
      .string()
      .min(1, 'Horário de início é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      ),
    shiftEnd: z
      .string()
      .min(1, 'Horário de fim é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      ),
  }),
});

export const updateShiftSchema = z.object({
  params: z.object({
    shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
  }),
  body: z.object({
    shiftName: z
      .string()
      .min(1, 'Nome do turno é obrigatório')
      .max(100, 'Nome do turno não pode ter mais de 100 caracteres')
      .trim()
      .optional(),
    shiftStart: z
      .string()
      .min(1, 'Horário de início é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      )
      .optional(),
    shiftEnd: z
      .string()
      .min(1, 'Horário de fim é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      )
      .optional(),
  }),
});

export const getShiftByIdSchema = z.object({
  params: z.object({
    shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
  }),
});

export const getAllShiftsSchema = z.object({
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

export const deleteShiftSchema = z.object({
  params: z.object({
    shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
  }),
});

export const restoreShiftSchema = z.object({
  params: z.object({
    shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
  }),
});

export const getShiftsByTimeRangeSchema = z.object({
  query: z.object({
    startTime: z
      .string()
      .min(1, 'Horário de início é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      ),
    endTime: z
      .string()
      .min(1, 'Horário de fim é obrigatório')
      .regex(
        /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
        'Formato de hora inválido. Use HH:MM'
      ),
  }),
});

// Tipos TypeScript
export type CreateShiftRequest = z.infer<typeof createShiftSchema>['body'];
export type UpdateShiftRequest = z.infer<typeof updateShiftSchema>['body'];
export type GetShiftByIdRequest = z.infer<typeof getShiftByIdSchema>['params'];
export type GetAllShiftsRequest = z.infer<typeof getAllShiftsSchema>['query'];
export type DeleteShiftRequest = z.infer<typeof deleteShiftSchema>['params'];
export type RestoreShiftRequest = z.infer<typeof restoreShiftSchema>['params'];
export type GetShiftsByTimeRangeRequest = z.infer<
  typeof getShiftsByTimeRangeSchema
>['query'];
