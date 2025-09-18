#!/usr/bin/env node

/**
 * Script para alternar entre diferentes ambientes usando arquivos .env separados
 *
 * Uso:
 *   node scripts/switch-database.js dev
 *   node scripts/switch-database.js staging
 *   node scripts/switch-database.js prod
 *   node scripts/switch-database.js status
 */

const fs = require('fs');
const path = require('path');

// Arquivos de ambiente por ambiente
const ENV_FILES = {
  dev: '.env.local',
  staging: '.env.staging',
  prod: '.env.prod',
  current: '.env', // Arquivo atual ativo
};

function showHelp() {
  console.log('\n🔧 Script de Alternância de Banco de Dados');
  console.log('='.repeat(50));
  console.log('Uso: node scripts/switch-database.js <comando>');
  console.log('');
  console.log('Comandos:');
  console.log('  dev      - Configura para desenvolvimento local (.env.local)');
  console.log('  staging  - Configura para staging (.env.staging)');
  console.log('  prod     - Configura para produção (.env.prod)');
  console.log('  status   - Mostra configuração atual');
  console.log('  help     - Mostra esta ajuda');
  console.log('');
  console.log('📁 Arquivos de ambiente:');
  console.log('   .env.local   - Desenvolvimento local');
  console.log('   .env.staging - Staging (Cloud SQL)');
  console.log('   .env.prod    - Produção (Cloud SQL)');
  console.log('   .env         - Arquivo ativo atual');
  console.log('');
}

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key] = valueParts.join('=');
      }
    }
  });

  return env;
}

function writeEnvFile(filePath, env) {
  // Criar diretório se não existir
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  fs.writeFileSync(filePath, content);
}

