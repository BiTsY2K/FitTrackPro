import * as Sentry from '@sentry/react-native';
import { Extras } from 'react-native/Libraries/Utilities/IPerformanceLogger';

enum LogLevel { DEBUG = 'debug', INFO = 'info', WARN = 'warn', ERROR = 'error' } // prettier-ignore

class Logger {
  private get timeStamp(): string {
    return new Date().toString();
  }

  private shouldLog(level: LogLevel): boolean {
    if (__DEV__) return true; // In production, only log warnings and errors
    return level === LogLevel.WARN || level === LogLevel.ERROR;
  }

  debug(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(`\t🔍 [${this.timeStamp}] [DEBUG]\t${message}`, data || '');
    }
  }

  info(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(`\tℹ️  [${this.timeStamp}] [INFO]\t${message}`, data || '');
    }
  }

  warn(message: string, data?: Record<string, unknown>) {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(`\t⚠️  [${this.timeStamp}] [WARN]\t${message}`, data || '');
      Sentry.captureMessage(message, { level: 'warning', extra: data as Extras });
    }
  }

  error(message: string, error?: Error, data?: Record<string, unknown>) {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(`\t❌ [${this.timeStamp}] [ERROR]\t${message}`, error, data || '');
      if (error) Sentry.captureException(error, { extra: { message, ...data } });
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
