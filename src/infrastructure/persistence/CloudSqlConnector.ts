import { PrismaClient } from '@prisma/client';

export interface CloudSqlConfig {
  instanceConnectionName: string;
  useCloudSql: boolean;
  databaseUrl?: string;
}

export class DatabaseConnector {
  private config: CloudSqlConfig;

  constructor(config: CloudSqlConfig) {
    this.config = config;
  }

  /**
   * Detecta se está rodando na VM do Google Cloud
   */
  private isRunningOnGoogleCloud(): boolean {
    // Verificar se está rodando no Google Cloud
    return (
      process.env.GOOGLE_CLOUD_PROJECT !== undefined ||
      process.env.GAE_APPLICATION !== undefined ||
      process.env.K_SERVICE !== undefined ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS !== undefined ||
      process.env.GCP === 'true' ||
      process.env.USE_CLOUD_SQL === 'true'
    );
  }

  /**
   * Cria uma conexão direta com o banco de dados (Cloud SQL ou local)
   */
  async createDatabaseConnection(): Promise<PrismaClient> {
    if (!this.config.useCloudSql) {
      throw new Error('Cloud SQL não está habilitado');
    }

    try {
      const isOnGoogleCloud = this.isRunningOnGoogleCloud();

      console.log('🔗 Conectando com banco de dados diretamente...');
      console.log(`🔐 Autenticação: Conexão direta por IP`);
      console.log(
        `☁️  Ambiente: ${isOnGoogleCloud ? 'Google Cloud VM' : 'Desenvolvimento Local'}`
      );

      // Configuração otimizada baseada no ambiente
      let host: string;
      let port: number;
      let sslMode: string;

      if (isOnGoogleCloud) {
        // Na VM do Google Cloud - usar IP privado se disponível, senão público
        host =
          process.env.PROD_DB_HOST_PRIVATE ||
          process.env.PROD_DB_HOST ||
          '34.135.81.224';
        port = parseInt(process.env.PROD_DB_PORT || '5432');
        sslMode = process.env.PROD_DB_SSL_MODE || 'prefer'; // Mais flexível na rede interna
        console.log('🚀 Modo otimizado para VM Google Cloud ativado');
      } else {
        // Desenvolvimento local - usar IP público
        host = process.env.PROD_DB_HOST || '34.135.81.224';
        port = 5432;
        sslMode = process.env.PROD_DB_SSL_MODE || 'prefer'; // Tentar prefer primeiro, depois require
        console.log('🏠 Modo desenvolvimento local');
      }

      // Obter configuração baseada no ambiente
      const dbConfig = this.getDatabaseConfig();
      const username = dbConfig.username;
      const password = dbConfig.password;
      const database = dbConfig.database;

      console.log(`🌐 Host GCP: ${host}:${port}`);
      console.log(`🗄️  Banco: ${database}`);
      console.log(`👤 Usuário: ${username}`);
      console.log(`🔒 SSL Mode: ${sslMode}`);

      // Construir URL de conexão direta para GCP (codificar senha para URL)
      const encodedPassword = encodeURIComponent(password);
      
      // Tentar diferentes modos de SSL se necessário
      const sslModes = [sslMode, 'disable', 'prefer', 'require'];
      let prisma: PrismaClient | null = null;
      let lastError: Error | null = null;

      for (const mode of sslModes) {
        try {
          const cloudSqlUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}?sslmode=${mode}`;

          console.log(
            `🔗 Tentando conexão: postgresql://${username}:***@${host}:${port}/${database}?sslmode=${mode}`
          );

          // Criar PrismaClient com configuração Cloud SQL direta
          prisma = new PrismaClient({
            datasources: {
              db: {
                url: cloudSqlUrl,
              },
            },
          });

          // Testar conexão
          await prisma.$connect();
          console.log(`✅ Conectado com banco de dados com sslmode=${mode}!`);
          break;
        } catch (error) {
          console.warn(`⚠️ Falha com sslmode=${mode}: ${error.message}`);
          lastError = error as Error;
          if (prisma) {
            await prisma.$disconnect();
            prisma = null;
          }
        }
      }

      if (!prisma) {
        throw lastError || new Error('Falha ao conectar com todos os modos SSL');
      }

