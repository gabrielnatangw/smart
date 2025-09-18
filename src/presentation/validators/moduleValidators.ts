import { z } from 'zod';

export const createModuleSchema = z.object({
  customer: z
    .string()
    .min(1, 'Customer is required')
    .max(100, 'Customer name cannot exceed 100 characters')
    .trim(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name cannot exceed 100 characters')
    .trim(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name cannot exceed 100 characters')
    .trim(),
  blueprint: z
    .string()
    .min(1, 'Blueprint is required')
    .max(200, 'Blueprint cannot exceed 200 characters')
    .trim(),
  sector: z
    .string()
    .min(1, 'Sector is required')
    .max(100, 'Sector cannot exceed 100 characters')
    .trim(),
  machineName: z
    .string()
    .min(1, 'Machine name is required')
    .max(100, 'Machine name cannot exceed 100 characters')
    .trim(),
  machineId: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .pipe(z.string().uuid('Machine ID must be a valid UUID').optional()),
});

export const updateModuleSchema = z.object({
  customer: z
    .string()
    .min(1, 'Customer is required')
    .max(100, 'Customer name cannot exceed 100 characters')
    .trim()
    .optional(),
  country: z
    .string()
    .min(1, 'Country is required')
    .max(100, 'Country name cannot exceed 100 characters')
    .trim()
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name cannot exceed 100 characters')
    .trim()
    .optional(),
  blueprint: z
    .string()
    .min(1, 'Blueprint is required')
    .max(200, 'Blueprint cannot exceed 200 characters')
    .trim()
    .optional(),
  sector: z
    .string()
    .min(1, 'Sector is required')
    .max(100, 'Sector cannot exceed 100 characters')
    .trim()
    .optional(),
  machineName: z
    .string()
    .min(1, 'Machine name is required')
    .max(100, 'Machine name cannot exceed 100 characters')
    .trim()
    .optional(),
  machineId: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .pipe(z.string().uuid('Machine ID must be a valid UUID').optional()),
});

export const getModuleByIdSchema = z.object({
  id: z.string().uuid('Invalid module ID format'),
});

export const searchModulesSchema = z.object({
  customer: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  sector: z.string().optional(),
  machineName: z.string().optional(),
  machineId: z
    .string()
    .optional()
    .transform(val => {
      if (!val || val.trim() === '') return undefined;
      return val;
    })
    .pipe(z.string().uuid('Machine ID must be a valid UUID').optional()),
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

export const moduleStatsSchema = z.object({
  // No additional parameters needed for stats
});

export const deleteModuleSchema = z.object({
  id: z.string().uuid('Invalid module ID format'),
});

export const restoreModuleSchema = z.object({
  id: z.string().uuid('Invalid module ID format'),
});

export const assignModuleToMachineSchema = z.object({
  id: z.string().uuid('Invalid module ID format'),
  machineId: z.string().uuid('Invalid machine ID format'),
});

export const unassignModuleFromMachineSchema = z.object({
  id: z.string().uuid('Invalid module ID format'),
});

export const getModulesByMachineSchema = z.object({
  machineId: z.string().uuid('Invalid machine ID format'),
});

// Custom validation for location data
export const validateLocationData = (
  country: string,
  city: string
): boolean => {
  // Simple validation - in a real app, you might validate against a list of valid countries/cities
  const trimmedCountry = country.trim();
  const trimmedCity = city.trim();

  return trimmedCountry.length > 0 && trimmedCity.length > 0;
};

// Refined schema for create that validates location
export const createModuleWithLocationValidationSchema =
  createModuleSchema.refine(
    data => validateLocationData(data.country, data.city),
    {
      message: 'Invalid country or city combination',
      path: ['city'],
    }
  );

// Refined schema for update that validates location when both are provided
export const updateModuleWithLocationValidationSchema =
  updateModuleSchema.refine(
    data => {
      if (data.country && data.city) {
        return validateLocationData(data.country, data.city);
      }
      return true;
    },
    {
      message: 'Invalid country or city combination',
      path: ['city'],
    }
  );
