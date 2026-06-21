/* eslint-disable @typescript-eslint/no-explicit-any */
import * as Sentry from '@sentry/react-native';

import { logger } from './logger';

/**
 * Security Audit Logger
 * Logs security events for monitoring
 */
class SecurityAudit {
  /** Log authentication event */
  logAuthEvent(event: 'login' | 'signup' | 'logout' | 'failed_login', metadata?: any) {
    logger.info(`\t🛡️[SECURITY] Auth event: ${event}`, metadata);
    Sentry.addBreadcrumb({ category: 'auth', message: `Auth event: ${event}`, level: 'info', data: metadata });
  }

  /** Log suspicious activity */
  logSuspiciousActivity(activity: string, metadata?: any) {
    logger.warn(`\t🛡️[SECURITY] Suspicious activity: ${activity}`, metadata);
    Sentry.captureMessage(`Suspicious activity: ${activity}`, { level: 'warning', extra: metadata });
  }

  /** Log data access */
  logDataAccess(resource: string, action: 'read' | 'write' | 'delete', metadata?: any) {
    logger.info(`\t🛡️[SECURITY] Data access: ${action} ${resource}`, metadata);
  }

  /** Log permission violation */
  logPermissionViolation(violation: string, metadata?: any) {
    logger.error(`\t🛡️[SECURITY] Permission violation: ${violation}`, metadata);
    Sentry.captureException(new Error(`Permission violation: ${violation}`), {
      extra: metadata,
    });
  }
}

export const securityAudit = new SecurityAudit();