function createEnvFileIfNotExists(envType) {
  const envFile = ENV_FILES[envType];

  if (!fs.existsSync(envFile)) {
    console.log(`📝 Criando arquivo ${envFile}...`);

    let defaultEnv = {};

    switch (envType) {
      case 'dev':
        defaultEnv = {
          NODE_ENV: 'development',
          PORT: '3000',
          HOST: '0.0.0.0',
          USE_CLOUD_SQL: 'false',
          DATABASE_URL:
            'postgresql://postgres:postgres123@localhost:5432/backend_db',
          JWT_SECRET:
            'your-super-secret-jwt-key-change-this-in-production-32-chars-minimum',
          JWT_REFRESH_SECRET:
            'your-super-secret-refresh-key-change-this-in-production-32-chars-minimum',
          JWT_ACCESS_TOKEN_EXPIRY: '1h',
          JWT_REFRESH_TOKEN_EXPIRY: '30d',
          MQTT_HOST: 'localhost',
          MQTT_USERNAME: 'your-mqtt-username',
          MQTT_PASSWORD: 'your-mqtt-password',
          MQTT_PROTOCOL: 'mqtt',
          MQTT_PORT: '1883',
          MQTT_CLIENT_ID: 'backend-api',
          MQTT_KEEPALIVE: '60',
          MQTT_RECONNECT_PERIOD: '1000',
          MQTT_REJECT_UNAUTHORIZED: 'false',
          SOCKET_IO_PORT: '3001',
          SOCKET_IO_CORS_ORIGIN: '*',
          SOCKET_IO_PING_TIMEOUT: '60000',
          SOCKET_IO_PING_INTERVAL: '25000',
          LOG_LEVEL: 'info',
          LOG_FORMAT: 'json',
          CORS_ORIGIN: 'http://localhost:3000,http://localhost:3001',
          RATE_LIMIT_WINDOW_MS: '900000',
          RATE_LIMIT_MAX_REQUESTS: '100',
          BCRYPT_ROUNDS: '12',
        };
        break;

      case 'staging':
        defaultEnv = {
          NODE_ENV: 'staging',
          PORT: '3000',
          HOST: '0.0.0.0',
          USE_CLOUD_SQL: 'true',
          INSTANCE_CONNECTION_NAME: 'smart-201703:us-central1:smart-platform',
          STAGING_DB_HOST: '34.135.81.224',
          STAGING_DB_USERNAME: 'postgres',
          STAGING_DB_PASSWORD: 'SUA_SENHA_STAGING_AQUI',
          STAGING_DB_DATABASE: 'smart-develop',
          STAGING_DB_PORT: '5432',
          STAGING_DB_SSL_MODE: 'require',
          JWT_SECRET:
            'your-super-secret-jwt-key-change-this-in-production-32-chars-minimum',
          JWT_REFRESH_SECRET:
            'your-super-secret-refresh-key-change-this-in-production-32-chars-minimum',
          JWT_ACCESS_TOKEN_EXPIRY: '1h',
          JWT_REFRESH_TOKEN_EXPIRY: '30d',
          MQTT_HOST: 'localhost',
          MQTT_USERNAME: 'your-mqtt-username',
          MQTT_PASSWORD: 'your-mqtt-password',
          MQTT_PROTOCOL: 'mqtt',
          MQTT_PORT: '1883',
          MQTT_CLIENT_ID: 'backend-api',
          MQTT_KEEPALIVE: '60',
          MQTT_RECONNECT_PERIOD: '1000',
          MQTT_REJECT_UNAUTHORIZED: 'false',
          SOCKET_IO_PORT: '3001',
          SOCKET_IO_CORS_ORIGIN: '*',
          SOCKET_IO_PING_TIMEOUT: '60000',
          SOCKET_IO_PING_INTERVAL: '25000',
          LOG_LEVEL: 'info',
          LOG_FORMAT: 'json',
          CORS_ORIGIN: '*',
          RATE_LIMIT_WINDOW_MS: '900000',
          RATE_LIMIT_MAX_REQUESTS: '100',
          BCRYPT_ROUNDS: '12',
        };
        break;

      case 'prod':
        defaultEnv = {
          NODE_ENV: 'production',
          PORT: '3000',
          HOST: '0.0.0.0',
          USE_CLOUD_SQL: 'true',
          INSTANCE_CONNECTION_NAME: 'smart-201703:us-central1:smart-platform',
          PROD_DB_HOST: '34.135.81.224',
          PROD_DB_USERNAME: 'postgres',
          PROD_DB_PASSWORD: 'SUA_SENHA_PRODUCAO_AQUI',
          PROD_DB_DATABASE: 'smart-prod',
          PROD_DB_PORT: '5432',
          PROD_DB_SSL_MODE: 'require',
          JWT_SECRET:
            'your-super-secret-jwt-key-change-this-in-production-32-chars-minimum',
          JWT_REFRESH_SECRET:
            'your-super-secret-refresh-key-change-this-in-production-32-chars-minimum',
          JWT_ACCESS_TOKEN_EXPIRY: '1h',
          JWT_REFRESH_TOKEN_EXPIRY: '30d',
          MQTT_HOST: 'localhost',
          MQTT_USERNAME: 'your-mqtt-username',
          MQTT_PASSWORD: 'your-mqtt-password',
          MQTT_PROTOCOL: 'mqtt',
          MQTT_PORT: '1883',
          MQTT_CLIENT_ID: 'backend-api',
          MQTT_KEEPALIVE: '60',
          MQTT_RECONNECT_PERIOD: '1000',
          MQTT_REJECT_UNAUTHORIZED: 'false',
          SOCKET_IO_PORT: '3001',
          SOCKET_IO_CORS_ORIGIN: '*',
          SOCKET_IO_PING_TIMEOUT: '60000',
          SOCKET_IO_PING_INTERVAL: '25000',
          LOG_LEVEL: 'info',
          LOG_FORMAT: 'json',
          CORS_ORIGIN: '*',
          RATE_LIMIT_WINDOW_MS: '900000',
          RATE_LIMIT_MAX_REQUESTS: '100',
          BCRYPT_ROUNDS: '12',
        };
        break;
    }

    writeEnvFile(envFile, defaultEnv);
    console.log(`✅ Arquivo ${envFile} criado com configurações padrão`);
  }
}

