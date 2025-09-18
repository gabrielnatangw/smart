import { PrismaClient } from '@prisma/client';

export class AdminPermissionService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Verifica se o usuário é o primeiro admin do tenant
   */
  async isFirstAdminOfTenant(
    userId: string,
    tenantId: string
  ): Promise<boolean> {
    try {
      // Verifica se existe algum usuário admin ativo no tenant
      const existingAdmins = await this.prisma.user.findMany({
        where: {
          tenant_id: tenantId,
          user_type: 'admin',
          is_active: true,
          deleted_at: null,
        },
        orderBy: {
          created_at: 'asc',
        },
      });

      // Se não há admins ou se o usuário atual é o primeiro admin
      return (
        existingAdmins.length === 0 || existingAdmins[0].user_id === userId
      );
    } catch (error: any) {
      throw new Error(
        `Failed to check if user is first admin: ${error.message}`
      );
    }
  }

  /**
   * No novo sistema de permissões, admins têm acesso total por padrão
   */
  async grantFullAccessToFirstAdmin(
    userId: string,
    tenantId: string
  ): Promise<void> {
    try {
      const isFirstAdmin = await this.isFirstAdminOfTenant(userId, tenantId);

      if (!isFirstAdmin) {
        return; // Não é o primeiro admin, não faz nada
      }

      // No novo sistema, admins têm acesso total por padrão
      console.log(
        `Admin user ${userId} has full access by default in new permission system`
      );
    } catch (error: any) {
      console.error('Error granting admin access:', error);
      // Não falha a criação do usuário se houver erro nas permissões
    }
  }

  /**
   * Verifica se o usuário tem acesso total (é admin)
   */
  async hasFullAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      // No novo sistema, admins têm acesso total por padrão
      const user = await this.prisma.user.findFirst({
        where: {
          user_id: userId,
          tenant_id: tenantId,
          user_type: 'admin',
          is_active: true,
          deleted_at: null,
        },
      });

      return !!user;
    } catch (error: any) {
      console.error('Error checking admin access:', error);
      return false;
    }
  }

  /**
   * Revoga acesso total (não implementado no novo sistema)
   */
  async revokeFullAccessFromUser(
    userId: string,
    tenantId: string,
    _revokedBy: string
  ): Promise<boolean> {
    try {
      const isFirstAdmin = await this.isFirstAdminOfTenant(userId, tenantId);

      if (isFirstAdmin) {
        throw new Error(
          'Cannot revoke admin access from the first admin of the tenant'
        );
      }

      // No novo sistema, não revogamos permissões de admin
      // Apenas mudamos o tipo de usuário
      console.log(`Admin access cannot be revoked in new permission system`);
      return false;
    } catch (error: any) {
      console.error('Error revoking admin access:', error);
      return false;
    }
  }
}
