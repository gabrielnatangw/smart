import { z } from 'zod';

// Schema para criação de ordem de processo
export const createProcessOrderSchema = z.object({
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
  plannedSpeed: z
    .number()
    .min(0, 'Velocidade planejada deve ser maior ou igual a zero')
    .max(999999, 'Velocidade planejada deve ser menor que 999999'),
  startProduction: z
    .string()
    .datetime('Data de início de produção deve ser uma data válida'),
  expectedRunTime: z
    .string()
    .datetime('Data de tempo esperado deve ser uma data válida'),
  programmedMultiplier: z
    .number()
    .min(0, 'Multiplicador programado deve ser maior ou igual a zero')
    .optional(),
  realMultiplier: z
    .number()
    .min(0, 'Multiplicador real deve ser maior ou igual a zero')
    .optional(),
  zeroSpeedThreshold: z
    .number()
    .min(0, 'Limite de velocidade zero deve ser maior ou igual a zero')
    .optional(),
  productionSpeedThreshold: z
    .number()
    .min(0, 'Limite de velocidade de produção deve ser maior ou igual a zero')
    .optional(),
  zeroSpeedTimeout: z
    .number()
    .min(0, 'Timeout de velocidade zero deve ser maior ou igual a zero')
    .optional(),
  productionSpeedTimeout: z
    .number()
    .min(0, 'Timeout de velocidade de produção deve ser maior ou igual a zero')
    .optional(),
  cycleToRun: z
    .number()
    .min(0, 'Ciclos para executar deve ser maior ou igual a zero')
    .optional(),
  cycleTime: z
    .number()
    .min(0, 'Tempo de ciclo deve ser maior ou igual a zero')
    .optional(),
  machineId: z
    .string()
    .uuid('ID da máquina deve ser um UUID válido')
    .optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional(),
  productOrderId: z
    .string()
    .uuid('ID da ordem de produto deve ser um UUID válido'),
});

// Schema para atualização de ordem de processo
export const updateProcessOrderSchema = z.object({
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
  plannedSpeed: z
    .number()
    .min(0, 'Velocidade planejada deve ser maior ou igual a zero')
    .max(999999, 'Velocidade planejada deve ser menor que 999999')
    .optional(),
  startProduction: z
    .string()
    .datetime('Data de início de produção deve ser uma data válida')
    .optional(),
  expectedRunTime: z
    .string()
    .datetime('Data de tempo esperado deve ser uma data válida')
    .optional(),
  programmedMultiplier: z
    .number()
    .min(0, 'Multiplicador programado deve ser maior ou igual a zero')
    .optional(),
  realMultiplier: z
    .number()
    .min(0, 'Multiplicador real deve ser maior ou igual a zero')
    .optional(),
  zeroSpeedThreshold: z
    .number()
    .min(0, 'Limite de velocidade zero deve ser maior ou igual a zero')
    .optional(),
  productionSpeedThreshold: z
    .number()
    .min(0, 'Limite de velocidade de produção deve ser maior ou igual a zero')
    .optional(),
  zeroSpeedTimeout: z
    .number()
    .min(0, 'Timeout de velocidade zero deve ser maior ou igual a zero')
    .optional(),
  productionSpeedTimeout: z
    .number()
    .min(0, 'Timeout de velocidade de produção deve ser maior ou igual a zero')
    .optional(),
  cycleToRun: z
    .number()
    .min(0, 'Ciclos para executar deve ser maior ou igual a zero')
    .optional(),
  cycleTime: z
    .number()
    .min(0, 'Tempo de ciclo deve ser maior ou igual a zero')
    .optional(),
  machineId: z
    .string()
    .uuid('ID da máquina deve ser um UUID válido')
    .optional(),
  userId: z.string().uuid('ID do usuário deve ser um UUID válido').optional(),
});

// Schema para busca de ordens de processo
export const searchProcessOrdersSchema = z.object({
  name: z.string().optional(),
  jobRun: z.number().int().optional(),
  plannedSpeedMin: z.number().min(0).optional(),
  plannedSpeedMax: z.number().min(0).optional(),
  startProductionFrom: z.string().datetime().optional(),
  startProductionTo: z.string().datetime().optional(),
  expectedRunTimeFrom: z.string().datetime().optional(),
  expectedRunTimeTo: z.string().datetime().optional(),
  machineId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  productOrderId: z.string().uuid().optional(),
  includeDeleted: z.boolean().default(false),
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

// Schema para ID de ordem de processo
export const processOrderIdSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
});

// Schema para parâmetros de exclusão
export const deleteProcessOrderSchema = z.object({
  id: z.string().uuid('ID deve ser um UUID válido'),
  permanent: z.boolean().default(false),
});

// Schema para estatísticas (vazio por enquanto, pode ser expandido no futuro)
export const processOrderStatsSchema = z.object({});