      return prisma;
    } catch (error) {
      console.error('❌ Erro ao conectar com banco de dados:', error);
      throw error;
    }
  }

  /**
   * Cria uma conexão local padrão (fallback)
   */
  createLocalConnection(): PrismaClient {
    console.log('🏠 Usando conexão local PostgreSQL');
    console.log('🔐 Autenticação: Credenciais locais');

    if (!this.config.databaseUrl) {
      throw new Error('DATABASE_URL é obrigatório para conexão local');
    }

    // Mostrar informações da conexão local
    const urlInfo = this.parseDatabaseUrl(this.config.databaseUrl);
    console.log(`🌐 Host: ${urlInfo.host}:${urlInfo.port}`);
    console.log(`🗄️  Banco: ${urlInfo.database}`);
    console.log(`👤 Usuário: ${urlInfo.username}`);

    return new PrismaClient({
      datasources: {
        db: {
          url: this.config.databaseUrl,
        },
      },
    });
  }

  /**
   * Obtém configuração do banco baseada no ambiente
   */
  private getDatabaseConfig(): {
    username: string;
    password: string;
    database: string;
  } {
    const nodeEnv = process.env.NODE_ENV;

    if (nodeEnv === 'staging') {
      return {
        username:
          process.env.STAGING_DB_USERNAME ||
          process.env.PROD_DB_USERNAME ||
          'postgres',
        password:
          process.env.STAGING_DB_PASSWORD || process.env.PROD_DB_PASSWORD || '',
        database: process.env.STAGING_DB_DATABASE || 'smart-develop',
      };
    }

    if (nodeEnv === 'production') {
      return {
        username: process.env.PROD_DB_USERNAME || 'postgres',
        password: process.env.PROD_DB_PASSWORD || '',
        database: process.env.PROD_DB_DATABASE || 'smart-prod',
      };
    }

    // Fallback para desenvolvimento
    return {
      username: process.env.PROD_DB_USERNAME || 'postgres',
      password: process.env.PROD_DB_PASSWORD || '',
      database: process.env.PROD_DB_DATABASE || 'smart-develop',
    };
  }

  /**
   * Parse da URL do banco para extrair informações
   */
  private parseDatabaseUrl(databaseUrl: string): {
    host: string;
    port: string;
    username: string;
    password: string;
    database: string;
  } {
    try {
      const url = new URL(databaseUrl);
      return {
        host: url.hostname,
        port: url.port || '5432',
        username: url.username,
        password: url.password,
        database: url.pathname.substring(1),
      };
    } catch {
      return {
        host: 'unknown',
        port: 'unknown',
        username: 'unknown',
        password: 'unknown',
        database: 'unknown',
      };
    }
  }

  /**
   * Cria a conexão apropriada baseada na configuração
   */
  async createConnection(): Promise<PrismaClient> {
    if (this.config.useCloudSql) {
      return this.createDatabaseConnection();
    } else {
      return this.createLocalConnection();
    }
  }

  /**
   * Constrói a URL de conexão para Cloud SQL via Proxy
   */
  private buildCloudSqlProxyUrl(clientOpts: any): string {
    const host = (clientOpts as any).host;
    const port = parseInt((clientOpts as any).port) || 5432;

    if (!host) {
      console.error('❌ Host não encontrado nas opções do Cloud SQL');
      throw new Error('Host do Cloud SQL não encontrado');
    }

    // Usar DATABASE_URL para Cloud SQL Proxy (já contém as credenciais corretas)
    const databaseUrl = this.config.databaseUrl;

    if (!databaseUrl) {
      throw new Error('DATABASE_URL é obrigatório para Cloud SQL Proxy');
    }

    // Parse da DATABASE_URL para extrair credenciais
    const urlInfo = this.parseDatabaseUrl(databaseUrl);

    console.log(
      `🔐 Usando credenciais da DATABASE_URL: ${urlInfo.username}@${host}:${port}/${urlInfo.database}`
    );

    // Construir URL para Cloud SQL Proxy (localhost) - sem SSL pois o proxy já é seguro
    const cloudSqlUrl = `postgresql://${urlInfo.username}:${urlInfo.password || ''}@${host}:${port}/${urlInfo.database}`;

    console.log(
      `🔗 URL Cloud SQL Proxy: ${cloudSqlUrl.replace(urlInfo.password || '', '***')}`
    );

    return cloudSqlUrl;
  }

  /**
   * Constrói a URL de conexão para Cloud SQL (método antigo - mantido para compatibilidade)
   */
  private buildCloudSqlUrl(clientOpts: any): string {
    const host = (clientOpts as any).host;
    const port = parseInt((clientOpts as any).port) || 5432;

    if (!host) {
      console.error('❌ Host não encontrado nas opções do Cloud SQL');
      console.error(
        'ClientOpts recebidos:',
        JSON.stringify(clientOpts, null, 2)
      );
      throw new Error('Host do Cloud SQL não encontrado');
    }

    // Usar credenciais de produção para Cloud SQL
    const username = process.env.PROD_DB_USERNAME || 'postgres';
    const password = process.env.PROD_DB_PASSWORD;
    const database = process.env.PROD_DB_DATABASE || 'backend_db';

    if (!password) {
      throw new Error('PROD_DB_PASSWORD é obrigatório para Cloud SQL');
    }

    console.log(
      `🔐 Usando credenciais de produção: ${username}@${host}:${port}/${database}`
    );

    // Construir nova URL com credenciais de produção (codificar senha para URL)
    const encodedPassword = encodeURIComponent(password);
    const cloudSqlUrl = `postgresql://${username}:${encodedPassword}@${host}:${port}/${database}?sslmode=require`;

    console.log(`🔗 URL construída: ${cloudSqlUrl.replace(password, '***')}`);

    return cloudSqlUrl;
  }

  /**
   * Fecha a conexão (não necessário para conexão direta)
   */
  async close(): Promise<void> {
    // Conexão direta não precisa de fechamento específico
    console.log('🔌 Conexão direta - fechamento automático via PrismaClient');
  }
}
