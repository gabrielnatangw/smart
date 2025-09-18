import { z } from 'zod';

// Schemas de validação
export const CreateStopCauseSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição da causa de parada é obrigatória')
    .max(
      255,
      'Descrição da causa de parada não pode ter mais de 255 caracteres'
    )
    .trim(),
  parentId: z.string().uuid('ID do pai deve ser um UUID válido').optional(),
});

export const UpdateStopCauseSchema = z.object({
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
});

export const GetStopCauseByIdSchema = z.object({
  stopCauseId: z.string().uuid('ID da causa de parada deve ser um UUID válido'),
});

export const GetAllStopCausesSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  includeDeleted: z.boolean().optional().default(false),
  includeHierarchy: z.boolean().optional().default(false),
});

export const DeleteStopCauseSchema = z.object({
  stopCauseId: z.string().uuid('ID da causa de parada deve ser um UUID válido'),
});

export const RestoreStopCauseSchema = z.object({
  stopCauseId: z.string().uuid('ID da causa de parada deve ser um UUID válido'),
});

export const GetHierarchySchema = z.object({
  includeDeleted: z.boolean().optional().default(false),
});

export const MoveStopCauseSchema = z.object({
  stopCauseId: z.string().uuid('ID da causa de parada deve ser um UUID válido'),
  newParentId: z
    .string()
    .uuid('ID do novo pai deve ser um UUID válido')
    .optional(),
});

export const GetStopCausesByLevelSchema = z.object({
  level: z.number().int().min(0, 'Nível deve ser maior ou igual a 0'),
});

export const GetStopCausesByDescriptionSchema = z.object({
  description: z
    .string()
    .min(1, 'Descrição é obrigatória')
    .max(255, 'Descrição não pode ter mais de 255 caracteres'),
});

// Tipos TypeScript
export type CreateStopCauseDTO = z.infer<typeof CreateStopCauseSchema>;
export type UpdateStopCauseDTO = z.infer<typeof UpdateStopCauseSchema>;
export type GetStopCauseByIdDTO = z.infer<typeof GetStopCauseByIdSchema>;
export type GetAllStopCausesDTO = z.infer<typeof GetAllStopCausesSchema>;
export type DeleteStopCauseDTO = z.infer<typeof DeleteStopCauseSchema>;
export type RestoreStopCauseDTO = z.infer<typeof RestoreStopCauseSchema>;
export type GetHierarchyDTO = z.infer<typeof GetHierarchySchema>;
export type MoveStopCauseDTO = z.infer<typeof MoveStopCauseSchema>;
export type GetStopCausesByLevelDTO = z.infer<
  typeof GetStopCausesByLevelSchema
>;
export type GetStopCausesByDescriptionDTO = z.infer<
  typeof GetStopCausesByDescriptionSchema
>;

// Response DTOs
export interface StopCauseResponseDTO {
  stopCauseId: string;
  description: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  parentId?: string;
  parent?: StopCauseResponseDTO;
  children?: StopCauseResponseDTO[];
  level: number;
  isRoot: boolean;
  isLeaf: boolean;
}

export interface GetAllStopCausesResponseDTO {
  stopCauses: StopCauseResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface StopCauseHierarchyResponseDTO {
  stopCauses: StopCauseResponseDTO[];
  total: number;
  rootCount: number;
  maxDepth: number;
}

export interface StopCauseStatisticsDTO {
  totalStopCauses: number;
  activeStopCauses: number;
  deletedStopCauses: number;
  rootStopCauses: number;
  leafStopCauses: number;
  averageDepth: number;
  maxDepth: number;
  stopCausesByLevel: Record<number, number>;
}

export interface StopCauseTreeDTO {
  stopCauseId: string;
  description: string;
  level: number;
  children: StopCauseTreeDTO[];
  isExpanded?: boolean;
  isSelected?: boolean;
}
