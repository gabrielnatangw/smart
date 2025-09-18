import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { PermissionApplicationService } from '../../application/services/PermissionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaUserPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaUserPermissionRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import { UserPermissionController } from '../controllers/UserPermissionController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repositories
const permissionRepository = new PrismaPermissionRepository(prisma);
const userPermissionRepository = new PrismaUserPermissionRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const authRepository = new PrismaAuthenticationRepository(prisma);

// Services
const permissionService = new PermissionApplicationService(
  permissionRepository,
  userPermissionRepository,
  userRepository
);

// Controllers
const userPermissionController = new UserPermissionController(
  permissionService
);

// Middleware
const authMiddleware = new AuthenticationMiddleware(authRepository);

// Apply authentication to all routes
router.use(authMiddleware.requireAuth);

// Routes
router.post('/grant', userPermissionController.grantPermission);
router.post('/revoke', userPermissionController.revokePermission);
router.get('/user/:userId', userPermissionController.getUserPermissions);
router.get(
  '/user/:userId/by-function',
  userPermissionController.getUserPermissionsByFunction
);
router.put('/user/:userId/set', userPermissionController.setUserPermissions);
router.get('/user/:userId/check', userPermissionController.checkPermission);
router.get(
  '/can-create-user-type/:creatorId',
  userPermissionController.canUserCreateUserType
);
router.get(
  '/can-manage-user/:managerId/:targetUserId',
  userPermissionController.canUserManageUser
);
router.get(
  '/can-access-tenant/:userId/:tenantId',
  userPermissionController.canUserAccessTenant
);
router.get('/default', userPermissionController.getDefaultUserPermissions);
router.post('/validate', userPermissionController.validatePermissions);

export default router;
