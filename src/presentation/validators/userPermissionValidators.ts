import { z } from 'zod';

// Base schemas
const uuidSchema = z.string().uuid('ID deve ser um UUID válido');

const dateSchema = z
  .union([z.string().datetime('Data deve estar no formato ISO 8601'), z.date()])
  .transform(val => (typeof val === 'string' ? new Date(val) : val));

// Create UserPermission Schema
export const createUserPermissionSchema = z.object({
  userId: uuidSchema,
  permissionId: uuidSchema,
  granted: z.boolean().optional().default(true),
  grantedBy: z.string().optional(),
});

// Update UserPermission Schema
export const updateUserPermissionSchema = z.object({
  granted: z.boolean().optional(),
  grantedBy: z.string().optional(),
});

// Grant Permission Schema
export const grantPermissionSchema = z.object({
  userId: uuidSchema,
  permissionId: uuidSchema,
  grantedBy: z.string().optional(),
});

// Revoke Permission Schema
export const revokePermissionSchema = z.object({
  userId: uuidSchema,
  permissionId: uuidSchema,
  revokedBy: z.string().optional(),
});

// Bulk Grant Permissions Schema
export const bulkGrantPermissionsSchema = z.object({
  userId: uuidSchema,
  permissionIds: z
    .array(uuidSchema)
    .min(1, 'Pelo menos uma permissão deve ser fornecida'),
  grantedBy: z.string().optional(),
});

// Bulk Revoke Permissions Schema
export const bulkRevokePermissionsSchema = z.object({
  userId: uuidSchema,
  permissionIds: z
    .array(uuidSchema)
    .min(1, 'Pelo menos uma permissão deve ser fornecida'),
  revokedBy: z.string().optional(),
});

// Replace User Permissions Schema
export const replaceUserPermissionsSchema = z.object({
  userId: uuidSchema,
  permissionIds: z.array(uuidSchema),
  grantedBy: z.string().optional(),
});

// Module Permissions Schema
export const modulePermissionsSchema = z.object({
  userId: uuidSchema,
  module: z.string().min(1, 'Módulo é obrigatório'),
  grantedBy: z.string().optional(),
});

// Clone User Permissions Schema
export const cloneUserPermissionsSchema = z.object({
  fromUserId: uuidSchema,
  toUserId: uuidSchema,
  grantedBy: z.string().optional(),
});

// Transfer User Permissions Schema
export const transferUserPermissionsSchema = z.object({
  fromUserId: uuidSchema,
  toUserId: uuidSchema,
  transferredBy: z.string().optional(),
});

// Search UserPermissions Schema
export const searchUserPermissionsSchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  search: z.string().optional(),
  granted: z
    .union([
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
      z.boolean(),
    ])
    .optional(),
  userId: uuidSchema.optional(),
  permissionId: uuidSchema.optional(),
  module: z.string().optional(),
  grantedBy: z.string().optional(),
  grantedAfter: dateSchema.optional(),
  grantedBefore: dateSchema.optional(),
  sortBy: z
    .enum([
      'created_at',
      'updated_at',
      'granted',
      'user_name',
      'permission_name',
      'module',
    ])
    .optional()
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// User Permissions Query Schema
export const userPermissionsQuerySchema = z.object({
  userId: uuidSchema,
  includeRevoked: z
    .union([
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
      z.boolean(),
    ])
    .optional()
    .default(false),
});

// Permission Users Query Schema
export const permissionUsersQuerySchema = z.object({
  permissionId: uuidSchema,
  onlyGranted: z
    .union([
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
      z.boolean(),
    ])
    .optional()
    .default(true),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
});

// Check Permission Schema
export const checkPermissionSchema = z
  .object({
    userId: uuidSchema,
    permissionId: uuidSchema.optional(),
    permissionName: z.string().optional(),
  })
  .refine(data => data.permissionId || data.permissionName, {
    message: 'Pelo menos permissionId ou permissionName deve ser fornecido',
    path: ['permissionId'],
  });

// Recent Activity Query Schema
export const recentActivityQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).optional().default(7),
  type: z.enum(['granted', 'revoked', 'both']).optional().default('both'),
});

// Permission Usage Report Schema
export const permissionUsageReportSchema = z.object({
  permissionId: uuidSchema.optional(),
  module: z.string().optional(),
  includeInactive: z
    .union([
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
      z.boolean(),
    ])
    .optional()
    .default(false),
});

// Cleanup Duplicates Schema
export const cleanupDuplicatesSchema = z.object({
  dryRun: z
    .union([
      z.literal('true').transform(() => true),
      z.literal('false').transform(() => false),
      z.boolean(),
    ])
    .optional()
    .default(true),
});

// User Module Permissions Query Schema
export const userModulePermissionsSchema = z.object({
  userId: uuidSchema,
  module: z.string().min(1, 'Módulo é obrigatório'),
});

// Validation middleware helper
export const validateRequest = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      // Merge params, query, and body for validation
      const dataToValidate = {
        ...req.params,
        ...req.query,
        ...req.body,
      };

      const validatedData = schema.parse(dataToValidate);

      // Replace req properties with validated data
      req.validatedData = validatedData;
      req.params = { ...req.params, ...(validatedData as Record<string, any>) };
      req.query = { ...req.query, ...(validatedData as Record<string, any>) };
      req.body = { ...req.body, ...(validatedData as Record<string, any>) };

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Dados de entrada inválidos',
          errors:
            (error as any).errors?.map((err: any) => ({
              field: err.path?.join('.') || '',
              message: err.message || 'Erro de validação',
            })) || [],
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
      });
    }
  };
};

// Export validation middleware for each schema
export const validateCreateUserPermission = validateRequest(
  createUserPermissionSchema
);
export const validateUpdateUserPermission = validateRequest(
  updateUserPermissionSchema
);
export const validateGrantPermission = validateRequest(grantPermissionSchema);
export const validateRevokePermission = validateRequest(revokePermissionSchema);
export const validateBulkGrantPermissions = validateRequest(
  bulkGrantPermissionsSchema
);
export const validateBulkRevokePermissions = validateRequest(
  bulkRevokePermissionsSchema
);
export const validateReplaceUserPermissions = validateRequest(
  replaceUserPermissionsSchema
);
export const validateModulePermissions = validateRequest(
  modulePermissionsSchema
);
export const validateCloneUserPermissions = validateRequest(
  cloneUserPermissionsSchema
);
export const validateTransferUserPermissions = validateRequest(
  transferUserPermissionsSchema
);
export const validateSearchUserPermissions = validateRequest(
  searchUserPermissionsSchema
);
export const validateUserPermissionsQuery = validateRequest(
  userPermissionsQuerySchema
);
export const validatePermissionUsersQuery = validateRequest(
  permissionUsersQuerySchema
);
export const validateCheckPermission = validateRequest(checkPermissionSchema);
export const validateRecentActivityQuery = validateRequest(
  recentActivityQuerySchema
);
export const validatePermissionUsageReport = validateRequest(
  permissionUsageReportSchema
);
export const validateCleanupDuplicates = validateRequest(
  cleanupDuplicatesSchema
);
export const validateUserModulePermissions = validateRequest(
  userModulePermissionsSchema
);
