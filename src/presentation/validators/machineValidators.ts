import { z } from 'zod';

import { SpeedMeasureTech } from '../../domain/value-objects/SpeedMeasureTech';

export const createMachineSchema = z.object({
  operationalSector: z
    .string()
    .min(1, 'Operational sector is required')
    .max(100, 'Operational sector cannot exceed 100 characters')
    .trim(),
  name: z
    .string()
    .min(1, 'Machine name is required')
    .max(100, 'Machine name cannot exceed 100 characters')
    .trim(),
  manufacturer: z
    .string()
    .min(1, 'Manufacturer is required')
    .max(100, 'Manufacturer cannot exceed 100 characters')
    .trim(),
  serialNumber: z
    .string()
    .min(1, 'Serial number is required')
    .max(50, 'Serial number cannot exceed 50 characters')
    .trim(),
  yearOfManufacture: z
    .string()
    .min(4, 'Year of manufacture must be at least 4 characters')
    .max(4, 'Year of manufacture must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Year of manufacture must be a valid 4-digit year')
    .refine(year => {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear + 1;
    }, 'Year of manufacture must be between 1900 and current year + 1')
    .trim(),
  yearOfInstallation: z
    .string()
    .min(4, 'Year of installation must be at least 4 characters')
    .max(4, 'Year of installation must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Year of installation must be a valid 4-digit year')
    .refine(year => {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear + 1;
    }, 'Year of installation must be between 1900 and current year + 1')
    .trim(),
  maxPerformance: z
    .number()
    .max(999999, 'Max performance cannot exceed 999999'),
  speedMeasureTech: z.nativeEnum(SpeedMeasureTech, {
    message: 'Speed measure tech must be a valid measurement type',
  }),
});

export const updateMachineSchema = z.object({
  operationalSector: z
    .string()
    .min(1, 'Operational sector is required')
    .max(100, 'Operational sector cannot exceed 100 characters')
    .trim()
    .optional(),
  name: z
    .string()
    .min(1, 'Machine name is required')
    .max(100, 'Machine name cannot exceed 100 characters')
    .trim()
    .optional(),
  manufacturer: z
    .string()
    .min(1, 'Manufacturer is required')
    .max(100, 'Manufacturer cannot exceed 100 characters')
    .trim()
    .optional(),
  serialNumber: z
    .string()
    .min(1, 'Serial number is required')
    .max(50, 'Serial number cannot exceed 50 characters')
    .trim()
    .optional(),
  yearOfManufacture: z
    .string()
    .min(4, 'Year of manufacture must be at least 4 characters')
    .max(4, 'Year of manufacture must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Year of manufacture must be a valid 4-digit year')
    .refine(year => {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear + 1;
    }, 'Year of manufacture must be between 1900 and current year + 1')
    .trim()
    .optional(),
  yearOfInstallation: z
    .string()
    .min(4, 'Year of installation must be at least 4 characters')
    .max(4, 'Year of installation must be exactly 4 characters')
    .regex(/^\d{4}$/, 'Year of installation must be a valid 4-digit year')
    .refine(year => {
      const currentYear = new Date().getFullYear();
      const yearNum = parseInt(year);
      return yearNum >= 1900 && yearNum <= currentYear + 1;
    }, 'Year of installation must be between 1900 and current year + 1')
    .trim()
    .optional(),
  maxPerformance: z
    .number()
    .max(999999, 'Max performance cannot exceed 999999')
    .optional(),
  speedMeasureTech: z
    .nativeEnum(SpeedMeasureTech, {
      message: 'Speed measure tech must be a valid measurement type',
    })
    .optional(),
});

export const getMachineByIdSchema = z.object({
  id: z.string().uuid('Invalid machine ID format'),
});

export const searchMachinesSchema = z.object({
  operationalSector: z.string().optional(),
  name: z.string().optional(),
  manufacturer: z.string().optional(),
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

export const machineStatsSchema = z.object({
  // No additional parameters needed for stats
});

export const deleteMachineSchema = z.object({
  id: z.string().uuid('Invalid machine ID format'),
});

export const restoreMachineSchema = z.object({
  id: z.string().uuid('Invalid machine ID format'),
});

// Custom validation for year comparisons
export const validateYearOfInstallation = (
  yearOfManufacture: string,
  yearOfInstallation: string
): boolean => {
  const manufactureYear = parseInt(yearOfManufacture);
  const installationYear = parseInt(yearOfInstallation);
  return installationYear >= manufactureYear;
};

// Refined schema for create that validates year relationship
export const createMachineWithYearValidationSchema = createMachineSchema.refine(
  data =>
    validateYearOfInstallation(data.yearOfManufacture, data.yearOfInstallation),
  {
    message:
      'Year of installation must be greater than or equal to year of manufacture',
    path: ['yearOfInstallation'],
  }
);

// Refined schema for update that validates year relationship when both are provided
export const updateMachineWithYearValidationSchema = updateMachineSchema.refine(
  data => {
    if (data.yearOfManufacture && data.yearOfInstallation) {
      return validateYearOfInstallation(
        data.yearOfManufacture,
        data.yearOfInstallation
      );
    }
    return true;
  },
  {
    message:
      'Year of installation must be greater than or equal to year of manufacture',
    path: ['yearOfInstallation'],
  }
);
