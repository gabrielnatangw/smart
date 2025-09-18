import { LogLevel, Logger, listAvailableProfiles, logger } from './index';

// Função para demonstrar todos os tipos de logs
export function demonstrateLogging(): void {
  console.log('\n🎭 Demonstração do Sistema de Logging\n');

  // Logs básicos
  logger.error('Erro crítico no sistema');
  logger.warn('Aviso sobre configuração');
  logger.info('Informação geral');
  logger.debug('Debug detalhado');
  logger.verbose('Log muito detalhado');

  // Logs específicos por contexto
  logger.success('Operação concluída com sucesso');
  logger.database('Conexão com banco estabelecida');
  logger.network('Requisição HTTP processada');
  logger.security('Autenticação bem-sucedida');
  logger.mqtt('Mensagem MQTT recebida');
  logger.socket('Cliente Socket.IO conectado');
  logger.startup('Aplicação iniciada');
  logger.shutdown('Aplicação encerrada');

  // Logs com metadados
  logger.info('Usuário autenticado', {
    userId: '123',
    email: 'user@example.com',
    timestamp: new Date().toISOString(),
  });

  logger.error('Erro na transação', {
    transactionId: 'tx-456',
    error: 'Connection timeout',
    retryCount: 3,
  });
}

// Função para testar diferentes perfis
export function testProfiles(): void {
  console.log('\n🧪 Testando Diferentes Perfis de Logger\n');

  // Listar perfis disponíveis
  listAvailableProfiles();

  // Testar perfil development
  console.log('\n🔧 Testando perfil development:');
  const devLogger = Logger.getInstance({
    level: LogLevel.DEBUG,
    enableColors: true,
    enableTimestamp: true,
    enableEmojis: true,
  });

  devLogger.info('Log de desenvolvimento');
  devLogger.debug('Debug habilitado');

  // Testar perfil production
  console.log('\n🏭 Testando perfil production:');
  const prodLogger = Logger.getInstance({
    level: LogLevel.INFO,
    enableColors: false,
    enableTimestamp: true,
    enableEmojis: false,
  });

  prodLogger.info('Log de produção');
  prodLogger.debug('Este debug não aparecerá');

  // Testar perfil minimal
  console.log('\n⚡ Testando perfil minimal:');
  const minLogger = Logger.getInstance({
    level: LogLevel.WARN,
    enableColors: true,
    enableTimestamp: false,
    enableEmojis: true,
  });

  minLogger.info('Esta info não aparecerá');
  minLogger.warn('Apenas warnings e erros');
  minLogger.error('Erro crítico');
}

// Função para demonstrar controle dinâmico
export function demonstrateDynamicControl(): void {
  console.log('\n🎛️ Demonstração de Controle Dinâmico\n');

  logger.info('Log normal');

  // Desabilitar cores
  logger.disableColors();
  logger.info('Log sem cores');

  // Habilitar cores novamente
  logger.enableColors();
  logger.info('Log com cores novamente');

  // Mudar nível de log
  logger.setLevel(LogLevel.WARN);
  logger.info('Esta info não aparecerá');
  logger.warn('Apenas warnings e erros agora');

  // Voltar para info
  logger.setLevel(LogLevel.INFO);
  logger.info('Info habilitada novamente');

  // Mostrar configuração atual
  console.log('\n📊 Configuração atual:', logger.getConfig());
}

// Função principal para executar todas as demonstrações
export function runAllDemonstrations(): void {
  console.log('🚀 Iniciando demonstrações do sistema de logging...\n');

  demonstrateLogging();
  testProfiles();
  demonstrateDynamicControl();

  console.log('\n✅ Todas as demonstrações concluídas!');
}

// Executar se este arquivo for chamado diretamente
if (require.main === module) {
  runAllDemonstrations();
}
