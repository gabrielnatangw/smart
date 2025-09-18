import { PrismaClient } from '@prisma/client';
import { Response, Router } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { PermissionLevel } from '../../domain/entities/User';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaUserPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaUserPermissionRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import { UserController } from '../controllers/UserController';
import { auditMiddleware } from '../middleware/auditMiddleware';
import {
  AuthenticatedRequest,
  AuthenticationMiddleware,
} from '../middleware/authenticationMiddleware';
import { PermissionMiddleware } from '../middleware/permissionMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repositories
const userRepository = new PrismaUserRepository(prisma);
const userPermissionRepository = new PrismaUserPermissionRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);
const authRepository = new PrismaAuthenticationRepository(prisma);

// Services
const userService = new UserApplicationService(
  userRepository,
  userPermissionRepository,
  permissionRepository,
  prisma
);

// Controllers
const userController = new UserController(userService);

// Middleware
const authMiddleware = new AuthenticationMiddleware(authRepository);
const permissionService = new PermissionApplicationService(
  permissionRepository,
  userPermissionRepository,
  userRepository
);
const permissionMiddleware = new PermissionMiddleware(permissionService);

// Apply authentication to all routes
router.use(authMiddleware.requireAuth);

// =====================
// Admin Operations (Require admin permissions)
// =====================

// POST /api/users - Criar usuário (Admin only)
router.post(
  '/',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.WRITE,
  }),
  auditMiddleware.auditAction('CREATE', 'USER', { captureBody: true }),
  userController.createUser
);

// GET /api/users - Listar usuários (Admin only)
router.get(
  '/',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.READ,
  }),
  userController.getUsers
);

// GET /api/users/stats - Estatísticas (Admin only)
router.get(
  '/stats',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.READ,
  }),
  userController.getUserStats
);

// GET /api/users/by-email - Buscar por email (Admin only)
router.get(
  '/by-email',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.READ,
  }),
  userController.getUserByEmail
);

// GET /api/users/by-tenant/:tenantId - Buscar por tenant (Admin only)
router.get(
  '/by-tenant/:tenantId',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.READ,
  }),
  userController.getUsersByTenant
);

// GET /api/users/:id - Buscar usuário por ID (Admin only)
router.get(
  '/:id',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.READ,
  }),
  userController.getUserById
);

// PUT /api/users/:id - Atualizar usuário (Admin only)
router.put(
  '/:id',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.UPDATE,
  }),
  auditMiddleware.auditEntityChange('USER', {
    captureOldValues: true,
    captureNewValues: true,
  }),
  userController.updateUser
);

// DELETE /api/users/:id - Deletar usuário (Admin only)
router.delete(
  '/:id',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.DELETE,
  }),
  auditMiddleware.auditAction('DELETE', 'USER'),
  userController.deleteUser
);

// PATCH /api/users/:id/restore - Restaurar usuário (Admin only)
router.patch(
  '/:id/restore',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.UPDATE,
  }),
  userController.restoreUser
);

// PATCH /api/users/:id/activate - Ativar usuário (Admin only)
router.patch(
  '/:id/activate',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.UPDATE,
  }),
  userController.activateUser
);

// PATCH /api/users/:id/deactivate - Desativar usuário (Admin only)
router.patch(
  '/:id/deactivate',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.UPDATE,
  }),
  userController.deactivateUser
);

// =====================
// User Profile Operations (Available for all authenticated users)
// =====================

// GET /api/users/profile/me - Obter perfil do usuário logado
router.get('/profile/me', userController.getMyProfile);

// PUT /api/users/profile/me - Atualizar perfil do usuário logado
router.put('/profile/me', userController.updateMyProfile);

// =====================
// Password Management (Available for all authenticated users)
// =====================

// PATCH /api/users/profile/change-password - Alterar senha do usuário logado
router.patch(
  '/profile/change-password',
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
      }

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual e nova senha são obrigatórias',
        });
      }

      await userService.changePassword(
        userId,
        currentPassword,
        newPassword,
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        message: 'Senha alterada com sucesso',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// =====================
// Admin-only Password Management
// =====================

// PATCH /api/users/:id/reset-password - Resetar senha (Admin only)
router.patch(
  '/:id/reset-password',
  permissionMiddleware.requirePermission({
    functionName: 'users',
    permissionLevel: PermissionLevel.UPDATE,
  }),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { newPassword } = req.body;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        return res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
      }

      if (!newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Nova senha é obrigatória',
        });
      }

      await userService.setPassword(id as string, newPassword, userTenantId);

      res.json({
        success: true,
        message: 'Senha resetada com sucesso',
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);

export default router;
