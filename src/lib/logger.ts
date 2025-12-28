/* eslint-disable @typescript-eslint/no-explicit-any */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  enabledLevels?: LogLevel[];
  isDevelopment?: boolean;
}

export class Logger {
  private prefix: string;
  private enabledLevels: Set<LogLevel>;
  private isDevelopment: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '[CustomCopy]';
    this.enabledLevels = new Set(
      options.enabledLevels || ['debug', 'info', 'warn', 'error']
    );
    this.isDevelopment = options.isDevelopment ?? process.env.NODE_ENV === 'development';
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, 12);
    const levelEmoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return `${levelEmoji[level]} ${this.prefix} [${timestamp}] ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment && level === 'debug') {
      return false;
    }
    return this.enabledLevels.has(level);
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  group(label: string, collapsed: boolean = false): void {
    if (this.isDevelopment) {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      collapsed ? console.groupCollapsed(label) : console.group(label);
    }
  }

  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd();
    }
  }

  table(data: any): void {
    if (this.isDevelopment) {
      console.table(data);
    }
  }
}

export const storageLogger = new Logger({ prefix: '[Storage]' });

export default Logger;
