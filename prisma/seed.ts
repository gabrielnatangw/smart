import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { logger } from '../src/infrastructure/logging';
import { seedHelpCenter } from './seed-help-center';

const prisma = new PrismaClient();

async function main() {
  logger.database('🌱 Iniciando seed do banco de dados...');

  const defaultTenant = await prisma.tenant.upsert({
    where: { cnpj: '12345678901234' },
    update: {},
    create: {
      name: 'Default Tenant',
      cnpj: '12345678901234',
      address: 'Default Address',
      is_active: true,
    },
  });

  logger.success(`✅ Tenant padrão criado: ${defaultTenant.name}`);

  let adminRole = await prisma.role.findFirst({
    where: {
      name: 'ADMIN',
      tenant_id: defaultTenant.tenant_id,
    },
  });
  if (!adminRole) {
    adminRole = await prisma.role.create({
      data: {
        name: 'ADMIN',
        description: 'Administrator role with full access',
        tenant_id: defaultTenant.tenant_id,
      },
    });
  }

  let userRole = await prisma.role.findFirst({
    where: {
      name: 'USER',
      tenant_id: defaultTenant.tenant_id,
    },
  });
  if (!userRole) {
    userRole = await prisma.role.create({
      data: {
        name: 'USER',
        description: 'Standard user role',
        tenant_id: defaultTenant.tenant_id,
      },
    });
  }

  logger.success('✅ Roles criadas: ADMIN e USER');

  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@default.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@default.com',
      password: hashedPassword,
      user_type: 'admin',
      first_login: false,
      is_active: true,
      tenant_id: defaultTenant.tenant_id,
    },
  });

  logger.success(`✅ Usuário admin criado: ${adminUser.email}`);

  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: adminUser.user_id,
        role_id: adminRole.role_id,
      },
    },
    update: {},
    create: {
      user_id: adminUser.user_id,
      role_id: adminRole.role_id,
    },
  });

  logger.success('✅ Role de admin atribuída ao usuário');

  const defaultApplication = await prisma.application.upsert({
    where: { name: 'MAIN_APP' },
    update: {},
    create: {
      name: 'MAIN_APP',
      displayName: 'Main Application',
      description: 'Main application module',
      isActive: true,
    },
  });

  logger.success(
    `✅ Aplicação padrão criada: ${defaultApplication.displayName}`
  );

  await prisma.tenantSubscription.upsert({
    where: {
      tenantSubscription_id: `${defaultTenant.tenant_id}_${defaultApplication.application_id}`,
    },
    update: {},
    create: {
      tenantSubscription_id: `${defaultTenant.tenant_id}_${defaultApplication.application_id}`,
      isActive: true,
      subscriptionPlan: 'ENTERPRISE',
      maxUsers: 100,
      tenant_id: defaultTenant.tenant_id,
      application_id: defaultApplication.application_id,
    },
  });

  logger.success('✅ Inscrição do tenant criada');

  const permissions = [
    // Users permissions
    {
      function_name: 'users',
      permission_level: 'read',
      display_name: 'Visualizar Usuários',
      description: 'Permissão para visualizar usuários',
    },
    {
      function_name: 'users',
      permission_level: 'write',
      display_name: 'Criar Usuários',
      description: 'Permissão para criar usuários',
    },
    {
      function_name: 'users',
      permission_level: 'update',
      display_name: 'Editar Usuários',
      description: 'Permissão para editar usuários',
    },
    {
      function_name: 'users',
      permission_level: 'delete',
      display_name: 'Excluir Usuários',
      description: 'Permissão para excluir usuários',
    },
    // Machines permissions
    {
      function_name: 'machines',
      permission_level: 'read',
      display_name: 'Visualizar Máquinas',
      description: 'Permissão para visualizar máquinas',
    },
    {
      function_name: 'machines',
      permission_level: 'write',
      display_name: 'Criar Máquinas',
      description: 'Permissão para criar máquinas',
    },
    {
      function_name: 'machines',
      permission_level: 'update',
      display_name: 'Editar Máquinas',
      description: 'Permissão para editar máquinas',
    },
    {
      function_name: 'machines',
      permission_level: 'delete',
      display_name: 'Excluir Máquinas',
      description: 'Permissão para excluir máquinas',
    },
    // Sensors permissions
    {
      function_name: 'sensors',
      permission_level: 'read',
      display_name: 'Visualizar Sensores',
      description: 'Permissão para visualizar sensores',
    },
    {
      function_name: 'sensors',
      permission_level: 'write',
      display_name: 'Criar Sensores',
      description: 'Permissão para criar sensores',
    },
    {
      function_name: 'sensors',
      permission_level: 'update',
      display_name: 'Editar Sensores',
      description: 'Permissão para editar sensores',
    },
    {
      function_name: 'sensors',
      permission_level: 'delete',
      display_name: 'Excluir Sensores',
      description: 'Permissão para excluir sensores',
    },
    // Modules permissions
    {
      function_name: 'modules',
      permission_level: 'read',
      display_name: 'Visualizar Módulos',
      description: 'Permissão para visualizar módulos',
    },
    {
      function_name: 'modules',
      permission_level: 'write',
      display_name: 'Criar Módulos',
      description: 'Permissão para criar módulos',
    },
    {
      function_name: 'modules',
      permission_level: 'update',
      display_name: 'Editar Módulos',
      description: 'Permissão para editar módulos',
    },
    {
      function_name: 'modules',
      permission_level: 'delete',
      display_name: 'Excluir Módulos',
      description: 'Permissão para excluir módulos',
    },
    // Reports permissions
    {
      function_name: 'reports',
      permission_level: 'read',
      display_name: 'Visualizar Relatórios',
      description: 'Permissão para visualizar relatórios',
    },
    {
      function_name: 'reports',
      permission_level: 'write',
      display_name: 'Gerar Relatórios',
      description: 'Permissão para gerar relatórios',
    },
    // Dashboard permissions
    {
      function_name: 'dashboard',
      permission_level: 'read',
      display_name: 'Visualizar Dashboard',
      description: 'Permissão para visualizar dashboard',
    },
    // Settings permissions
    {
      function_name: 'settings',
      permission_level: 'read',
      display_name: 'Visualizar Configurações',
      description: 'Permissão para visualizar configurações',
    },
    {
      function_name: 'settings',
      permission_level: 'update',
      display_name: 'Editar Configurações',
      description: 'Permissão para editar configurações',
    },
  ];

  for (const permission of permissions) {
    const existingPermission = await prisma.permission.findFirst({
      where: {
        function_name: permission.function_name,
        permission_level: permission.permission_level,
        application_id: defaultApplication.application_id,
      },
    });
    if (!existingPermission) {
      await prisma.permission.create({
        data: {
          function_name: permission.function_name,
          permission_level: permission.permission_level,
          display_name: permission.display_name,
          description: permission.description,
          application_id: defaultApplication.application_id,
        },
      });
    }
  }

  logger.success('✅ Permissões padrão criadas');

  // Executar seed do Help Center
  logger.database('🌱 Executando seed do Help Center...');
  await seedHelpCenter();

  logger.success('🎉 Seed do banco de dados concluído com sucesso!');
}

main()
  .catch(e => {
    logger.error('❌ Erro durante o seed:', {
      error: e.message,
      stack: e.stack,
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
