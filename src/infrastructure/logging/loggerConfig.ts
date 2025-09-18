import { LogConfig, LogLevel } from './Logger';

export interface LoggerProfile {
  name: string;
  config: LogConfig;
  description: string;
}

export const loggerProfiles: Record<string, LoggerProfile> = {
  development: {
    name: 'Development',
    config: {
      level: LogLevel.DEBUG,
      enableColors: true,
      enableTimestamp: true,
      enableEmojis: true,
      enableFileLogging: false,
    },
    description: 'Perfil para desenvolvimento com logs detalhados e coloridos',
  },

  production: {
    name: 'Production',
    config: {
      level: LogLevel.INFO,
      enableColors: false,
      enableTimestamp: true,
      enableEmojis: false,
      enableFileLogging: true,
      logFilePath: './logs/app.log',
    },
    description: 'Perfil para produção com logs limpos e em arquivo',
  },

  testing: {
    name: 'Testing',
    config: {
      level: LogLevel.ERROR,
      enableColors: false,
      enableTimestamp: false,
      enableEmojis: false,
      enableFileLogging: false,
    },
    description: 'Perfil para testes com logs mínimos',
  },

  verbose: {
    name: 'Verbose',
    config: {
      level: LogLevel.VERBOSE,
      enableColors: true,
      enableTimestamp: true,
      enableEmojis: true,
      enableFileLogging: true,
      logFilePath: './logs/verbose.log',
    },
    description: 'Perfil para debug detalhado com todos os logs',
  },

  minimal: {
    name: 'Minimal',
    config: {
      level: LogLevel.WARN,
      enableColors: true,
      enableTimestamp: false,
      enableEmojis: true,
      enableFileLogging: false,
    },
    description: 'Perfil minimalista com apenas warnings e erros',
  },
};

export function getLoggerProfile(profileName: string): LogConfig {
  const profile = loggerProfiles[profileName];
  if (!profile) {
    console.warn(
      `Perfil de logger "${profileName}" não encontrado. Usando perfil development.`
    );
    return (
      loggerProfiles.development?.config || {
        level: LogLevel.INFO,
        enableColors: true,
        enableTimestamp: true,
        enableEmojis: true,
        enableFileLogging: false,
      }
    );
  }
  return profile.config;
}

export function listAvailableProfiles(): void {
  console.log('\n📋 Perfis de Logger Disponíveis:\n');

  Object.entries(loggerProfiles).forEach(([key, profile]) => {
    console.log(`🔹 ${key}: ${profile.name}`);
    console.log(`   ${profile.description}`);
    console.log(`   Configuração:`, profile.config);
    console.log('');
  });
}

export function initializeLoggerFromEnv(): LogConfig {
  const envProfile = process.env.LOGGER_PROFILE;

  if (envProfile && loggerProfiles[envProfile]) {
    return loggerProfiles[envProfile].config;
  }

  // Configuração baseada no NODE_ENV
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Configuração padrão de fallback
  const defaultConfig: LogConfig = {
    level: LogLevel.INFO,
    enableColors: true,
    enableTimestamp: true,
    enableEmojis: true,
    enableFileLogging: false,
  };

  switch (nodeEnv) {
    case 'production':
      return (
        loggerProfiles.production?.config ||
        loggerProfiles.development?.config ||
        defaultConfig
      );
    case 'test':
      return (
        loggerProfiles.testing?.config ||
        loggerProfiles.development?.config ||
        defaultConfig
      );
    case 'development':
    default:
      return loggerProfiles.development?.config || defaultConfig;
  }
}
