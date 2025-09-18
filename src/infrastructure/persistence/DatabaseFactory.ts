import { PrismaClient } from '@prisma/client';

import { DatabaseConnector } from './CloudSqlConnector';

export interface DatabaseConfig {
  useCloudSql: boolean;
  instanceConnectionName?: string;
  databaseUrl: string;
}

export class DatabaseFactory {
  private static instance: DatabaseFactory;
  private prismaClient: PrismaClient | null = null;
  private databaseConnector: DatabaseConnector | null = null;

  private constructor() {}

  static getInstance(): DatabaseFactory {
    if (!DatabaseFactory.instance) {
      DatabaseFactory.instance = new DatabaseFactory();
    }
    return DatabaseFactory.instance;
  }

  /**
   * Cria e configura a conexão com o banco de dados
   */
  async createConnection(config: DatabaseConfig): Promise<PrismaClient> {
    if (this.prismaClient) {
      console.log('🔄 Reutilizando conexão existente');
      return this.prismaClient;
    }

    console.log('🚀 Inicializando conexão com banco de dados...');
    console.log(
      `☁️  Cloud SQL: ${config.useCloudSql ? 'Habilitado' : 'Desabilitado'}`
    );

    try {
      if (config.useCloudSql) {
        if (!config.instanceConnectionName) {
          throw new Error(
            'instanceConnectionName é obrigatório quando useCloudSql é true'
          );
        }

        this.databaseConnector = new DatabaseConnector({
          instanceConnectionName: config.instanceConnectionName,
          useCloudSql: true,
          databaseUrl: config.databaseUrl,
        });

        this.prismaClient =
          await this.databaseConnector.createDatabaseConnection();
      } else {
        this.databaseConnector = new DatabaseConnector({
          instanceConnectionName: '',
          useCloudSql: false,
          databaseUrl: config.databaseUrl,
        });

        this.prismaClient =
          await this.databaseConnector.createLocalConnection();
      }

      // Configurar handlers de encerramento
      this.setupGracefulShutdown();

      return this.prismaClient;
    } catch (error) {
      console.error('❌ Erro ao criar conexão com banco de dados:', error);
      throw error;
    }
  }

  /**
   * Obtém a instância atual do PrismaClient
   */
  getPrismaClient(): PrismaClient {
    if (!this.prismaClient) {
      throw new Error(
        'PrismaClient não foi inicializado. Chame createConnection() primeiro.'
      );
    }
    return this.prismaClient;
  }

  /**
   * Configura o encerramento graceful da aplicação
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n🛑 Recebido sinal ${signal}. Encerrando conexões...`);

      try {
        if (this.prismaClient) {
          await this.prismaClient.$disconnect();
          console.log('✅ PrismaClient desconectado');
        }

        if (this.databaseConnector) {
          // DatabaseConnector não tem método close, apenas PrismaClient
        }

        console.log('✅ Encerramento graceful concluído');
        process.exit(0);
      } catch (error) {
        console.error('❌ Erro durante encerramento graceful:', error);
        process.exit(1);
      }
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  }

  /**
   * Fecha todas as conexões
   */
  async closeConnections(): Promise<void> {
    try {
      if (this.prismaClient) {
        await this.prismaClient.$disconnect();
        this.prismaClient = null;
        console.log('✅ PrismaClient desconectado');
      }

      if (this.databaseConnector) {
        // DatabaseConnector não tem método close, apenas PrismaClient
        this.databaseConnector = null;
      }
    } catch (error) {
      console.error('❌ Erro ao fechar conexões:', error);
      throw error;
    }
  }

  /**
   * Verifica se a conexão está ativa
   */
  isConnected(): boolean {
    return this.prismaClient !== null;
  }
}
