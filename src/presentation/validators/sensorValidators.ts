import { z } from 'zod';

// Função para validar números e prevenir NaN
const numberValidation = z
  .number()
  .refine(val => !isNaN(val) && isFinite(val), {
    message: 'Número inválido (NaN ou infinito)',
  });

export const createSensorSchema = z.object({
  name: z
    .string()
    .min(1, 'Sensor name is required')
    .max(100, 'Sensor name cannot exceed 100 characters')
    .trim(),
  minScale: numberValidation.optional(),
  maxScale: numberValidation.optional(),
  minAlarm: numberValidation.optional(),
  maxAlarm: numberValidation.optional(),
  gain: numberValidation.nullable().optional(),
  inputMode: z
    .string()
    .max(50, 'Input mode cannot exceed 50 characters')
    .nullable()
    .optional(),
  entry: numberValidation.optional(),
  ix: numberValidation.nullable().optional(),
  gaugeColor: z
    .string()
    .max(20, 'Gauge color cannot exceed 20 characters')
    .nullable()
    .optional(),
  offset: numberValidation.nullable().optional(),
  alarmTimeout: numberValidation.nullable().optional(),
  counterName: z
    .string()
    .max(100, 'Counter name cannot exceed 100 characters')
    .nullable()
    .optional(),
  frequencyCounterName: z
    .string()
    .max(100, 'Frequency counter name cannot exceed 100 characters')
    .nullable()
    .optional(),
  speedSource: z.boolean().nullable().optional(),
  interruptTransition: z
    .string()
    .max(50, 'Interrupt transition cannot exceed 50 characters')
    .nullable()
    .optional(),
  timeUnit: z
    .string()
    .max(20, 'Time unit cannot exceed 20 characters')
    .optional(),
  speedUnit: z
    .string()
    .max(20, 'Speed unit cannot exceed 20 characters')
    .optional(),
  samplingInterval: numberValidation.optional(),
  minimumPeriod: numberValidation.optional(),
  maximumPeriod: numberValidation.optional(),
  frequencyResolution: numberValidation.optional(),
  sensorType: numberValidation,
  measurementUnitId: z.string().uuid('Invalid category ID format'),
  moduleId: z.string().uuid('Invalid module ID format'),
});

export const updateSensorSchema = z.object({
  name: z
    .string()
    .min(1, 'Sensor name is required')
    .max(100, 'Sensor name cannot exceed 100 characters')
    .trim()
    .optional(),
  minScale: numberValidation.optional(),
  maxScale: numberValidation.optional(),
  minAlarm: numberValidation.optional(),
  maxAlarm: numberValidation.optional(),
  gain: numberValidation.nullable().optional(),
  inputMode: z
    .string()
    .max(50, 'Input mode cannot exceed 50 characters')
    .nullable()
    .optional(),
  entry: numberValidation.optional(),
  ix: numberValidation.nullable().optional(),
  gaugeColor: z
    .string()
    .max(20, 'Gauge color cannot exceed 20 characters')
    .nullable()
    .optional(),
  offset: numberValidation.nullable().optional(),
  alarmTimeout: numberValidation.nullable().optional(),
  counterName: z
    .string()
    .max(100, 'Counter name cannot exceed 100 characters')
    .nullable()
    .optional(),
  frequencyCounterName: z
    .string()
    .max(100, 'Frequency counter name cannot exceed 100 characters')
    .nullable()
    .optional(),
  speedSource: z.boolean().nullable().optional(),
  interruptTransition: z
    .string()
    .max(50, 'Interrupt transition cannot exceed 50 characters')
    .nullable()
    .optional(),
  timeUnit: z
    .string()
    .max(20, 'Time unit cannot exceed 20 characters')
    .optional(),
  speedUnit: z
    .string()
    .max(20, 'Speed unit cannot exceed 20 characters')
    .optional(),
  samplingInterval: numberValidation.optional(),
  minimumPeriod: numberValidation.optional(),
  maximumPeriod: numberValidation.optional(),
  frequencyResolution: numberValidation.optional(),
  sensorType: numberValidation.optional(),
  measurementUnitId: z.string().uuid('Invalid category ID format').optional(),
  moduleId: z.string().uuid('Invalid module ID format').optional(),
});

