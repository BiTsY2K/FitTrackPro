import { auth } from '@/services/firebase';
import { SESSION_CONFIG } from '@/constants/security';
import { logger } from '@/utils/logger';
import { SecureStorage } from '@/utils/security';

class SessionManager {
  private refreshInterval: NodeJS.Timeout | null = null;
  private idleTimeout: NodeJS.Timeout | null = null;
  private lastActivity: number = Date.now();

  /** Start session management */
  start() {
    this.startTokenRefresh();
    this.startIdleMonitoring();
    logger.info('Session management started');
  }

  /** Stop session management */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
      this.idleTimeout = null;
    }
    logger.info('Session management stopped');
  }

  /** Record user activity */
  recordActivity() {
    this.lastActivity = Date.now();
  }

  /** Auto-refresh tokens before they expire */
  private startTokenRefresh() {
    this.refreshInterval = setInterval(async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const token = await user.getIdToken(true); // Force refresh
          await SecureStorage.set('auth_token', token);
          logger.info('Token refreshed successfully');
        }
      } catch (error) {
        logger.error('Token refresh failed', error as Error);
      }
    }, SESSION_CONFIG.TOKEN_REFRESH_INTERVAL);
  }

  /** Monitor idle time and auto-logout */
  private startIdleMonitoring() {
    const checkIdle = () => {
      const idleTime = Date.now() - this.lastActivity;

      if (idleTime > SESSION_CONFIG.IDLE_TIMEOUT) {
        logger.warn('Session timed out due to inactivity');
        this.logout();
      } else {
        this.idleTimeout = setTimeout(checkIdle, 60000); // Check every minute
      }
    };

    checkIdle();
  }

  /** Logout user */
  private async logout() {
    try {
      await auth.signOut();
      await SecureStorage.clear();
      this.stop();
    } catch (error) {
      logger.error('Logout failed', error as Error);
    }
  }
}

export const sessionManager = new SessionManager();
