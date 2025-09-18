import { Response } from 'express';

import { UserApplicationService } from '../../application/services/UserApplicationService';
import { AuthenticatedRequest } from '../middleware/authenticationMiddleware';

export class UserController {
  constructor(private userService: UserApplicationService) {}

  // =====================
  // CRUD Operations
  // =====================

  /**
   * @swagger
   * /api/users:
   *   post:
   *     summary: Criar novo usuário
   *     description: Cria um novo usuário no sistema (apenas para administradores)
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *               - email
   *               - password
   *               - userType
   *             properties:
   *               name:
   *                 type: string
   *                 example: "João Silva"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "joao@exemplo.com"
   *               password:
   *                 type: string
   *                 example: "senha123"
   *               userType:
   *                 type: string
   *                 enum: [user, admin]
   *                 example: "user"
   *               isActive:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       201:
   *         description: Usuário criado com sucesso
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
   *                   example: "Usuário criado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Erro na validação dos dados
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Permissão insuficiente
   */
  createUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userData = {
        ...req.body,
        tenantId: req.user?.tenantId,
      };

      const user = await this.userService.createUser(userData);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error creating user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao criar usuário',
      });
    }
  };

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Listar usuários
   *     description: Lista todos os usuários do tenant com paginação (apenas para administradores)
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: Número da página
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 10
   *         description: Número de itens por página
   *       - in: query
   *         name: userType
   *         schema:
   *           type: string
   *           enum: [user, admin]
   *         description: Filtrar por tipo de usuário
   *       - in: query
   *         name: isActive
   *         schema:
   *           type: boolean
   *         description: Filtrar por status ativo
   *     responses:
   *       200:
   *         description: Lista de usuários retornada com sucesso
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
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   *                     pagination:
   *                       type: object
   *                       properties:
   *                         page:
   *                           type: integer
   *                           example: 1
   *                         limit:
   *                           type: integer
   *                           example: 10
   *                         total:
   *                           type: integer
   *                           example: 25
   *                         totalPages:
   *                           type: integer
   *                           example: 3
   *       400:
   *         description: Erro na validação dos parâmetros
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Permissão insuficiente
   */
  getUsers = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const result = await this.userService.getUsers({
        page: Number(page),
        limit: Number(limit),
        ...filters,
        tenantId,
      });

      res.json({
        success: true,
        data: {
          ...result,
          users: result.users?.map(user => user.toSafeObject()) || [],
        },
      });
    } catch (error: any) {
      console.error('Error getting users:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar usuários',
      });
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   get:
   *     summary: Buscar usuário por ID
   *     description: Busca um usuário específico pelo ID (apenas para administradores)
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID único do usuário
   *         example: "d43ee0fb-0c67-42ef-b505-f57207255dfb"
   *     responses:
   *       200:
   *         description: Usuário encontrado com sucesso
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Erro na validação dos parâmetros
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Permissão insuficiente ou usuário não pertence ao tenant
   *       404:
   *         description: Usuário não encontrado
   */
  getUserById = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const user = await this.userService.getUserById(id as string);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      // Verificar se o usuário pertence ao mesmo tenant
      if (user.tenantId !== userTenantId) {
        res.status(403).json({
          success: false,
          message: 'Acesso negado: usuário não pertence ao seu tenant',
        });
        return;
      }

      res.json({
        success: true,
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error getting user by ID:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar usuário',
      });
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   put:
   *     summary: Atualizar usuário
   *     description: Atualiza os dados de um usuário específico (apenas para administradores)
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID único do usuário
   *         example: "d43ee0fb-0c67-42ef-b505-f57207255dfb"
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "João Silva Atualizado"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "joao.novo@exemplo.com"
   *               userType:
   *                 type: string
   *                 enum: [user, admin]
   *                 example: "admin"
   *               isActive:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Usuário atualizado com sucesso
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
   *                   example: "Usuário atualizado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Erro na validação dos dados
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Permissão insuficiente
   *       404:
   *         description: Usuário não encontrado
   */
  updateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const user = await this.userService.updateUser(
        id as string,
        updateData,
        userTenantId
      );

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error updating user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar usuário',
      });
    }
  };

  /**
   * @swagger
   * /api/users/{id}:
   *   delete:
   *     summary: Excluir usuário
   *     description: Exclui um usuário do sistema (soft delete por padrão) (apenas para administradores)
   *     tags: [Usuários]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *         description: ID único do usuário
   *         example: "d43ee0fb-0c67-42ef-b505-f57207255dfb"
   *       - in: query
   *         name: permanent
   *         schema:
   *           type: boolean
   *           default: false
   *         description: Se true, exclui permanentemente (não pode ser restaurado)
   *     responses:
   *       200:
   *         description: Usuário excluído com sucesso
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
   *                   example: "Usuário excluído com sucesso"
   *       400:
   *         description: Erro na validação dos parâmetros
   *       401:
   *         description: Não autenticado
   *       403:
   *         description: Permissão insuficiente
   *       404:
   *         description: Usuário não encontrado
   */
  deleteUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const { permanent = false } = req.query;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      await this.userService.deleteUser(
        id as string,
        userTenantId,
        permanent === 'true'
      );

      res.json({
        success: true,
        message:
          permanent === 'true'
            ? 'Usuário excluído permanentemente'
            : 'Usuário excluído com sucesso',
      });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao excluir usuário',
      });
    }
  };

  // =====================
  // Advanced Operations
  // =====================

  restoreUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      await this.userService.restoreUser(id as string, userTenantId);

      res.json({
        success: true,
        message: 'Usuário restaurado com sucesso',
      });
    } catch (error: any) {
      console.error('Error restoring user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao restaurar usuário',
      });
    }
  };

  activateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const user = await this.userService.activateUser(
        id as string,
        userTenantId
      );

      res.json({
        success: true,
        message: 'Usuário ativado com sucesso',
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error activating user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao ativar usuário',
      });
    }
  };

  deactivateUser = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;
      const userTenantId = req.user?.tenantId;

      if (!userTenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const user = await this.userService.deactivateUser(
        id as string,
        userTenantId
      );

      res.json({
        success: true,
        message: 'Usuário desativado com sucesso',
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error deactivating user:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao desativar usuário',
      });
    }
  };

  // =====================
  // Search Operations
  // =====================

  getUserByEmail = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { email } = req.query;

      if (!email) {
        res.status(400).json({
          success: false,
          message: 'Email é obrigatório',
        });
        return;
      }

      const user = await this.userService.getUserByEmail(email as string);

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error getting user by email:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar usuário por email',
      });
    }
  };

  getUsersByTenant = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { tenantId } = req.params;
      const userTenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(400).json({
          success: false,
          message: 'Tenant ID é obrigatório',
        });
        return;
      }

      // Verificar se o usuário pode acessar este tenant
      if (userTenantId !== tenantId) {
        res.status(403).json({
          success: false,
          message:
            'Acesso negado: não é possível acessar usuários de outro tenant',
        });
        return;
      }

      const users = await this.userService.getUsersByTenant(tenantId);

      res.json({
        success: true,
        data: users.map(user => user.toSafeObject()),
      });
    } catch (error: any) {
      console.error('Error getting users by tenant:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar usuários por tenant',
      });
    }
  };

  // =====================
  // Statistics
  // =====================

  getUserStats = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const tenantId = req.user?.tenantId;

      if (!tenantId) {
        res.status(401).json({
          success: false,
          message: 'Contexto de tenant não encontrado',
        });
        return;
      }

      const stats = await this.userService.getUserStats(tenantId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Error getting user stats:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar estatísticas de usuários',
      });
    }
  };

  // =====================
  // Profile Operations (for regular users)
  // =====================

  /**
   * @swagger
   * /api/users/profile/me:
   *   get:
   *     summary: Obter meu perfil completo
   *     description: Retorna os dados completos do perfil do usuário logado incluindo informações da empresa/tenant
   *     tags: [Perfil do Usuário]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Perfil completo do usuário retornado com sucesso
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
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *                     tenant:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: string
   *                           example: "07696c35-57ba-4d22-afe3-c142addb93e0"
   *                         name:
   *                           type: string
   *                           example: "Groupwork"
   *                         cnpj:
   *                           type: string
   *                           example: "08.578.421/0001-06"
   *                         address:
   *                           type: string
   *                           example: "R. Sen. Vergueiro, 167 - Centro, São Caetano do Sul - SP"
   *                         isActive:
   *                           type: boolean
   *                           example: true
   *                         createdAt:
   *                           type: string
   *                           format: date-time
   *                         updatedAt:
   *                           type: string
   *                           format: date-time
   *       401:
   *         description: Não autenticado
   *       404:
   *         description: Usuário não encontrado
   */
  getMyProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      const userWithTenant =
        await this.userService.getUserWithTenantById(userId);

      if (!userWithTenant) {
        res.status(404).json({
          success: false,
          message: 'Usuário não encontrado',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: userWithTenant.user.toSafeObject(),
          tenant: userWithTenant.tenant,
        },
      });
    } catch (error: any) {
      console.error('Error getting user profile:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Erro ao buscar perfil do usuário',
      });
    }
  };

  /**
   * @swagger
   * /api/users/profile/me:
   *   put:
   *     summary: Atualizar meu perfil
   *     description: Atualiza os dados do perfil do usuário logado (campos restritos)
   *     tags: [Perfil do Usuário]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Meu Nome Atualizado"
   *               email:
   *                 type: string
   *                 format: email
   *                 example: "meu.novo@email.com"
   *             description: Campos que podem ser alterados pelo próprio usuário
   *     responses:
   *       200:
   *         description: Perfil atualizado com sucesso
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
   *                   example: "Perfil atualizado com sucesso"
   *                 data:
   *                   $ref: '#/components/schemas/User'
   *       400:
   *         description: Erro na validação dos dados
   *       401:
   *         description: Não autenticado
   *       404:
   *         description: Usuário não encontrado
   */
  updateMyProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.userId;
      const updateData = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: 'Usuário não autenticado',
        });
        return;
      }

      // Remover campos que não podem ser alterados pelo próprio usuário
      delete updateData.userType;
      delete updateData.tenantId;
      delete updateData.isActive;

      const user = await this.userService.updateUser(
        userId,
        updateData,
        req.user?.tenantId || ''
      );

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: user.toSafeObject(),
      });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Erro ao atualizar perfil',
      });
    }
  };
}
