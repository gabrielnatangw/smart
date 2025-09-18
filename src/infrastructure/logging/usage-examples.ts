import { LogLevel, logger } from './index';

// ============================================================================
// EXEMPLOS DE USO DO SISTEMA DE LOGGING
// ============================================================================

export class LoggingExamples {
  // Exemplo 1: Logs básicos em diferentes níveis
  static basicLogging() {
    logger.info('=== EXEMPLO 1: LOGS BÁSICOS ===');

    logger.error('Erro crítico que precisa de atenção imediata');
    logger.warn('Aviso sobre configuração que pode causar problemas');
    logger.info('Informação geral sobre o estado da aplicação');
    logger.debug('Debug detalhado para desenvolvimento');
    logger.verbose('Log muito detalhado para troubleshooting');
  }

  // Exemplo 2: Logs específicos por contexto
  static contextualLogging() {
    logger.info('=== EXEMPLO 2: LOGS POR CONTEXTO ===');

    logger.startup('Aplicação iniciando...');
    logger.database('Conexão com PostgreSQL estabelecida');
    logger.network('Requisição HTTP GET /api/users processada');
    logger.security('Usuário autenticado com sucesso');
    logger.mqtt('Mensagem MQTT recebida no tópico sensor/data');
    logger.socket('Cliente Socket.IO conectado na sala /sensor');
    logger.success('Operação de criação de usuário concluída');
    logger.shutdown('Aplicação encerrando graciosamente...');
  }

  // Exemplo 3: Logs com metadados estruturados
  static structuredLogging() {
    logger.info('=== EXEMPLO 3: LOGS ESTRUTURADOS ===');

    // Log de autenticação com metadados
    logger.security('Login bem-sucedido', {
      userId: 'user-123',
      email: 'user@example.com',
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      timestamp: new Date().toISOString(),
      sessionId: 'sess-456',
    });

    // Log de erro com contexto
    logger.error('Falha na transação de banco', {
      transactionId: 'tx-789',
      operation: 'CREATE_USER',
      error: 'Connection timeout',
      retryCount: 3,
      duration: 1500,
      database: 'postgresql',
    });

    // Log de performance
    logger.info('Query executada', {
      query: 'SELECT * FROM users WHERE tenant_id = ?',
      duration: 45,
      rowsReturned: 150,
      database: 'postgresql',
      connectionPool: 'default',
    });
  }

  // Exemplo 4: Logs em loops e operações em lote
  static batchLogging() {
    logger.info('=== EXEMPLO 4: LOGS EM LOTE ===');

    const users = [
      { id: 1, name: 'João', email: 'joao@example.com' },
      { id: 2, name: 'Maria', email: 'maria@example.com' },
      { id: 3, name: 'Pedro', email: 'pedro@example.com' },
    ];

    logger.info(`Iniciando processamento de ${users.length} usuários`);

    users.forEach((user, index) => {
      logger.debug(`Processando usuário ${index + 1}/${users.length}`, {
        userId: user.id,
        userName: user.name,
        progress: `${(((index + 1) / users.length) * 100).toFixed(1)}%`,
      });
    });

    logger.success(`Processamento concluído para ${users.length} usuários`);
  }

  // Exemplo 5: Logs de monitoramento e métricas
  static monitoringLogging() {
    logger.info('=== EXEMPLO 5: LOGS DE MONITORAMENTO ===');

    // Métricas de sistema
    logger.info('Métricas do sistema', {
      cpuUsage: '45%',
      memoryUsage: '2.1GB',
      diskUsage: '78%',
      activeConnections: 25,
      uptime: '5d 12h 30m',
    });

    // Métricas de negócio
    logger.info('Métricas de negócio', {
      activeUsers: 150,
      totalTransactions: 1250,
      revenue: 15000.5,
      period: '2024-01-15',
    });

    // Alertas
    logger.warn('Alerta de performance', {
      metric: 'response_time',
      value: 2500,
      threshold: 2000,
      service: 'user_api',
    });
  }

