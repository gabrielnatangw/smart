import { z } from 'zod';

const uuidSchema = z.string().uuid();

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name is required')
    .max(100, 'Role name must be at most 100 characters')
    .trim(),
  description: z
    .string()
    .min(1, 'Role description is required')
    .max(500, 'Role description must be at most 500 characters')
    .trim(),
  permissionIds: z
    .array(z.string().uuid('Each permission ID must be a valid UUID'))
    .optional(),
  isActive: z.boolean().optional(),
});

export const updateRoleSchema = z.object({
  name: z
    .string()
    .min(1, 'Role name cannot be empty')
    .max(100, 'Role name must be at most 100 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .min(1, 'Role description cannot be empty')
    .max(500, 'Role description must be at most 500 characters')
    .trim()
    .optional(),
  permissionIds: z
    .array(z.string().uuid('Each permission ID must be a valid UUID'))
    .optional(),
  isActive: z.boolean().optional(),
});

export const getRoleByIdSchema = z.object({
  id: uuidSchema.refine(val => val !== undefined, {
    message: 'Invalid role ID format',
  }),
});

export const getRoleByNameSchema = z.object({
  name: z.string().min(1, 'Role name is required'),
});

export const searchRolesSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
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
      if (val === undefined) return 10;
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 1 || num > 100) {
        throw new Error('Limit must be between 1 and 100');
      }
      return num;
    }),
});

export const roleStatsSchema = z.object({
  // No specific filters for role stats currently
});

export const deleteRoleSchema = z.object({
  id: uuidSchema.refine(val => val !== undefined, {
    message: 'Invalid role ID format',
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
