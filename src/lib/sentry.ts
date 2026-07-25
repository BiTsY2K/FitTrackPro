import * as Sentry from '@sentry/react-native';

import { env, isProd } from '@/config/env';

import { logger } from './logger';

export const navigationIntegration = Sentry.reactNavigationIntegration({ enableTimeToInitialDisplay: true });

export const initializeSentry = (): boolean => {
  if (!env.SENTRY_DSN) {
    logger.warn('[Sentry] Sentry DSN not found, error tracking disabled');
    return false;
  }

  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.APP_ENV,
    debug: !isProd,
    tracesSampleRate: isProd ? 0.2 : 1.0, // Performance Monitoring
    enableAutoPerformanceTracing: true,
    integrations: [navigationIntegration],

    // Session Replay (Beta)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      if (event.user) delete event.user.email; // Remove user email from events
      if (event.request?.headers) delete event.request.headers['Authorization']; // Remove sensitive headers

      const originalError = hint?.originalException;
      if (originalError instanceof Error) {
        logger.error(`Original error message: ${originalError.message}`);
      }

      return event;
    },
  });

  logger.info('[Sentry] Sentry initialized');
  return true;
};

// Helper to capture user context
export const setSentryUser = (userId: string, email?: string) => {
  Sentry.setUser({ id: userId, ...(!isProd && email ? { email } : {}) });
};

// Helper to clear user on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};
