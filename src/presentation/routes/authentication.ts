import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

import { AuthenticationApplicationService } from '../../application/services/AuthenticationApplicationService';
import { UserApplicationService } from '../../application/services/UserApplicationService';
import { NodemailerEmailService } from '../../infrastructure/external/NodemailerEmailService';
import { PrismaAuthenticationRepository } from '../../infrastructure/persistence/repositories/PrismaAuthenticationRepository';
import { PrismaPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaPermissionRepository';
import { PrismaUserPermissionRepository } from '../../infrastructure/persistence/repositories/PrismaUserPermissionRepository';
import { PrismaUserRepository } from '../../infrastructure/persistence/repositories/PrismaUserRepository';
import { AuthenticationController } from '../controllers/AuthenticationController';
import { auditMiddleware } from '../middleware/auditMiddleware';
import { AuthenticationMiddleware } from '../middleware/authenticationMiddleware';
import { RateLimitMiddleware } from '../middleware/rateLimitMiddleware';
import { SecurityMiddleware } from '../middleware/securityMiddleware';

const router = Router();

// Initialize dependencies
const prisma = new PrismaClient();
const authRepository = new PrismaAuthenticationRepository(prisma);
const userRepository = new PrismaUserRepository(prisma);
const userPermissionRepository = new PrismaUserPermissionRepository(prisma);
const permissionRepository = new PrismaPermissionRepository(prisma);
const emailService = new NodemailerEmailService();

const authService = new AuthenticationApplicationService(
  authRepository,
  emailService
);

const userService = new UserApplicationService(
  userRepository,
  userPermissionRepository,
  permissionRepository,
  prisma
);

const authController = new AuthenticationController(authService, userService);
const authMiddleware = new AuthenticationMiddleware(authRepository);
const rateLimitMiddleware = new RateLimitMiddleware();
const securityMiddleware = new SecurityMiddleware();

// Apply security middleware to all routes
router.use(securityMiddleware.securityHeaders);
router.use(securityMiddleware.sanitizeInput);
router.use(securityMiddleware.requestId);
router.use(securityMiddleware.validateRequestSize());
router.use(securityMiddleware.validateContentType());
router.use(securityMiddleware.blockSuspiciousUserAgents);

// Public routes with rate limiting

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login de usuário
 *     description: Autentica um usuário e retorna tokens de acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas tentativas de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/login',
  rateLimitMiddleware.loginRateLimit,
  auditMiddleware.auditLogin(),
  authController.login
);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Renovar token de acesso
 *     description: Renova o token de acesso usando o refresh token
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token renovado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     accessToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Refresh token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas tentativas de renovação
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/refresh-token',
  rateLimitMiddleware.refreshTokenRateLimit,
  authController.refreshToken
);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Solicitar reset de senha
 *     description: Envia email com link para reset de senha
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: Email de reset enviado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Email de reset enviado com sucesso"
 *       400:
 *         description: Email inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Muitas tentativas de reset
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/forgot-password',
  rateLimitMiddleware.passwordResetRateLimit,
  authController.forgotPassword
);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Resetar senha
 *     description: Define nova senha usando token de reset
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset-token-here"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Senha alterada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Senha alterada com sucesso"
 *       400:
 *         description: Token inválido ou senha fraca
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token expirado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/reset-password',
  rateLimitMiddleware.generalApiRateLimit,
  authController.resetPassword
);

/**
 * @swagger
 * /api/auth/first-login:
 *   post:
 *     summary: Primeiro login
 *     description: Define senha no primeiro acesso
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, newPassword]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Senha definida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Senha definida com sucesso"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/first-login',
  rateLimitMiddleware.generalApiRateLimit,
  authController.firstLogin
);

// Protected routes (authentication required)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout de usuário
 *     description: Invalida o token de acesso atual
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Logout realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout realizado com sucesso"
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/logout',
  rateLimitMiddleware.generalApiRateLimit,
  authMiddleware.requireAuth,
  authController.logout
);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Informações completas do usuário atual
 *     description: Retorna informações completas do usuário autenticado incluindo dados da empresa/tenant
 *     tags: [Autenticação]
 *     security:
 *       - bearerAuth: []
 *       - tenantHeader: []
 *     responses:
 *       200:
 *         description: Informações completas do usuário
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 tenant:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "07696c35-57ba-4d22-afe3-c142addb93e0"
 *                     name:
 *                       type: string
 *                       example: "Groupwork"
 *                     cnpj:
 *                       type: string
 *                       example: "08.578.421/0001-06"
 *                     address:
 *                       type: string
 *                       example: "R. Sen. Vergueiro, 167 - Centro, São Caetano do Sul - SP"
 *                     isActive:
 *                       type: boolean
 *                       example: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me',
  rateLimitMiddleware.generalApiRateLimit,
  authMiddleware.requireAuth,
  authController.me
);

export default router;
