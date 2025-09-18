import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { logger } from '../src/infrastructure/logging';

const prisma = new PrismaClient();

async function main() {
  logger.database('🌱 Iniciando seed de desenvolvimento...');

  // Criar tenant da Groupwork
  const groupworkTenant = await prisma.tenant.upsert({
    where: { cnpj: '08.578.421/0001-06' },
    update: {},
    create: {
      name: 'Groupwork',
      cnpj: '08.578.421/0001-06',
      address:
        'R. Sen. Vergueiro, 167 - Centro, São Caetano do Sul - SP, 09521-320',
      is_active: true,
    },
  });

  logger.success(`✅ Tenant Groupwork criado: ${groupworkTenant.name}`);

  // Criar role de root com acesso total
  let rootRole = await prisma.role.findFirst({
    where: {
      name: 'ROOT',
      tenant_id: groupworkTenant.tenant_id,
    },
  });

  if (!rootRole) {
    rootRole = await prisma.role.create({
      data: {
        name: 'ROOT',
        description: 'Root user with full system access',
        tenant_id: groupworkTenant.tenant_id,
      },
    });
  }

  logger.success('✅ Role ROOT criada');

  // Criar usuário root da Groupwork
  const hashedPassword = await bcrypt.hash('Root@2024', 10);
  const rootUser = await prisma.user.upsert({
    where: { email: 'root@groupwork.com.br' },
    update: {},
    create: {
      name: 'System Root',
      email: 'root@groupwork.com.br',
      password: hashedPassword,
      user_type: 'root',
      first_login: false,
      is_active: true,
      tenant_id: groupworkTenant.tenant_id,
    },
  });

  logger.success(`✅ Root criado: ${rootUser.email}`);

  // Associar role de root ao usuário
  await prisma.userRole.upsert({
    where: {
      user_id_role_id: {
        user_id: rootUser.user_id,
        role_id: rootRole.role_id,
      },
    },
    update: {},
    create: {
      user_id: rootUser.user_id,
      role_id: rootRole.role_id,
    },
  });

  logger.success('✅ Role de root atribuída ao usuário');

  // Criar aplicação principal
  const mainApp = await prisma.application.upsert({
    where: { name: 'MAIN_APP' },
    update: {},
    create: {
      name: 'MAIN_APP',
      displayName: 'Smart Trace Platform',
      description: 'Main application for Smart Trace platform',
      isActive: true,
    },
  });

  logger.success(`✅ Aplicação criada: ${mainApp.displayName}`);

  // Criar aplicações Trace
  const traceApps = [
    {
      name: 'P_TRACE',
      displayName: 'P-Trace',
      description: 'Production Trace - Rastreamento de produção',
    },
    {
      name: 'D_TRACE',
      displayName: 'D-Trace',
      description: 'Development Trace - Rastreamento de desenvolvimento',
    },
    {
      name: 'M_TRACE',
      displayName: 'M-Trace',
      description: 'Manufacturing Trace - Rastreamento de manufatura',
    },
    {
      name: 'E_TRACE',
      displayName: 'E-Trace',
      description: 'Enterprise Trace - Rastreamento empresarial',
    },
  ];

  const createdApps = [mainApp];

  for (const appData of traceApps) {
    const app = await prisma.application.upsert({
      where: { name: appData.name },
      update: {},
      create: {
        name: appData.name,
        displayName: appData.displayName,
        description: appData.description,
        isActive: true,
      },
    });
    createdApps.push(app);
    logger.success(`✅ Aplicação criada: ${app.displayName}`);
  }

  // Criar subscriptions do tenant para todas as aplicações
  for (const app of createdApps) {
    await prisma.tenantSubscription.upsert({
      where: {
        tenantSubscription_id: `${groupworkTenant.tenant_id}_${app.application_id}`,
      },
      update: {},
      create: {
        tenantSubscription_id: `${groupworkTenant.tenant_id}_${app.application_id}`,
        isActive: true,
        subscriptionPlan: 'ENTERPRISE',
        maxUsers: 1000,
        tenant_id: groupworkTenant.tenant_id,
        application_id: app.application_id,
      },
    });
  }

  logger.success('✅ Subscriptions do tenant criadas para todas as aplicações');

  // Criar permissões específicas do sistema para todas as aplicações
  const systemPermissions = [
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
    // Views permissions
    {
      function_name: 'views',
      permission_level: 'read',
      display_name: 'Visualizar Views',
      description: 'Permissão para visualizar views',
    },
    {
      function_name: 'views',
      permission_level: 'write',
      display_name: 'Criar Views',
      description: 'Permissão para criar views',
    },
    {
      function_name: 'views',
      permission_level: 'update',
      display_name: 'Editar Views',
      description: 'Permissão para editar views',
    },
    {
      function_name: 'views',
      permission_level: 'delete',
      display_name: 'Excluir Views',
      description: 'Permissão para excluir views',
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
    // Roles permissions
    {
      function_name: 'roles',
      permission_level: 'read',
      display_name: 'Visualizar Roles',
      description: 'Permissão para visualizar roles',
    },
    {
      function_name: 'roles',
      permission_level: 'write',
      display_name: 'Criar Roles',
      description: 'Permissão para criar roles',
    },
    {
      function_name: 'roles',
      permission_level: 'update',
      display_name: 'Editar Roles',
      description: 'Permissão para editar roles',
    },
    {
      function_name: 'roles',
      permission_level: 'delete',
      display_name: 'Excluir Roles',
      description: 'Permissão para excluir roles',
    },
    // Permissions permissions
    {
      function_name: 'permissions',
      permission_level: 'read',
      display_name: 'Visualizar Permissões',
      description: 'Permissão para visualizar permissões',
    },
    {
      function_name: 'permissions',
      permission_level: 'write',
      display_name: 'Criar Permissões',
      description: 'Permissão para criar permissões',
    },
    {
      function_name: 'permissions',
      permission_level: 'update',
      display_name: 'Editar Permissões',
      description: 'Permissão para editar permissões',
    },
    {
      function_name: 'permissions',
      permission_level: 'delete',
      display_name: 'Excluir Permissões',
      description: 'Permissão para excluir permissões',
    },
    // Tenant permissions
    {
      function_name: 'tenants',
      permission_level: 'read',
      display_name: 'Visualizar Tenants',
      description: 'Permissão para visualizar tenants',
    },
    {
      function_name: 'tenants',
      permission_level: 'write',
      display_name: 'Criar Tenants',
      description: 'Permissão para criar tenants',
    },
    {
      function_name: 'tenants',
      permission_level: 'update',
      display_name: 'Editar Tenants',
      description: 'Permissão para editar tenants',
    },
    {
      function_name: 'tenants',
      permission_level: 'delete',
      display_name: 'Excluir Tenants',
      description: 'Permissão para excluir tenants',
    },
    // Applications permissions
    {
      function_name: 'applications',
      permission_level: 'read',
      display_name: 'Visualizar Aplicações',
      description: 'Permissão para visualizar aplicações',
    },
    {
      function_name: 'applications',
      permission_level: 'write',
      display_name: 'Criar Aplicações',
      description: 'Permissão para criar aplicações',
    },
    {
      function_name: 'applications',
      permission_level: 'update',
      display_name: 'Editar Aplicações',
      description: 'Permissão para editar aplicações',
    },
    {
      function_name: 'applications',
      permission_level: 'delete',
      display_name: 'Excluir Aplicações',
      description: 'Permissão para excluir aplicações',
    },
  ];

  // Criar permissões para todas as aplicações
  for (const app of createdApps) {
    for (const permissionData of systemPermissions) {
      const existingPermission = await prisma.permission.findFirst({
        where: {
          function_name: permissionData.function_name,
          permission_level: permissionData.permission_level,
          application_id: app.application_id,
        },
      });

      if (!existingPermission) {
        await prisma.permission.create({
          data: {
            function_name: permissionData.function_name,
            permission_level: permissionData.permission_level,
            display_name: permissionData.display_name,
            description: permissionData.description,
            application_id: app.application_id,
          },
        });
      }
    }
    logger.success(`✅ Permissões do sistema criadas para ${app.displayName}`);
  }

  logger.success('✅ Permissões do sistema criadas para todas as aplicações');
  logger.success(
    'ℹ️  Nota: O usuário ROOT tem acesso total automaticamente pelo sistema de permissões'
  );

  // Criar view padrão "Dashboard" para o usuário root
  const existingView = await prisma.view.findFirst({
    where: {
      user_id: rootUser.user_id,
      name: 'Dashboard',
    },
  });

  if (!existingView) {
    await prisma.view.create({
      data: {
        name: 'Dashboard',
        user_id: rootUser.user_id,
        tenant_id: groupworkTenant.tenant_id,
        is_default: true,
        is_public: false,
        created_by: rootUser.user_id,
        updated_by: rootUser.user_id,
      },
    });
  }

  logger.success('✅ View padrão "Dashboard" criada para o usuário root');

  logger.success('🎉 Seed de desenvolvimento concluído com sucesso!');
  logger.success('📋 Dados criados:');
  logger.success(
    `   🏢 Tenant: ${groupworkTenant.name} (${groupworkTenant.cnpj})`
  );
  logger.success(`   👤 Root: ${rootUser.email}`);
  logger.success(`   🔑 Senha: Root@2024`);
  logger.success(`   🎯 Acesso: Total (automático pelo sistema de permissões)`);
  logger.success('📱 Aplicações disponíveis:');
  createdApps.forEach(app => {
    logger.success(`   • ${app.displayName} (${app.name})`);
  });
  logger.success('🔐 Permissões do sistema criadas para todos os usuários');
}

main()
  .catch(e => {
    logger.error('❌ Erro durante o seed de desenvolvimento:', {
      error: e.message,
      stack: e.stack,
    });
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