export const getSensorByIdSchema = z.object({
  id: z.string().uuid('Invalid sensor ID format'),
});

export const searchSensorsSchema = z.object({
  name: z.string().optional(),
  sensorType: z
    .string()
    .optional()
    .transform(val => (val ? parseFloat(val) : undefined)),
  measurementUnitId: z.string().uuid('Invalid category ID format').optional(),
  moduleId: z.string().uuid('Invalid module ID format').optional(),
  isDeleted: z
    .string()
    .optional()
    .transform(val => {
      if (val === 'true') return true;
      if (val === 'false') return false;
      return undefined;
    }),
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val) : undefined))
    .refine(val => val === undefined || (val > 0 && val <= 1000), {
      message: 'Page must be between 1 and 1000',
    }),
  limit: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return undefined;
      if (val === 'all' || val === '-1') return -1; // Valor especial para retornar todos
      return parseInt(val);
    })
    .refine(
      val => val === undefined || val === -1 || (val > 0 && val <= 1000),
      {
        message:
          'Limit must be between 1 and 1000, or use "all" to return all records',
      }
    ),
});

export const sensorStatsSchema = z.object({
  measurementUnitId: z.string().uuid('Invalid category ID format').optional(),
  moduleId: z.string().uuid('Invalid module ID format').optional(),
});

export const deleteSensorSchema = z.object({
  id: z.string().uuid('Invalid sensor ID format'),
});

export const restoreSensorSchema = z.object({
  id: z.string().uuid('Invalid sensor ID format'),
});

export const getSensorsByModuleSchema = z.object({
  moduleId: z.string().uuid('Invalid module ID format'),
});

export const getSensorsByMeasurementUnitSchema = z.object({
  measurementUnitId: z.string().uuid('Invalid measurement unit ID format'),
});

// Custom validation for scale ranges
export const validateScaleRange = (
  minScale?: number,
  maxScale?: number
): boolean => {
  if (minScale !== undefined && maxScale !== undefined) {
    return maxScale >= minScale;
  }
  return true;
};

// Custom validation for alarm ranges
export const validateAlarmRange = (
  minAlarm?: number,
  maxAlarm?: number
): boolean => {
  if (minAlarm !== undefined && maxAlarm !== undefined) {
    return maxAlarm >= minAlarm;
  }
  return true;
};

// Custom validation for period ranges
export const validatePeriodRange = (
  minimumPeriod?: number,
  maximumPeriod?: number
): boolean => {
  if (minimumPeriod !== undefined && maximumPeriod !== undefined) {
    return maximumPeriod >= minimumPeriod;
  }
  return true;
};

// Refined schema for create that validates ranges
export const createSensorWithRangeValidationSchema = createSensorSchema
  .refine(data => validateScaleRange(data.minScale, data.maxScale), {
    message: 'Max scale must be greater than or equal to min scale',
    path: ['maxScale'],
  })
  .refine(data => validateAlarmRange(data.minAlarm, data.maxAlarm), {
    message: 'Max alarm must be greater than or equal to min alarm',
    path: ['maxAlarm'],
  })
  .refine(data => validatePeriodRange(data.minimumPeriod, data.maximumPeriod), {
    message: 'Maximum period must be greater than or equal to minimum period',
    path: ['maximumPeriod'],
  });

// Refined schema for update that validates ranges
export const updateSensorWithRangeValidationSchema = updateSensorSchema
  .refine(data => validateScaleRange(data.minScale, data.maxScale), {
    message: 'Max scale must be greater than or equal to min scale',
    path: ['maxScale'],
  })
  .refine(data => validateAlarmRange(data.minAlarm, data.maxAlarm), {
    message: 'Max alarm must be greater than or equal to min alarm',
    path: ['maxAlarm'],
  })
  .refine(data => validatePeriodRange(data.minimumPeriod, data.maximumPeriod), {
    message: 'Maximum period must be greater than or equal to minimum period',
    path: ['maximumPeriod'],
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