  // Exemplo 6: Logs de debugging e troubleshooting
  static debuggingLogging() {
    logger.info('=== EXEMPLO 6: LOGS DE DEBUG ===');

    // Debug de variáveis
    const config = {
      database: 'postgresql',
      port: 5432,
      host: 'localhost',
      maxConnections: 10,
    };

    logger.debug('Configuração carregada', config);

    // Debug de stack trace
    try {
      throw new Error('Erro simulado para debug');
    } catch (error) {
      const err = error as Error;
      logger.error('Erro capturado com stack trace', {
        error: err.message,
        stack: err.stack,
        context: 'debugging_example',
      });
    }

    // Debug de estado
    logger.debug('Estado atual da aplicação', {
      services: ['database', 'mqtt', 'socket'],
      status: 'running',
      version: '1.0.0',
      environment: 'development',
    });
  }

  // Exemplo 7: Controle dinâmico de logging
  static dynamicControl() {
    logger.info('=== EXEMPLO 7: CONTROLE DINÂMICO ===');

    // Mudar nível de log dinamicamente
    logger.info('Log normal - nível INFO');
    logger.setLevel(LogLevel.WARN);
    logger.info('Esta info não aparecerá (nível WARN)');
    logger.warn('Este warning aparecerá');
    logger.setLevel(LogLevel.INFO);
    logger.info('Info habilitada novamente');

    // Desabilitar/habilitar cores
    logger.info('Log com cores');
    logger.disableColors();
    logger.info('Log sem cores');
    logger.enableColors();
    logger.info('Log com cores novamente');
  }

  // Exemplo 8: Logs para diferentes ambientes
  static environmentSpecificLogging() {
    logger.info('=== EXEMPLO 8: LOGS POR AMBIENTE ===');

    const environment = process.env.NODE_ENV || 'development';

    if (environment === 'development') {
      logger.debug('Debug habilitado apenas em desenvolvimento');
      logger.verbose('Logs verbosos para troubleshooting');
    }

    if (environment === 'production') {
      logger.info('Log de produção - sem informações sensíveis');
      // Em produção, não logamos dados sensíveis
    }

    if (environment === 'testing') {
      logger.info('Log de teste - apenas informações essenciais');
    }
  }

  // Exemplo 9: Logs de auditoria
  static auditLogging() {
    logger.info('=== EXEMPLO 9: LOGS DE AUDITORIA ===');

    // Log de ação do usuário
    logger.security('Ação de usuário registrada', {
      action: 'DELETE_USER',
      targetUserId: 'user-456',
      performedBy: 'admin-123',
      timestamp: new Date().toISOString(),
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0...',
      reason: 'Account termination request',
    });

    // Log de mudança de configuração
    logger.info('Configuração alterada', {
      setting: 'MAX_LOGIN_ATTEMPTS',
      oldValue: 5,
      newValue: 3,
      changedBy: 'admin-123',
      timestamp: new Date().toISOString(),
      reason: 'Security policy update',
    });
  }

  // Exemplo 10: Logs de integração com serviços externos
  static integrationLogging() {
    logger.info('=== EXEMPLO 10: LOGS DE INTEGRAÇÃO ===');

    // Log de chamada para API externa
    logger.network('Chamada para API externa iniciada', {
      service: 'payment_gateway',
      endpoint: 'POST /payments',
      requestId: 'req-789',
      timestamp: new Date().toISOString(),
    });

    // Log de resposta da API
    logger.network('Resposta da API externa recebida', {
      service: 'payment_gateway',
      statusCode: 200,
      responseTime: 450,
      requestId: 'req-789',
      success: true,
    });

    // Log de erro de integração
    logger.error('Falha na integração com serviço externo', {
      service: 'email_service',
      error: 'Connection timeout',
      retryCount: 2,
      maxRetries: 3,
      requestId: 'req-456',
    });
  }

  // Método para executar todos os exemplos
  static runAllExamples() {
    logger.startup('🚀 Iniciando demonstração de exemplos de logging...\n');

    this.basicLogging();
    console.log('');

    this.contextualLogging();
    console.log('');

    this.structuredLogging();
    console.log('');

    this.batchLogging();
    console.log('');

    this.monitoringLogging();
    console.log('');

    this.debuggingLogging();
    console.log('');

    this.dynamicControl();
    console.log('');

    this.environmentSpecificLogging();
    console.log('');

    this.auditLogging();
    console.log('');

    this.integrationLogging();
    console.log('');

    logger.success('✅ Todos os exemplos de logging foram executados!');
  }
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  LoggingExamples.runAllExamples();
}
