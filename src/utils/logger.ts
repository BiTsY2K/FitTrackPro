import * as Sentry from '@sentry/react-native';

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    // In production, only log warnings and errors
    if (__DEV__) return true;
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  debug(message: string, data?: any) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`🔍 [DEBUG] ${message}`, data || '');
    }
  }

  info(message: string, data?: any) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`ℹ️  [INFO] ${message}`, data || '');
    }
  }

  warn(message: string, data?: any) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`⚠️  [WARN] ${message}`, data || '');

      Sentry.captureMessage(message, {
        level: 'warning',
        extra: data,
      });
    }
  }

  error(message: string, error?: Error, data?: any) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`❌ [ERROR] ${message}`, error, data || '');

      if (error) {
        Sentry.captureException(error, {
          extra: {
            message,
            ...data,
          },
        });
      }
    }
  }
}

export const logger = new Logger();

/**
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDev = __DEV__;

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  if (!isDev && level === 'debug') return;
  const timestamp = new Date().toISOString();
  console[level](`[${timestamp}] [${level.toUpperCase()}] ${message}`, ...args);
};

export const logger = {
  debug: (message: string, ...args: unknown[]) => log('debug', message, ...args),
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) => log('error', message, ...args),
};
**/
