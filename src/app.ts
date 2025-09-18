import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import { createServer } from 'http';

import { DynamicMqttSubscribeService } from './application/services/DynamicMqttSubscribeService';
import { HelpCenterSearchApplicationService } from './application/services/HelpCenterSearchApplicationService';
import { HelpCenterThemeApplicationService } from './application/services/HelpCenterThemeApplicationService';
import { HelpCenterUserViewApplicationService } from './application/services/HelpCenterUserViewApplicationService';
import { HelpCenterVideoApplicationService } from './application/services/HelpCenterVideoApplicationService';
import { ModuleApplicationService } from './application/services/ModuleApplicationService';
import { MqttApplicationService } from './application/services/MqttApplicationService';
import { SensorApplicationService } from './application/services/SensorApplicationService';
import { SensorDataApplicationService } from './application/services/SensorDataApplicationService';
import { SocketApplicationService } from './application/services/SocketApplicationService';
import { ViewApplicationService } from './application/services/ViewApplicationService';
import { GetUniqueMqttTopicsUseCase } from './application/use-cases/GetUniqueMqttTopicsUseCase';
import validateEnvironment from './config/env.validation';
import {
  Logger,
  initializeLoggerFromEnv,
  logger,
} from './infrastructure/logging';
import { createDualMqttService } from './infrastructure/mqtt';
import { DatabaseInitializer } from './infrastructure/persistence/DatabaseInitializer';
import { PrismaHelpCenterSearchRepository } from './infrastructure/persistence/repositories/PrismaHelpCenterSearchRepository';
import { PrismaHelpCenterThemeRepository } from './infrastructure/persistence/repositories/PrismaHelpCenterThemeRepository';
import { PrismaHelpCenterUserViewRepository } from './infrastructure/persistence/repositories/PrismaHelpCenterUserViewRepository';
import { PrismaHelpCenterVideoRepository } from './infrastructure/persistence/repositories/PrismaHelpCenterVideoRepository';
import { PrismaMachineRepository } from './infrastructure/persistence/repositories/PrismaMachineRepository';
import { PrismaModuleRepository } from './infrastructure/persistence/repositories/PrismaModuleRepository';
import { PrismaSensorCurrentValueRepository } from './infrastructure/persistence/repositories/PrismaSensorCurrentValueRepository';
import { PrismaSensorDataRepository } from './infrastructure/persistence/repositories/PrismaSensorDataRepository';
import { PrismaSensorRepository } from './infrastructure/persistence/repositories/PrismaSensorRepository';
import { PrismaViewCardRepository } from './infrastructure/persistence/repositories/PrismaViewCardRepository';
import { PrismaViewRepository } from './infrastructure/persistence/repositories/PrismaViewRepository';
import { createSocketService } from './infrastructure/socket';
import { HelpCenterSearchController } from './presentation/controllers/HelpCenterSearchController';
import { HelpCenterThemeController } from './presentation/controllers/HelpCenterThemeController';
import { HelpCenterUserViewController } from './presentation/controllers/HelpCenterUserViewController';
import { HelpCenterVideoController } from './presentation/controllers/HelpCenterVideoController';
import { SensorDataController } from './presentation/controllers/SensorDataController';
import { ViewController } from './presentation/controllers/ViewController';
import {
  authLoggingMiddleware,
  errorLoggingMiddleware,
  loggingMiddleware,
} from './presentation/middleware/loggingMiddleware';
import analogSensorsRouter from './presentation/routes/analogSensors';
import applicationsRouter from './presentation/routes/applications';
import auditLogsRouter from './presentation/routes/auditLogs';
import authenticationRouter from './presentation/routes/authentication';
import categoriesResponsibleRouter from './presentation/routes/categoriesResponsible';
import digitalSensorsRouter from './presentation/routes/digitalSensors';
import eventDescriptionsRouter from './presentation/routes/eventDescriptions';
import { healthRouter } from './presentation/routes/health';
// Help Center imports
import { createHelpCenterRoutes } from './presentation/routes/helpCenter';
import machinesRouter from './presentation/routes/machines';
import measurementUnitsRouter from './presentation/routes/measurementUnits';
import modulesRouter from './presentation/routes/modules';
import { mqttRouter } from './presentation/routes/mqtt';
import permissionsRouter from './presentation/routes/permissions';
import processOrdersRouter from './presentation/routes/processOrders';
import productOrdersRouter from './presentation/routes/productOrders';
import responsibleRouter from './presentation/routes/responsible';
import rolePermissionsRouter from './presentation/routes/rolePermissions';
import rolesRouter from './presentation/routes/roles';
import sensorsRouter from './presentation/routes/sensors';
import shiftsRouter from './presentation/routes/shifts';
import { socketRouter } from './presentation/routes/socket';
import stopCausesRouter from './presentation/routes/stopCauses';
import swaggerRouter from './presentation/routes/swagger';
import tenantSubscriptionsRouter from './presentation/routes/tenantSubscriptions';
import tenantsRouter from './presentation/routes/tenants';
import userPermissionsRouter from './presentation/routes/userPermissions';
import usersRouter from './presentation/routes/users';
import viewsRouter, { setViewControllers } from './presentation/routes/views';

