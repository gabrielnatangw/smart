import { PrismaClient } from '@prisma/client';

import { DatabaseConfig, DatabaseFactory } from './DatabaseFactory';

export class DatabaseInitializer {
  private static instance: DatabaseInitializer;
  private databaseFactory: DatabaseFactory;
  private prismaClient: PrismaClient | null = null;

  private constructor() {
    this.databaseFactory = DatabaseFactory.getInstance();
  }

  static getInstance(): DatabaseInitializer {
    if (!DatabaseInitializer.instance) {
      DatabaseInitializer.instance = new DatabaseInitializer();
    }
    return DatabaseInitializer.instance;
  }

  /**
   * Inicializa a conexão com o banco de dados
   */
  async initialize(): Promise<PrismaClient> {
    if (this.prismaClient) {
      console.log('🔄 Reutilizando conexão existente com banco de dados');
      return this.prismaClient;
    }

    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL é obrigatória');
    }

    const config: DatabaseConfig = {
      useCloudSql: process.env.USE_CLOUD_SQL === 'true',
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
      databaseUrl: process.env.DATABASE_URL,
    };

    try {
      console.log('\n' + '='.repeat(60));
      console.log('🚀 INICIALIZANDO CONEXÃO COM BANCO DE DADOS');
      console.log('='.repeat(60));

      // Mostrar configuração atual
      this.logDatabaseConfiguration(config);

      this.prismaClient = await this.databaseFactory.createConnection(config);

      // Testar conexão
      await this.prismaClient.$queryRaw`SELECT 1`;

      // Log de sucesso com informações do banco
      this.logConnectionSuccess(config);

      return this.prismaClient;
    } catch (error) {
      console.error('❌ Erro ao inicializar banco de dados:', error);
      throw error;
    }
  }

  /**
   * Mostra a configuração do banco de dados
   */
  private logDatabaseConfiguration(config: DatabaseConfig): void {
    console.log('📋 CONFIGURAÇÃO DO BANCO:');
    console.log(
      `   🔧 Modo: ${config.useCloudSql ? '☁️  GOOGLE CLOUD SQL' : '🏠 POSTGRESQL LOCAL'}`
    );

    if (config.useCloudSql) {
      console.log(
        `   📡 Instância: ${config.instanceConnectionName || 'NÃO CONFIGURADA'}`
      );
      console.log(`   🔐 Autenticação: IAM (Google Cloud)`);
    } else {
      console.log(`   🔐 Autenticação: Credenciais locais`);
    }

    // Mostrar informações da URL (sem senha)
    const urlInfo = this.parseDatabaseUrl(config.databaseUrl);
    console.log(`   🗄️  Banco: ${urlInfo.database}`);
    console.log(`   👤 Usuário: ${urlInfo.username}`);
    console.log(`   🌐 Host: ${urlInfo.host}`);
    console.log(`   🚪 Porta: ${urlInfo.port}`);
    console.log('='.repeat(60));
  }

  /**
   * Mostra informações de sucesso da conexão
   */
  private logConnectionSuccess(config: DatabaseConfig): void {
    console.log('✅ CONEXÃO ESTABELECIDA COM SUCESSO!');
    console.log('='.repeat(60));
    console.log(
      `🎯 Banco ativo: ${config.useCloudSql ? 'Google Cloud SQL' : 'PostgreSQL Local'}`
    );
    console.log(`⏰ Timestamp: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Parse da URL do banco para extrair informações
   */
  private parseDatabaseUrl(databaseUrl: string): {
    host: string;
    port: string;
    username: string;
    database: string;
  } {
    try {
      const url = new URL(databaseUrl);
      return {
        host: url.hostname,
        port: url.port || '5432',
        username: url.username,
        database: url.pathname.substring(1),
      };
    } catch {
      return {
        host: 'unknown',
        port: 'unknown',
        username: 'unknown',
        database: 'unknown',
      };
    }
  }

  /**
   * Obtém a instância do PrismaClient
   */
  getPrismaClient(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error(
        'Banco de dados não foi inicializado. Chame initialize() primeiro.'
      );
    }
    return this.prismaClient;
  }

  /**
   * Verifica se o banco está conectado
   */
  isConnected(): boolean {
    return this.databaseFactory.isConnected();
  }

  /**
   * Fecha a conexão com o banco
   */
  async close(): Promise<void> {
    try {
      await this.databaseFactory.closeConnections();
      this.prismaClient = null;
      console.log('✅ Conexão com banco de dados fechada');
    } catch (error) {
      console.error('❌ Erro ao fechar conexão com banco:', error);
      throw error;
    }
  }
}
