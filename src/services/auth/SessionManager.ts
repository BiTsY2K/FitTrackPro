import { AppState, AppStateStatus } from 'react-native';

import { SESSION_CONFIG } from '@/constants/security';
import { auth } from '@/services/firebase';
import { logger } from '@/utils/logger';
import { SecureStorage } from '@/utils/security';

class SessionManager {
  private refreshInterval: NodeJS.Timeout | null = null;
  private appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;
  private backgroundedAt: number | null = null;

  /** Start session management (call on sign-in) */
  start() {
    this.startTokenRefresh();
    this.startAppStateMonitoring();
    logger.info('Session management started');
  }

  /** Stop session management (call on sign-out) */
  stop() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }
    logger.info('Session management stopped');
  }

  /**
   * Auto-refresh Firebase ID tokens before they expire
   * Firebase tokens expire after 60 minutes — we refresh at 55 min
   */
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

  /**
   * Monitor app foreground/background state
   *
   * If the app is backgrounded for more than SESSION_CONFIG.SESSION_TIMEOUT
   * (30 days), force sign-out. This handles stolen-device scenarios while
   * allowing normal multi-hour use without interruption.
   */
  private startAppStateMonitoring() {
    this.appStateSubscription = AppState.addEventListener('change', (nextState: AppStateStatus) => {
      if (nextState === 'background' || nextState === 'inactive') {
        this.backgroundedAt = Date.now();
        logger.info('App backgrounded');
      } else if (nextState === 'active') {
        if (this.backgroundedAt !== null) {
          const backgroundDuration = Date.now() - this.backgroundedAt;
          this.backgroundedAt = null;

          // Only sign out if backgrounded longer than the session timeout (30 days) //
          if (backgroundDuration > SESSION_CONFIG.SESSION_TIMEOUT) {
            logger.warn('Session expired after extended background period');
            this.logout();
          } else {
            logger.info('App foregrounded, session still valid', {
              backgroundedForMs: backgroundDuration,
            });
          }
        }
      }
    });
  }

  /** Sign out and clear stored credentials */
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
