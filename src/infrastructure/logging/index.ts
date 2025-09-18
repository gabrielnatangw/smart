export { Logger, LogLevel, logger } from './Logger';
export type { LogConfig } from './Logger';
export {
  loggerProfiles,
  getLoggerProfile,
  listAvailableProfiles,
  initializeLoggerFromEnv,
} from './loggerConfig';
export type { LoggerProfile } from './loggerConfig';

// Re-exportar a instância padrão do logger para uso direto
export { logger as default } from './Logger';