// Initialize logger with environment configuration
const loggerConfig = initializeLoggerFromEnv();
Logger.configure(loggerConfig);

// Validate environment variables before starting the application
validateEnvironment();

// Função para verificar variáveis de ambiente
function checkEnvironmentVariables() {
  console.log('\n' + '='.repeat(80));
  console.log('🔍 VERIFICAÇÃO DE VARIÁVEIS DE AMBIENTE');
  console.log('='.repeat(80));

  // Cores para o terminal
  const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };

  // Variáveis obrigatórias
  const requiredVars = {
    NODE_ENV: 'Ambiente de execução',
    PORT: 'Porta do servidor',
    HOST: 'Host do servidor',
    DATABASE_URL: 'URL de conexão com o banco de dados',
    JWT_SECRET: 'Chave secreta para JWT',
    JWT_REFRESH_SECRET: 'Chave secreta para refresh token',
    JWT_ACCESS_TOKEN_EXPIRY: 'Tempo de expiração do access token',
    JWT_REFRESH_TOKEN_EXPIRY: 'Tempo de expiração do refresh token',
    MQTT_HOST: 'Host do broker MQTT',
    MQTT_USERNAME: 'Usuário do MQTT',
    MQTT_PASSWORD: 'Senha do MQTT',
    MQTT_PROTOCOL: 'Protocolo MQTT',
    MQTT_PORT: 'Porta do MQTT',
    MQTT_CLIENT_ID: 'ID do cliente MQTT',
    SOCKET_IO_PORT: 'Porta do Socket.IO',
    EMAIL_FROM: 'Email remetente',
    EMAIL_AUTH_USER: 'Usuário de autenticação do email',
    CORS_ORIGIN: 'Origem permitida para CORS',
  };

  // Variáveis opcionais importantes
  const optionalVars = {
    MQTTS_HOST: 'Host do broker MQTTS',
    MQTTS_USERNAME: 'Usuário do MQTTS',
    MQTTS_PASSWORD: 'Senha do MQTTS',
    MQTTS_PORT: 'Porta do MQTTS',
    MQTTS_CA_CERT_PATH: 'Caminho do certificado CA',
    USE_CLOUD_SQL: 'Usar Cloud SQL',
    PROD_DB_HOST: 'Host do banco de produção',
    PROD_DB_USERNAME: 'Usuário do banco de produção',
    PROD_DB_PASSWORD: 'Senha do banco de produção',
    PROD_DB_DATABASE: 'Nome do banco de produção',
  };

  let requiredPresent = 0;
  const requiredTotal = Object.keys(requiredVars).length;
  let optionalPresent = 0;
  const optionalTotal = Object.keys(optionalVars).length;

  console.log(
    `\n${colors.bold}${colors.white}📋 VARIÁVEIS OBRIGATÓRIAS${colors.reset}`
  );
  Object.entries(requiredVars).forEach(([key, description]) => {
    const isPresent = process.env[key] && process.env[key] !== '';
    const status = isPresent ? `${colors.green}✅` : `${colors.red}❌`;
    const type = `${colors.red}[OBRIGATÓRIA]${colors.reset}`;

    console.log(`  ${status} ${type} ${colors.bold}${key}${colors.reset}`);
    console.log(`      ${colors.white}${description}${colors.reset}`);

    if (isPresent) {
      requiredPresent++;
      console.log(`      ${colors.green}✓ Presente${colors.reset}`);
    } else {
      console.log(`      ${colors.red}✗ Ausente${colors.reset}`);
    }
    console.log();
  });

  console.log(
    `\n${colors.bold}${colors.white}📋 VARIÁVEIS OPCIONAIS IMPORTANTES${colors.reset}`
  );
  Object.entries(optionalVars).forEach(([key, description]) => {
    const isPresent = process.env[key] && process.env[key] !== '';
    const status = isPresent ? `${colors.green}✅` : `${colors.yellow}⚠️`;
    const type = `${colors.yellow}[OPCIONAL]${colors.reset}`;

    console.log(`  ${status} ${type} ${colors.bold}${key}${colors.reset}`);
    console.log(`      ${colors.white}${description}${colors.reset}`);

    if (isPresent) {
      optionalPresent++;
      console.log(`      ${colors.green}✓ Presente${colors.reset}`);
    } else {
      console.log(`      ${colors.yellow}⚠ Ausente${colors.reset}`);
    }
    console.log();
  });

  // Resumo
  const requiredPercentage = ((requiredPresent / requiredTotal) * 100).toFixed(
    1
  );
  const optionalPercentage = ((optionalPresent / optionalTotal) * 100).toFixed(
    1
  );

  console.log(`${colors.bold}${colors.cyan}📊 RESUMO${colors.reset}`);
  console.log(
    `${colors.green}✅ Obrigatórias: ${requiredPresent}/${requiredTotal} (${requiredPercentage}%)${colors.reset}`
  );
  console.log(
    `${colors.yellow}📝 Opcionais: ${optionalPresent}/${optionalTotal} (${optionalPercentage}%)${colors.reset}`
  );

  // Status geral
  if (requiredPercentage === '100.0') {
    console.log(
      `${colors.green}🎉 Status: Excelente - Todas as variáveis obrigatórias configuradas!${colors.reset}`
    );
  } else if (requiredPercentage >= '90.0') {
    console.log(
      `${colors.yellow}⚠️ Status: Bom - Algumas variáveis obrigatórias faltando${colors.reset}`
    );
  } else {
    console.log(
      `${colors.red}❌ Status: Crítico - Muitas variáveis obrigatórias faltando${colors.reset}`
    );
  }

  console.log('='.repeat(80) + '\n');
}

