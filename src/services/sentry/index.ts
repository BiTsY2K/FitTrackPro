import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn;
const APP_ENV = Constants.expoConfig?.extra?.appEnv || 'development';

export const initializeSentry = () => {
  if (!SENTRY_DSN) {
    console.warn('⚠️  Sentry DSN not found, error tracking disabled');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: APP_ENV,
    debug: APP_ENV === 'development',

    // Performance Monitoring
    tracesSampleRate: APP_ENV === 'production' ? 0.2 : 1.0,

    enableAutoPerformanceTracing: true,

    // Session Replay (Beta)
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Filter out sensitive data
    beforeSend(event, hint) {
      // Remove user email from events
      if (event.user) delete event.user.email;

      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['Authorization'];
      }

      const originalError = hint?.originalException;
      if (originalError instanceof Error) {
        console.log('Original error message:', originalError.message);
      }

      return event;
    },
  });

  console.log('✅ Sentry initialized');
};

// Helper to capture user context
export const setSentryUser = (userId: string, email?: string) => {
  Sentry.setUser({
    id: userId,
    // Do NOT send email in production for privacy
    ...(APP_ENV !== 'production' && email ? { email } : {}),
  });
};

// Helper to clear user on logout
export const clearSentryUser = () => {
  Sentry.setUser(null);
};
