import { z } from 'zod';

// ===========================================
// VALIDADORES DE DADOS DE SENSORES
// ===========================================

export const createDataSchema = z.object({
  body: z.object({
    sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
    value: z
      .number()
      .finite('Valor deve ser um número finito')
      .refine(val => !isNaN(val), 'Valor deve ser um número válido'),
    rawValue: z
      .number()
      .finite('Valor bruto deve ser um número finito')
      .refine(val => !isNaN(val), 'Valor bruto deve ser um número válido')
      .optional(),
    unit: z
      .string()
      .max(50, 'Unidade não pode exceder 50 caracteres')
      .trim()
      .optional(),
    quality: z
      .enum(
        ['GOOD', 'BAD', 'UNCERTAIN', 'MAINTENANCE', 'OFFLINE'],
        'Qualidade inválida'
      )
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const getDataSchema = z.object({
  params: z.object({
    sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
  }),
  query: z.object({
    startDate: z
      .string()
      .datetime('Data de início deve ser uma data válida')
      .optional(),
    endDate: z
      .string()
      .datetime('Data de fim deve ser uma data válida')
      .optional(),
    quality: z
      .enum(
        ['GOOD', 'BAD', 'UNCERTAIN', 'MAINTENANCE', 'OFFLINE'],
        'Qualidade inválida'
      )
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limite deve ser um número')
      .transform(Number)
      .refine(n => n > 0 && n <= 10000, 'Limite deve estar entre 1 e 10000')
      .optional(),
  }),
});

export const getLatestDataSchema = z.object({
  params: z.object({
    sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
  }),
  query: z.object({
    limit: z
      .string()
      .regex(/^\d+$/, 'Limite deve ser um número')
      .transform(Number)
      .refine(n => n > 0 && n <= 1000, 'Limite deve estar entre 1 e 1000')
      .optional(),
  }),
});

export const getCurrentValueSchema = z.object({
  params: z.object({
    sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
  }),
});

export const getCurrentValuesSchema = z.object({
  query: z.object({
    sensorId: z
      .string()
      .uuid('ID do sensor deve ser um UUID válido')
      .optional(),
    quality: z
      .enum(
        ['GOOD', 'BAD', 'UNCERTAIN', 'MAINTENANCE', 'OFFLINE'],
        'Qualidade inválida'
      )
      .optional(),
  }),
});

export const updateCurrentValueSchema = z.object({
  params: z.object({
    sensorId: z.string().uuid('ID do sensor deve ser um UUID válido'),
  }),
  body: z.object({
    value: z
      .number()
      .finite('Valor deve ser um número finito')
      .refine(val => !isNaN(val), 'Valor deve ser um número válido'),
    rawValue: z
      .number()
      .finite('Valor bruto deve ser um número finito')
      .refine(val => !isNaN(val), 'Valor bruto deve ser um número válido')
      .optional(),
    unit: z
      .string()
      .max(50, 'Unidade não pode exceder 50 caracteres')
      .trim()
      .optional(),
    quality: z
      .enum(
        ['GOOD', 'BAD', 'UNCERTAIN', 'MAINTENANCE', 'OFFLINE'],
        'Qualidade inválida'
      )
      .optional(),
    metadata: z.record(z.string(), z.any()).optional(),
  }),
});

export const getStatsSchema = z.object({
  query: z.object({
    startDate: z
      .string()
      .datetime('Data de início deve ser uma data válida')
      .optional(),
    endDate: z
      .string()
      .datetime('Data de fim deve ser uma data válida')
      .optional(),
  }),
});

export const deleteOldDataSchema = z.object({
  query: z.object({
    days: z
      .string()
      .regex(/^\d+$/, 'Dias deve ser um número')
      .transform(Number)
      .refine(n => n > 0 && n <= 365, 'Dias deve estar entre 1 e 365')
      .optional(),
  }),
});

// ===========================================
// EXPORT DOS VALIDADORES
// ===========================================

export const sensorDataValidators = {
  createData: createDataSchema,
  getData: getDataSchema,
  getLatestData: getLatestDataSchema,
  getCurrentValue: getCurrentValueSchema,
  getCurrentValues: getCurrentValuesSchema,
  updateCurrentValue: updateCurrentValueSchema,
  getStats: getStatsSchema,
  deleteOldData: deleteOldDataSchema,
};
