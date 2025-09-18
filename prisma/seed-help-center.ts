import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedHelpCenter() {
  console.log('🌱 Iniciando seed do Help Center...');

  try {
    // Buscar aplicações existentes (assumindo que existem)
    const applications = await prisma.application.findMany();

    if (applications.length === 0) {
      console.log(
        '⚠️  Nenhuma aplicação encontrada. Criando aplicações de exemplo...'
      );

      // Criar aplicações de exemplo
      const dTraceApp = await prisma.application.create({
        data: {
          name: 'd-trace',
          displayName: 'D-Trace',
          description: 'Sistema de rastreamento de dados',
          isActive: true,
        },
      });

      const pTraceApp = await prisma.application.create({
        data: {
          name: 'p-trace',
          displayName: 'P-Trace',
          description: 'Sistema de rastreamento de produção',
          isActive: true,
        },
      });

      const eTraceApp = await prisma.application.create({
        data: {
          name: 'e-trace',
          displayName: 'E-Trace',
          description: 'Sistema de rastreamento de energia',
          isActive: true,
        },
      });

      const mTraceApp = await prisma.application.create({
        data: {
          name: 'm-trace',
          displayName: 'M-Trace',
          description: 'Sistema de rastreamento de manutenção',
          isActive: true,
        },
      });

      applications.push(dTraceApp, pTraceApp, eTraceApp, mTraceApp);
    }

    // 1. Criar tema de Máquinas
    const machineTheme = await prisma.helpCenterTheme.create({
      data: {
        title: 'Gerenciamento de Máquinas',
        description: 'Aprenda a configurar e gerenciar máquinas no sistema',
        icon_name: 'cog',
        color: '#3B82F6',
        sort_order: 1,
        is_active: true,
      },
    });

    // 2. Criar tema de Módulos
    const moduleTheme = await prisma.helpCenterTheme.create({
      data: {
        title: 'Configuração de Módulos',
        description: 'Configure e gerencie módulos de sensores',
        icon_name: 'cpu',
        color: '#10B981',
        sort_order: 2,
        is_active: true,
      },
    });

    // 3. Criar tema de Sensores
    const sensorTheme = await prisma.helpCenterTheme.create({
      data: {
        title: 'Sensores e Monitoramento',
        description: 'Configure sensores e monitore dados em tempo real',
        icon_name: 'activity',
        color: '#F59E0B',
        sort_order: 3,
        is_active: true,
      },
    });

    // 4. Criar tema de Relatórios
    const reportTheme = await prisma.helpCenterTheme.create({
      data: {
        title: 'Relatórios e Analytics',
        description: 'Gere relatórios e analise dados do sistema',
        icon_name: 'bar-chart-3',
        color: '#8B5CF6',
        sort_order: 4,
        is_active: true,
      },
    });

    // 5. Criar tema de Dashboard
    const dashboardTheme = await prisma.helpCenterTheme.create({
      data: {
        title: 'Dashboard e Visualizações',
        description: 'Configure dashboards e visualizações personalizadas',
        icon_name: 'monitor',
        color: '#EF4444',
        sort_order: 5,
        is_active: true,
      },
    });

    // Associar temas às aplicações
    for (const app of applications) {
      await prisma.helpCenterThemeApplication.createMany({
        data: [
          {
            theme_id: machineTheme.theme_id,
            application_id: app.application_id,
          },
          {
            theme_id: moduleTheme.theme_id,
            application_id: app.application_id,
          },
          {
            theme_id: sensorTheme.theme_id,
            application_id: app.application_id,
          },
          {
            theme_id: reportTheme.theme_id,
            application_id: app.application_id,
          },
          {
            theme_id: dashboardTheme.theme_id,
            application_id: app.application_id,
          },
        ],
      });
    }

    // 6. Criar vídeos para cada tema usando o mesmo link do YouTube
    const videoData = [
      // Vídeos de Máquinas
      {
        title: 'Como Adicionar uma Nova Máquina',
        description:
          'Tutorial completo para adicionar e configurar uma nova máquina no sistema',
        theme_id: machineTheme.theme_id,
        sort_order: 1,
        is_featured: true,
      },
      {
        title: 'Configuração de Parâmetros da Máquina',
        description:
          'Aprenda a configurar parâmetros essenciais como performance máxima e velocidade',
        theme_id: machineTheme.theme_id,
        sort_order: 2,
        is_featured: false,
      },
      {
        title: 'Associando Máquinas a Setores',
        description: 'Como organizar máquinas por setores operacionais',
        theme_id: machineTheme.theme_id,
        sort_order: 3,
        is_featured: false,
      },

      // Vídeos de Módulos
      {
        title: 'Instalação de Módulo de Sensores',
        description:
          'Passo a passo para instalar e configurar um novo módulo de sensores',
        theme_id: moduleTheme.theme_id,
        sort_order: 1,
        is_featured: true,
      },
      {
        title: 'Configuração de Localização do Módulo',
        description: 'Defina país, cidade, setor e planta do módulo',
        theme_id: moduleTheme.theme_id,
        sort_order: 2,
        is_featured: false,
      },
      {
        title: 'Associando Módulo à Máquina',
        description: 'Como vincular um módulo a uma máquina específica',
        theme_id: moduleTheme.theme_id,
        sort_order: 3,
        is_featured: false,
      },

      // Vídeos de Sensores
      {
        title: 'Configuração de Sensor Analógico',
        description:
          'Configure sensores analógicos com escalas, alarmes e calibração',
        theme_id: sensorTheme.theme_id,
        sort_order: 1,
        is_featured: true,
      },
      {
        title: 'Configuração de Sensor Digital',
        description: 'Configure sensores digitais para contadores e frequência',
        theme_id: sensorTheme.theme_id,
        sort_order: 2,
        is_featured: false,
      },
      {
        title: 'Monitoramento em Tempo Real',
        description: 'Visualize dados dos sensores em tempo real no dashboard',
        theme_id: sensorTheme.theme_id,
        sort_order: 3,
        is_featured: false,
      },
      {
        title: 'Configuração de Alarmes',
        description: 'Configure alarmes e notificações para os sensores',
        theme_id: sensorTheme.theme_id,
        sort_order: 4,
        is_featured: false,
      },

      // Vídeos de Relatórios
      {
        title: 'Gerando Relatório de Produção',
        description: 'Crie relatórios detalhados de produção e performance',
        theme_id: reportTheme.theme_id,
        sort_order: 1,
        is_featured: true,
      },
      {
        title: 'Análise de Dados Históricos',
        description: 'Analise tendências e padrões nos dados históricos',
        theme_id: reportTheme.theme_id,
        sort_order: 2,
        is_featured: false,
      },
      {
        title: 'Exportação de Relatórios',
        description:
          'Exporte relatórios em diferentes formatos (PDF, Excel, CSV)',
        theme_id: reportTheme.theme_id,
        sort_order: 3,
        is_featured: false,
      },

      // Vídeos de Dashboard
      {
        title: 'Criando Dashboard Personalizado',
        description: 'Crie dashboards personalizados com gráficos e métricas',
        theme_id: dashboardTheme.theme_id,
        sort_order: 1,
        is_featured: true,
      },
      {
        title: 'Configuração de Gráficos',
        description:
          'Configure diferentes tipos de gráficos (linha, barra, gauge)',
        theme_id: dashboardTheme.theme_id,
        sort_order: 2,
        is_featured: false,
      },
      {
        title: 'Compartilhamento de Dashboards',
        description: 'Compartilhe dashboards com outros usuários da equipe',
        theme_id: dashboardTheme.theme_id,
        sort_order: 3,
        is_featured: false,
      },
    ];

    // Criar todos os vídeos
    for (const video of videoData) {
      const createdVideo = await prisma.helpCenterVideo.create({
        data: {
          title: video.title,
          description: video.description,
          video_platform: 'YOUTUBE',
          external_video_id: '4bJFzyGKpA0',
          external_url: 'https://www.youtube.com/watch?v=4bJFzyGKpA0',
          thumbnail_url:
            'https://img.youtube.com/vi/4bJFzyGKpA0/maxresdefault.jpg',
          duration: 300, // 5 minutos
          sort_order: video.sort_order,
          is_active: true,
          is_featured: video.is_featured,
          theme_id: video.theme_id,
        },
      });

      // Associar vídeo a todas as aplicações
      for (const app of applications) {
        await prisma.helpCenterVideoApplication.create({
          data: {
            video_id: createdVideo.video_id,
            application_id: app.application_id,
          },
        });
      }
    }

    // 7. Criar algumas buscas de exemplo
    const searchTerms = [
      'configurar sensor',
      'adicionar máquina',
      'criar dashboard',
      'gerar relatório',
      'configurar módulo',
      'alarme sensor',
      'dados tempo real',
      'exportar dados',
    ];

    for (const term of searchTerms) {
      await prisma.helpCenterSearch.create({
        data: {
          search_term: term,
          results_count: Math.floor(Math.random() * 10) + 1,
        },
      });
    }

    console.log('✅ Seed do Help Center concluído com sucesso!');
    console.log(`📊 Criados:`);
    console.log(`   - ${applications.length} aplicações`);
    console.log(`   - 5 temas`);
    console.log(`   - ${videoData.length} vídeos`);
    console.log(`   - ${searchTerms.length} buscas de exemplo`);
  } catch (error) {
    console.error('❌ Erro ao executar seed do Help Center:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedHelpCenter()
    .then(() => {
      console.log('🎉 Seed executado com sucesso!');
      process.exit(0);
    })
    .catch(error => {
      console.error('💥 Erro ao executar seed:', error);
      process.exit(1);
    });
}

export { seedHelpCenter };
