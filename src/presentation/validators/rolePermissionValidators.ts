import { z } from 'zod';

export const addPermissionToRoleSchema = z.object({
  permissionId: z.string().uuid('Permission ID must be a valid UUID'),
});

export const removePermissionFromRoleSchema = z.object({
  permissionId: z.string().uuid('Permission ID must be a valid UUID'),
});

export const updateRolePermissionsSchema = z.object({
  permissionIds: z
    .array(z.string().uuid('Each permission ID must be a valid UUID'))
    .min(0),
});

export const getRolePermissionsSchema = z.object({
  roleId: z.string().uuid('Role ID must be a valid UUID'),
});

export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { error?: string; value?: T } {
  try {
    const result = schema.parse(data);
    return { value: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.issues.map(e => e.message).join(', ') };
    }
    return { error: 'Validation error' };
  }
}
