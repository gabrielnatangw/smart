import { z } from 'zod';

// Schema para criação de ordem de produto
export const createProductOrderSchema = z.object({
  productionOrder: z
    .string()
    .min(1, 'Ordem de produção é obrigatória')
    .max(100, 'Ordem de produção deve ter no máximo 100 caracteres')
    .trim(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  jobRun: z
    .number()
    .int('Job run deve ser um número inteiro')
    .min(1, 'Job run deve ser maior que zero')
    .max(999999, 'Job run deve ser menor que 999999'),
  startProduction: z
    .string()
    .datetime('Data de início de produção deve ser uma data válida'),
  expectedRunTime: z
    .string()
    .datetime('Data de tempo esperado deve ser uma data válida'),
});

// Schema para atualização de ordem de produto
export const updateProductOrderSchema = z.object({
  productionOrder: z
    .string()
    .min(1, 'Ordem de produção é obrigatória')
    .max(100, 'Ordem de produção deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim()
    .optional(),
  jobRun: z
    .number()
    .int('Job run deve ser um número inteiro')
    .min(1, 'Job run deve ser maior que zero')
    .max(999999, 'Job run deve ser menor que 999999')
    .optional(),
  startProduction: z
    .string()
    .datetime('Data de início de produção deve ser uma data válida')
    .optional(),
  expectedRunTime: z
    .string()
    .datetime('Data de tempo esperado deve ser uma data válida')
    .optional(),
});

// Schema para busca de ordens de produto
export const searchProductOrdersSchema = z.object({
  productionOrder: z.string().optional(),
  name: z.string().optional(),
  jobRun: z.number().int().optional(),
  startProductionFrom: z.string().datetime().optional(),
  startProductionTo: z.string().datetime().optional(),
  expectedRunTimeFrom: z.string().datetime().optional(),
  expectedRunTimeTo: z.string().datetime().optional(),
  includeDeleted: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Schema para ID de ordem de produto
export const productOrderIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Schema para parâmetros de exclusão
export const deleteProductOrderSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  permanent: z.boolean().default(false),
});

// Schema para estatísticas (vazio por enquanto, pode ser expandido no futuro)
export const productOrderStatsSchema = z.object({});