function switchToEnvironment(envType) {
  const envFile = ENV_FILES[envType];
  const currentEnvFile = ENV_FILES.current;

  console.log(`🏠 Configurando para ${envType.toUpperCase()}...`);

  // Criar arquivo de ambiente se não existir
  createEnvFileIfNotExists(envType);

  // Ler configurações do ambiente específico
  const env = readEnvFile(envFile);

  if (Object.keys(env).length === 0) {
    console.error(`❌ Arquivo ${envFile} está vazio ou não foi encontrado`);
    return;
  }

  // Copiar para .env (arquivo ativo)
  writeEnvFile(currentEnvFile, env);

  console.log(`✅ Configuração atualizada para ${envType.toUpperCase()}`);
  console.log('📋 Configuração:');
  console.log(`   NODE_ENV: ${env.NODE_ENV}`);
  console.log(`   USE_CLOUD_SQL: ${env.USE_CLOUD_SQL}`);

  if (env.USE_CLOUD_SQL === 'true') {
    console.log(`   INSTANCE_CONNECTION_NAME: ${env.INSTANCE_CONNECTION_NAME}`);

    if (envType === 'staging') {
      console.log(`   STAGING_DB_DATABASE: ${env.STAGING_DB_DATABASE}`);
      console.log(`   STAGING_DB_HOST: ${env.STAGING_DB_HOST}`);
    } else if (envType === 'prod') {
      console.log(`   PROD_DB_DATABASE: ${env.PROD_DB_DATABASE}`);
      console.log(`   PROD_DB_HOST: ${env.PROD_DB_HOST}`);
    }
  } else {
    console.log(
      `   DATABASE_URL: ${env.DATABASE_URL ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`
    );
  }

  console.log('');
  console.log('🚀 Para aplicar, reinicie a aplicação:');
  console.log('   npm run dev');
}

function showStatus() {
  console.log('📊 STATUS DA CONFIGURAÇÃO DE BANCO');
  console.log('='.repeat(60));

  // Verificar arquivos de ambiente
  console.log('📁 ARQUIVOS DE AMBIENTE:');
  Object.entries(ENV_FILES).forEach(([envType, filePath]) => {
    const exists = fs.existsSync(filePath);
    const status = exists ? '✅' : '❌';
    const typeLabel = envType === 'current' ? 'ATIVO' : envType.toUpperCase();
    console.log(`   ${status} ${filePath} (${typeLabel})`);
  });

  console.log('');

  // Mostrar configuração atual
  const currentEnv = readEnvFile(ENV_FILES.current);

  if (Object.keys(currentEnv).length === 0) {
    console.log('❌ Nenhuma configuração ativa encontrada');
    console.log(
      '💡 Execute: npm run db:dev, npm run db:staging ou npm run db:prod'
    );
    return;
  }

  console.log('📋 CONFIGURAÇÃO ATUAL (.env):');
  console.log(`   NODE_ENV: ${currentEnv.NODE_ENV || 'NÃO CONFIGURADO'}`);
  console.log(
    `   USE_CLOUD_SQL: ${currentEnv.USE_CLOUD_SQL || 'NÃO CONFIGURADO'}`
  );

  if (currentEnv.USE_CLOUD_SQL === 'true') {
    console.log(
      `   INSTANCE_CONNECTION_NAME: ${currentEnv.INSTANCE_CONNECTION_NAME || 'NÃO CONFIGURADO'}`
    );

    if (currentEnv.NODE_ENV === 'staging') {
      console.log('   🧪 STAGING (Cloud SQL - smart-develop)');
      console.log(
        `   📍 Host: ${currentEnv.STAGING_DB_HOST || 'NÃO CONFIGURADO'}`
      );
      console.log(
        `   🗄️  Database: ${currentEnv.STAGING_DB_DATABASE || 'NÃO CONFIGURADO'}`
      );
    } else if (currentEnv.NODE_ENV === 'production') {
      console.log('   🚀 PRODUÇÃO (Cloud SQL - smart-prod)');
      console.log(
        `   📍 Host: ${currentEnv.PROD_DB_HOST || 'NÃO CONFIGURADO'}`
      );
      console.log(
        `   🗄️  Database: ${currentEnv.PROD_DB_DATABASE || 'NÃO CONFIGURADO'}`
      );
    }
  } else {
    console.log('   🏠 DESENVOLVIMENTO (PostgreSQL Local)');
    console.log(
      `   📍 URL: ${currentEnv.DATABASE_URL ? 'CONFIGURADA' : 'NÃO CONFIGURADA'}`
    );
  }

  console.log('');
  console.log('💡 Para alternar entre ambientes:');
  console.log('   npm run db:dev      - Desenvolvimento local');
  console.log('   npm run db:staging  - Staging (Cloud SQL)');
  console.log('   npm run db:prod     - Produção (Cloud SQL)');
}

function main() {
  const command = process.argv[2];

  switch (command) {
    case 'dev':
      switchToEnvironment('dev');
      break;
    case 'staging':
      switchToEnvironment('staging');
      break;
    case 'prod':
      switchToEnvironment('prod');
      break;
    case 'status':
      showStatus();
      break;
    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;
    default:
      console.log('❌ Comando inválido!');
      showHelp();
      process.exit(1);
  }
}

main();
