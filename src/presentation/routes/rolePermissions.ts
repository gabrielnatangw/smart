import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { RolePermissionApplicationService } from '../../application/services/RolePermissionApplicationService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaRolePermissionRepository } from '../../infrastructure/persistence/repositories/PrismaRolePermissionRepository';
import { PrismaRoleRepository } from '../../infrastructure/persistence/repositories/PrismaRoleRepository';
import { RolePermissionController } from '../controllers/RolePermissionController';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import { tenantIsolationMiddleware } from '../middleware/tenantMiddleware';

const router = Router();
const prisma = new PrismaClient();

// Repositórios
const rolePermissionRepository = new PrismaRolePermissionRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);
const roleRepository = new PrismaRoleRepository(prisma);
const authRepository = new PrismaAuthenticationRepository(prisma);

// Services
const rolePermissionService = new RolePermissionApplicationService(
  rolePermissionRepository,
  permissionRepository,
  roleRepository
);

// Controllers
const rolePermissionController = new RolePermissionController(
  rolePermissionService
);

// Middleware
const authMiddleware = new AuthenticationMiddleware(authRepository);
router.use(authMiddleware.requireAuth);
router.use(tenantIsolationMiddleware);

// Rotas
router.post('/:roleId/permissions', (req, res) =>
  rolePermissionController.addPermissionToRole(req, res)
);

router.delete('/:roleId/permissions/:permissionId', (req, res) =>
  rolePermissionController.removePermissionFromRole(req, res)
);

router.get('/:roleId/permissions', (req, res) =>
  rolePermissionController.getRolePermissions(req, res)
);

router.put('/:roleId/permissions', (req, res) =>
  rolePermissionController.updateRolePermissions(req, res)
);

export default router;
