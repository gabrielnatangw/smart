import { z } from 'zod';

// Schemas de validação
export const CreateCategoriesResponsibleSchema = z.object({
  categoryResponsible: z
    .string()
    .min(1, 'Categoria de responsável é obrigatória')
    .max(255, 'Categoria de responsável não pode ter mais de 255 caracteres')
    .trim(),
});

export const UpdateCategoriesResponsibleSchema = z.object({
  categoryResponsible: z
    .string()
    .min(1, 'Categoria de responsável é obrigatória')
    .max(255, 'Categoria de responsável não pode ter mais de 255 caracteres')
    .trim()
    .optional(),
});

export const GetCategoriesResponsibleByIdSchema = z.object({
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria de responsável deve ser um UUID válido'),
});

export const GetAllCategoriesResponsibleSchema = z.object({
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().max(100).optional().default(10),
  search: z.string().optional(),
  includeDeleted: z.boolean().optional().default(false),
});

export const DeleteCategoriesResponsibleSchema = z.object({
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria de responsável deve ser um UUID válido'),
});

export const RestoreCategoriesResponsibleSchema = z.object({
  categoryResponsibleId: z
    .string()
    .uuid('ID da categoria de responsável deve ser um UUID válido'),
});

export const FindCategoriesResponsibleByNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(255, 'Nome não pode ter mais de 255 caracteres'),
});

// Tipos TypeScript
export type CreateCategoriesResponsibleDTO = z.infer<
  typeof CreateCategoriesResponsibleSchema
>;
export type UpdateCategoriesResponsibleDTO = z.infer<
  typeof UpdateCategoriesResponsibleSchema
>;
export type GetCategoriesResponsibleByIdDTO = z.infer<
  typeof GetCategoriesResponsibleByIdSchema
>;
export type GetAllCategoriesResponsibleDTO = z.infer<
  typeof GetAllCategoriesResponsibleSchema
>;
export type DeleteCategoriesResponsibleDTO = z.infer<
  typeof DeleteCategoriesResponsibleSchema
>;
export type RestoreCategoriesResponsibleDTO = z.infer<
  typeof RestoreCategoriesResponsibleSchema
>;
export type FindCategoriesResponsibleByNameDTO = z.infer<
  typeof FindCategoriesResponsibleByNameSchema
>;

// Response DTOs
export interface CategoriesResponsibleResponseDTO {
  categoryResponsibleId: string;
  categoryResponsible: string;
  tenantId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  responsibleCount?: number;
}

export interface GetAllCategoriesResponsibleResponseDTO {
  categoriesResponsible: CategoriesResponsibleResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoriesResponsibleStatisticsDTO {
  totalCategoriesResponsible: number;
  activeCategoriesResponsible: number;
  deletedCategoriesResponsible: number;
  categoriesWithResponsible: number;
  categoriesWithoutResponsible: number;
  averageResponsiblePerCategory: number;
}
