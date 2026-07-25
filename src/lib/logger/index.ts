import * as Sentry from '@sentry/react-native';

import { isProd } from '@/config/env';

type Level = 'debug' | 'info' | 'warn' | 'error';

function emit(level: Level, message: string, ctx?: Record<string, unknown>) {
  if (!isProd) {
    const timeStamp = new Date().toString();
    const fn = level === 'debug' || level === 'info' ? 'log' : level;

    // eslint-disable-next-line no-console
    console[fn === 'log' ? 'log' : fn](`[${timeStamp}] [${level}] ${message}`, ctx ?? '');
  }

  const sentryLevel = level === 'debug' ? 'debug' : level === 'warn' ? 'warning' : level;
  Sentry.addBreadcrumb({ category: 'app', level: sentryLevel, message, data: ctx });
  if (level === 'error') {
    const err = ctx?.error instanceof Error ? ctx.error : new Error(message);
    Sentry.captureException(err, { extra: ctx });
  }
}

export const logger = {
  debug: (m: string, c?: Record<string, unknown>) => emit('debug', m, c),
  info: (m: string, c?: Record<string, unknown>) => emit('info', m, c),
  warn: (m: string, c?: Record<string, unknown>) => emit('warn', m, c),
  error: (m: string, c?: Record<string, unknown>) => emit('error', m, c),
};
