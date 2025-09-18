import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createMeasurementUnitSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label must be at most 100 characters')
    .trim(),
  unitSymbol: z
    .string()
    .min(1, 'Unit symbol is required')
    .max(20, 'Unit symbol must be at most 20 characters')
    .trim(),
});

export const updateMeasurementUnitSchema = z.object({
  label: z
    .string()
    .min(1, 'Label cannot be empty')
    .max(100, 'Label must be at most 100 characters')
    .trim()
    .optional(),
  unitSymbol: z
    .string()
    .min(1, 'Unit symbol cannot be empty')
    .max(20, 'Unit symbol must be at most 20 characters')
    .trim()
    .optional(),
});

export const getMeasurementUnitByIdSchema = z.object({
  id: uuidSchema.refine(val => val !== undefined, {
    message: 'Invalid measurement unit ID format',
  }),
});

export const getMeasurementUnitByLabelSchema = z.object({
  label: z.string().min(1, 'Label is required'),
});

export const searchMeasurementUnitsSchema = z.object({
  label: z.string().optional(),
  unitSymbol: z.string().optional(),
  tenantId: z.string().uuid('Invalid tenant ID format').optional(),
  isDeleted: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return undefined;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('isDeleted must be true or false');
    }),
  page: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return 1;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1)
        throw new Error('Page must be a positive integer');
      return num;
    }),
  limit: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return 10;
      if (val === 'all' || val === '-1') return -1; // Valor especial para retornar todos
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 1000) {
        throw new Error(
          'Limit must be between 1 and 1000, or use "all" to return all records'
        );
      }
      return num;
    }),
});

export const measurementUnitStatsSchema = z.object({
  tenantId: z.string().uuid('Invalid tenant ID format').optional(),
});

export const deleteMeasurementUnitSchema = z.object({
  id: uuidSchema.refine(val => val !== undefined, {
    message: 'Invalid measurement unit ID format',
  }),
  permanent: z
    .string()
    .optional()
    .transform(val => {
      if (val === undefined) return false;
      if (val === 'true') return true;
      if (val === 'false') return false;
      throw new Error('permanent must be true or false');
    }),
});

// Generic validation function that can be used by controllers
export const validateRequest = <T>(
  schema: z.ZodSchema<T>,
  data: any
): { error?: string; value?: T } => {
  try {
    const result = schema.parse(data);
    return { value: result };
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues
        .map((err: any) => err.message)
        .join(', ');
      return { error: errorMessages };
    }
    return { error: 'Invalid request data' };
  }
};