async function initializeApplication() {
  // Verificar variáveis de ambiente
  checkEnvironmentVariables();

  const app = express();
  const httpServer = createServer(app);
  const PORT = process.env.PORT || 3000;

  // Initialize services
  const mqttService = createDualMqttService();
  const mqttAppService = new MqttApplicationService(mqttService);
  const socketService = createSocketService(undefined, mqttService); // Socket.IO em porta separada
  const socketAppService = new SocketApplicationService(socketService);

  // Initialize database connection (Cloud SQL or Local)
  const databaseInitializer = DatabaseInitializer.getInstance();
  const prisma = await databaseInitializer.initialize();
  const moduleRepository = new PrismaModuleRepository(prisma);

  // Initialize repositories for Views
  const viewRepository = new PrismaViewRepository(prisma);
  const viewCardRepository = new PrismaViewCardRepository(prisma);
  const sensorDataRepository = new PrismaSensorDataRepository(prisma);
  const sensorCurrentValueRepository = new PrismaSensorCurrentValueRepository(
    prisma
  );
  const sensorRepository = new PrismaSensorRepository(prisma);
  const machineRepository = new PrismaMachineRepository(prisma);

  // Initialize Help Center repositories
  const helpCenterThemeRepository = new PrismaHelpCenterThemeRepository(prisma);
  const helpCenterVideoRepository = new PrismaHelpCenterVideoRepository(prisma);
  const helpCenterUserViewRepository = new PrismaHelpCenterUserViewRepository(
    prisma
  );
  const helpCenterSearchRepository = new PrismaHelpCenterSearchRepository(
    prisma
  );

  // Initialize Help Center services
  const helpCenterThemeService = new HelpCenterThemeApplicationService(
    helpCenterThemeRepository
  );
  const helpCenterVideoService = new HelpCenterVideoApplicationService(
    helpCenterVideoRepository
  );
  const helpCenterUserViewService = new HelpCenterUserViewApplicationService(
    helpCenterUserViewRepository
  );
  const helpCenterSearchService = new HelpCenterSearchApplicationService(
    helpCenterSearchRepository
  );

  // Initialize Help Center controllers
  const helpCenterThemeController = new HelpCenterThemeController(
    helpCenterThemeService
  );
  const helpCenterVideoController = new HelpCenterVideoController(
    helpCenterVideoService
  );
  const helpCenterUserViewController = new HelpCenterUserViewController(
    helpCenterUserViewService
  );
  const helpCenterSearchController = new HelpCenterSearchController(
    helpCenterSearchService
  );

  // Initialize dynamic MQTT services
  const getUniqueTopicsUseCase = new GetUniqueMqttTopicsUseCase(
    moduleRepository
  );
  const dynamicMqttService = new DynamicMqttSubscribeService(
    mqttService,
    getUniqueTopicsUseCase,
    socketService
  );

  // Initialize View services
  const viewService = new ViewApplicationService(
    viewRepository,
    viewCardRepository,
    sensorCurrentValueRepository,
    sensorRepository,
    moduleRepository,
    machineRepository
  );

  const sensorDataService = new SensorDataApplicationService(
    sensorDataRepository,
    sensorCurrentValueRepository
  );

  // Initialize View controllers
  const viewController = new ViewController(viewService, sensorDataService);
  const sensorDataController = new SensorDataController(sensorDataService);

  // Set controllers for routes
  setViewControllers(viewController, sensorDataController);

  // Make services available globally
  app.locals.mqttService = mqttService;
  app.locals.mqttAppService = mqttAppService;
  app.locals.socketService = socketService;
  app.locals.socketAppService = socketAppService;
  app.locals.dynamicMqttService = dynamicMqttService;

  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          ...helmet.contentSecurityPolicy.getDefaultDirectives(),
          'script-src': [
            "'self'",
            "'unsafe-inline'",
            'http://localhost:3001',
            'https://localhost:3001',
          ],
          'script-src-attr': ["'unsafe-inline'"],
          'connect-src': [
            "'self'",
            'ws:',
            'wss:',
            'http://localhost:3001',
            'https://localhost:3001',
            'http://127.0.0.1:3001',
            'https://127.0.0.1:3001',
          ],
          'default-src': [
            "'self'",
            'ws:',
            'wss:',
            'http://localhost:*',
            'https://localhost:*',
          ],
        },
      },
    })
  );
  app.use(cors());
  app.use(express.json());

  // Add logging middlewares
  app.use(loggingMiddleware);
  app.use(authLoggingMiddleware);

  // Serve static files
  app.use(express.static('public'));

  app.use('/api/health', healthRouter);

  // Rota de health check para compatibilidade (sem /api)
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      message: 'API is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    });
  });

  // Rota de teste MQTT sem autenticação
  app.get('/api/mqtt-test', (req, res) => {
    try {
      const mqttAppService = req.app.locals
        .mqttAppService as MqttApplicationService;
      const status = mqttAppService.getConnectionStatus();

      res.json({
        status: 'OK',
        mqtt: {
          connected: status.connected,
          reconnecting: status.reconnecting,
          lastConnected: status.lastConnected,
          lastDisconnected: status.lastDisconnected,
          reconnectAttempts: status.reconnectAttempts,
          subscriptions: status.subscriptions,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: 'Failed to get MQTT status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Nova rota para status duplo MQTT + MQTTS
  app.get('/api/mqtt-dual-status', (req, res) => {
    try {
      const mqttService = req.app.locals.mqttService as any;
      const dualStatus = mqttService.getDualStatus();

      res.json({
        status: 'OK',
        mqtt: {
          connected: dualStatus.mqtt.connected,
          reconnecting: dualStatus.mqtt.reconnecting,
          lastConnected: dualStatus.mqtt.lastConnected,
          lastDisconnected: dualStatus.mqtt.lastDisconnected,
          reconnectAttempts: dualStatus.mqtt.reconnectAttempts,
          subscriptions: dualStatus.mqtt.subscriptions,
        },
        mqtts: {
          connected: dualStatus.mqtts.connected,
          reconnecting: dualStatus.mqtts.reconnecting,
          lastConnected: dualStatus.mqtts.lastConnected,
          lastDisconnected: dualStatus.mqtts.lastDisconnected,
          reconnectAttempts: dualStatus.mqtts.reconnectAttempts,
          subscriptions: dualStatus.mqtts.subscriptions,
        },
        summary: {
          anyConnected: dualStatus.anyConnected,
          bothConnected: dualStatus.bothConnected,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: 'Failed to get dual MQTT status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Rota para verificar tópicos dinâmicos subscritos
  app.get('/api/mqtt-dynamic-topics', (req, res) => {
    try {
      const topics = dynamicMqttService.getSubscribedTopics();
      const count = dynamicMqttService.getSubscribedTopicsCount();

      res.json({
        status: 'OK',
        dynamicMqtt: {
          subscribedTopics: topics,
          totalTopics: count,
          isDynamic: true,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: 'Failed to get dynamic MQTT topics',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Rota para testar publicação MQTT
  app.post('/api/mqtt-test-publish', async (req, res) => {
    try {
      const mqttAppService = req.app.locals
        .mqttAppService as MqttApplicationService;

      const testTopic = 'gw/br_scs/lab/teste/vpak-500/sensorConfig';

      // Usar dados customizados se fornecidos, senão usar dados padrão
      let testMessage;
      if (req.body.customData) {
        testMessage = {
          ...req.body.customData,
          timestamp: new Date().toISOString(),
        };
      } else {
        testMessage = {
          id: 'test-sensor-' + Date.now(),
          sensorType: 1,
          name: 'Teste MQTT via API',
          tenant_id: 'test-tenant',
          timestamp: new Date().toISOString(),
        };
      }

      console.log('📤 Testando publicação MQTT...');
      console.log('📋 Tópico:', testTopic);
      console.log('📋 Mensagem:', JSON.stringify(testMessage, null, 2));

      // Publicar diretamente no tópico correto
      await mqttAppService.publishToTopic(
        testTopic,
        JSON.stringify(testMessage)
      );

      res.json({
        status: 'OK',
        message: 'Mensagem MQTT publicada com sucesso!',
        topic: testTopic,
        payload: testMessage,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Erro ao publicar MQTT:', error);
      res.status(500).json({
        status: 'Error',
        message: 'Failed to publish MQTT message',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Rota para teste MQTTS específico
  app.get('/api/mqtts-test', (req, res) => {
    try {
      const mqttService = req.app.locals.mqttService as any;
      const isMqttsConnected = mqttService.isMqttsConnected();
      const mqttsStatus = mqttService.getMqttsService().getStatus();

      res.json({
        status: 'OK',
        mqtts: {
          connected: isMqttsConnected,
          reconnecting: mqttsStatus.reconnecting,
          lastConnected: mqttsStatus.lastConnected,
          lastDisconnected: mqttsStatus.lastDisconnected,
          reconnectAttempts: mqttsStatus.reconnectAttempts,
          subscriptions: mqttsStatus.subscriptions,
        },
        message: isMqttsConnected
          ? 'MQTTS conectado com sucesso!'
          : 'MQTTS não está conectado',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({
        status: 'Error',
        message: 'Failed to get MQTTS status',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      });
    }
  });

  app.use('/api/mqtt', mqttRouter);
  app.use('/api/socket', socketRouter);
  app.use('/api/tenants', tenantsRouter);
  app.use('/api/machines', machinesRouter);
  app.use('/api/modules', modulesRouter);
  app.use('/api/sensors', sensorsRouter);
  app.use('/api/analog-sensors', analogSensorsRouter);
  app.use('/api/digital-sensors', digitalSensorsRouter);
  app.use('/api/measurement-units', measurementUnitsRouter);
  app.use('/api/roles', rolesRouter);
  app.use('/api/role-permissions', rolePermissionsRouter);
  app.use('/api/auth', authenticationRouter);
  app.use('/api/product-orders', productOrdersRouter);
  app.use('/api/process-orders', processOrdersRouter);
  app.use('/api/shifts', shiftsRouter);
  app.use('/api/stop-causes', stopCausesRouter);
  app.use('/api/categories-responsible', categoriesResponsibleRouter);
  app.use('/api/responsible', responsibleRouter);
  app.use('/api/event-descriptions', eventDescriptionsRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/tenant-subscriptions', tenantSubscriptionsRouter);
  app.use('/api/permissions', permissionsRouter);
  app.use('/api/user-permissions', userPermissionsRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/views', viewsRouter);
  app.use('/api/audit-logs', auditLogsRouter);
  app.use('/api/activities', auditLogsRouter);

  // Help Center routes
  const helpCenterRoutes = createHelpCenterRoutes(
    helpCenterThemeController,
    helpCenterVideoController,
    helpCenterUserViewController,
    helpCenterSearchController
  );
  app.use('/api/help-center', helpCenterRoutes);

  // Configure services with MQTT AFTER loading routes
  SensorApplicationService.setMqttService(mqttService);
  ModuleApplicationService.setMqttService(mqttService);

  // Rota separada para view-cards (para coincidir com frontend)
  app.use('/api/view-cards', (req, res, next) => {
    // Redirecionar para a rota de views/cards
    req.url = '/cards' + req.url;
    viewsRouter(req, res, next);
  });

  app.use('/api', swaggerRouter);

  // Handle favicon request
  app.get('/favicon.ico', (_req, res) => {
    res.status(204).end();
  });

  // Add error logging middleware (must be last)
  app.use(errorLoggingMiddleware);

  // Initialize services
  Promise.all([mqttAppService.initialize(), socketAppService.initialize()])
    .then(async () => {
      logger.startup('Todos os serviços básicos inicializados com sucesso');

      // Initialize dynamic MQTT subscriptions
      try {
        await dynamicMqttService.initializeDynamicSubscriptions();
        logger.mqtt('Sistema MQTT dinâmico inicializado com sucesso');
      } catch (error) {
        logger.error('Falha ao inicializar MQTT dinâmico', {
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    })
    .catch(error => {
      logger.error('Falha ao inicializar serviços', { error: error.message });
    });

  // Socket.IO is already initialized via socketAppService.initialize() above

  httpServer.listen(PORT, () => {
    logger.startup(`Servidor rodando na porta ${PORT}`);
    logger.socket(
      `Servidor Socket.IO pronto na porta ${PORT} (compartilhada com HTTP)`
    );
  });
}

// Start the application
initializeApplication().catch(error => {
  console.error('❌ Erro fatal ao inicializar aplicação:', error);
  process.exit(1);
});
