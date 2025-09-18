import winston from 'winston';

// Função para verificar se estamos em produção
const isProduction = process.env.NODE_ENV === 'production';

// Funções de cores simplificadas para produção
const colors = {
  red: (text: string) => (isProduction ? text : `\x1b[31m${text}\x1b[0m`),
  yellow: (text: string) => (isProduction ? text : `\x1b[33m${text}\x1b[0m`),
  blue: (text: string) => (isProduction ? text : `\x1b[34m${text}\x1b[0m`),
  green: (text: string) => (isProduction ? text : `\x1b[32m${text}\x1b[0m`),
  magenta: (text: string) => (isProduction ? text : `\x1b[35m${text}\x1b[0m`),
  cyan: (text: string) => (isProduction ? text : `\x1b[36m${text}\x1b[0m`),
  white: (text: string) => (isProduction ? text : `\x1b[37m${text}\x1b[0m`),
  gray: (text: string) => (isProduction ? text : `\x1b[90m${text}\x1b[0m`),
  bold: (text: string) => (isProduction ? text : `\x1b[1m${text}\x1b[0m`),
};

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogConfig {
  level: LogLevel;
  enableColors: boolean;
  enableTimestamp: boolean;
  enableEmojis: boolean;
  enableFileLogging: boolean;
  logFilePath?: string;
}

export class Logger {
  private static instance: Logger;
  private winstonLogger!: winston.Logger;
  private config: LogConfig;

  private constructor(config: Partial<LogConfig> = {}) {
    this.config = {
      level: LogLevel.INFO,
      enableColors: true,
      enableTimestamp: true,
      enableEmojis: true,
      enableFileLogging: false,
      ...config,
    };

    this.initializeWinston();
  }

  public static getInstance(config?: Partial<LogConfig>): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  public static configure(config: Partial<LogConfig>): void {
    if (Logger.instance) {
      Logger.instance.updateConfig(config);
    } else {
      Logger.getInstance(config);
    }
  }

  private updateConfig(newConfig: Partial<LogConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.initializeWinston();
  }

  private initializeWinston(): void {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            return this.formatMessage(
              level,
              String(message),
              String(timestamp),
              meta
            );
          })
        ),
      }),
    ];

    if (this.config.enableFileLogging && this.config.logFilePath) {
      transports.push(
        new winston.transports.File({
          filename: this.config.logFilePath,
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        })
      );
    }

    this.winstonLogger = winston.createLogger({
      level: this.config.level,
      transports,
      exitOnError: false,
    });
  }

  private formatMessage(
    level: string,
    message: string,
    timestamp?: string,
    meta?: any
  ): string {
    let formattedMessage = '';

    // Adicionar timestamp se habilitado
    if (this.config.enableTimestamp && timestamp) {
      const time = new Date(timestamp).toLocaleTimeString('pt-BR');
      formattedMessage += this.config.enableColors
        ? colors.gray(`[${time}] `)
        : `[${time}] `;
    }

    // Adicionar emoji se habilitado
    if (this.config.enableEmojis) {
      const emoji = this.getEmojiForLevel(level);
      formattedMessage += emoji + ' ';
    }

    // Adicionar nível de log
    formattedMessage += this.formatLevel(level);

    // Adicionar mensagem
    formattedMessage += this.config.enableColors
      ? colors.white(` ${message}`)
      : ` ${message}`;

    // Adicionar metadados se existirem
    if (meta && Object.keys(meta).length > 0) {
      formattedMessage += this.config.enableColors
        ? colors.gray(` ${JSON.stringify(meta)}`)
        : ` ${JSON.stringify(meta)}`;
    }

    return formattedMessage;
  }

  private formatLevel(level: string): string {
    if (!this.config.enableColors) {
      return `[${level.toUpperCase()}]`;
    }

    switch (level) {
      case 'error':
        return colors.bold(colors.red(`[${level.toUpperCase()}]`));
      case 'warn':
        return colors.bold(colors.yellow(`[${level.toUpperCase()}]`));
      case 'info':
        return colors.bold(colors.blue(`[${level.toUpperCase()}]`));
      case 'debug':
        return colors.bold(colors.green(`[${level.toUpperCase()}]`));
      case 'verbose':
        return colors.bold(colors.magenta(`[${level.toUpperCase()}]`));
      default:
        return colors.bold(colors.white(`[${level.toUpperCase()}]`));
    }
  }

  private getEmojiForLevel(level: string): string {
    switch (level) {
      case 'error':
        return '❌';
      case 'warn':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'debug':
        return '🔍';
      case 'verbose':
        return '📝';
      default:
        return '📋';
    }
  }

  // Métodos públicos para logging
  public error(message: string, meta?: any): void {
    this.winstonLogger.error(message, meta);
  }

  public warn(message: string, meta?: any): void {
    this.winstonLogger.warn(message, meta);
  }

  public info(message: string, meta?: any): void {
    this.winstonLogger.info(message, meta);
  }

  public debug(message: string, meta?: any): void {
    this.winstonLogger.debug(message, meta);
  }

  public verbose(message: string, meta?: any): void {
    this.winstonLogger.verbose(message, meta);
  }

  // Métodos específicos para diferentes contextos
  public success(message: string, meta?: any): void {
    const successMessage = this.config.enableColors
      ? colors.green(`✅ ${message}`)
      : `✅ ${message}`;
    this.winstonLogger.info(successMessage, meta);
  }

  public database(message: string, meta?: any): void {
    const dbMessage = this.config.enableColors
      ? colors.cyan(`🗄️ ${message}`)
      : `🗄️ ${message}`;
    this.winstonLogger.info(dbMessage, meta);
  }

  public network(message: string, meta?: any): void {
    const netMessage = this.config.enableColors
      ? colors.blue(`🌐 ${message}`)
      : `🌐 ${message}`;
    this.winstonLogger.info(netMessage, meta);
  }

  public security(message: string, meta?: any): void {
    const secMessage = this.config.enableColors
      ? colors.yellow(`🔒 ${message}`)
      : `🔒 ${message}`;
    this.winstonLogger.info(secMessage, meta);
  }

  public mqtt(message: string, meta?: any): void {
    const mqttMessage = this.config.enableColors
      ? colors.magenta(`📡 ${message}`)
      : `📡 ${message}`;
    this.winstonLogger.info(mqttMessage, meta);
  }

  public socket(message: string, meta?: any): void {
    const socketMessage = this.config.enableColors
      ? colors.cyan(`🔌 ${message}`)
      : `🔌 ${message}`;
    this.winstonLogger.info(socketMessage, meta);
  }

  public startup(message: string, meta?: any): void {
    const startupMessage = this.config.enableColors
      ? colors.bold(colors.green(`🚀 ${message}`))
      : `🚀 ${message}`;
    this.winstonLogger.info(startupMessage, meta);
  }

  public shutdown(message: string, meta?: any): void {
    const shutdownMessage = this.config.enableColors
      ? colors.bold(colors.red(`🛑 ${message}`))
      : `🛑 ${message}`;
    this.winstonLogger.info(shutdownMessage, meta);
  }

  // Método para desabilitar cores (útil para logs em arquivo)
  public disableColors(): void {
    this.updateConfig({ enableColors: false });
  }

  // Método para habilitar cores
  public enableColors(): void {
    this.updateConfig({ enableColors: true });
  }

  // Método para alterar nível de log
  public setLevel(level: LogLevel): void {
    this.updateConfig({ level });
  }

  // Método para obter configuração atual
  public getConfig(): LogConfig {
    return { ...this.config };
  }
}

// Exportar instância padrão
export const logger = Logger.getInstance();
