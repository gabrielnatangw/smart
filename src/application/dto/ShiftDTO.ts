import { z } from 'zod';

// Schemas de validação
export const CreateShiftSchema = z.object({
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
});

export const UpdateShiftSchema = z.object({
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
});

export const GetShiftByIdSchema = z.object({
  shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
});

export const GetAllShiftsSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  includeDeleted: z.boolean().optional().default(false),
});

export const DeleteShiftSchema = z.object({
  shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
});

export const RestoreShiftSchema = z.object({
  shiftId: z.string().uuid('ID do turno deve ser um UUID válido'),
});

// Tipos TypeScript
export type CreateShiftDTO = z.infer<typeof CreateShiftSchema>;
export type UpdateShiftDTO = z.infer<typeof UpdateShiftSchema>;
export type GetShiftByIdDTO = z.infer<typeof GetShiftByIdSchema>;
export type GetAllShiftsDTO = z.infer<typeof GetAllShiftsSchema>;
export type DeleteShiftDTO = z.infer<typeof DeleteShiftSchema>;
export type RestoreShiftDTO = z.infer<typeof RestoreShiftSchema>;

// Response DTOs
export interface ShiftResponseDTO {
  shiftId: string;
  shiftName: string;
  shiftStart: string;
  shiftEnd: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface GetAllShiftsResponseDTO {
  shifts: ShiftResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ShiftStatisticsDTO {
  totalShifts: number;
  activeShifts: number;
  deletedShifts: number;
  averageShiftDuration: number; // em minutos
  shiftsByTimeRange: {
    morning: number; // 06:00 - 12:00
    afternoon: number; // 12:00 - 18:00
    night: number; // 18:00 - 06:00
  };
}
