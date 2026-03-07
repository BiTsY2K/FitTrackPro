import { logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics';
import { analytics } from '@/services/firebase';
import Constants from 'expo-constants';

const APP_ENV = Constants.expoConfig?.extra?.appEnv || 'development';
const ANALYTICS_ENABLED = APP_ENV === 'production';

// Event types (strongly typed)
export enum AnalyticsEvent {
  // Authentication
  SIGN_UP = 'sign_up',
  LOGIN = 'login',
  LOGOUT = 'logout',

  // Onboarding
  ONBOARDING_STARTED = 'onboarding_started',
  ONBOARDING_COMPLETED = 'onboarding_completed',
  ONBOARDING_SKIPPED = 'onboarding_skipped',

  // User Events
  PROFILE_UPDATE = 'profile_update',
  EMAIL_VERIFIED = 'email_verified',
  PASSWORD_CHANGED = 'password_changed',
  ACCOUNT_DELETED = 'account_deleted',

  // App Events
  APP_OPEN = 'app_open',
  SCREEN_VIEW = 'screen_view',

  // Feature Usage
  FEATURE_USED = 'feature_used',

  // Error Events
  ERROR_OCCURRED = 'error_occurred',
  // Food Logging
  FOOD_LOGGED_MANUAL = 'food_logged_manual',
  FOOD_LOGGED_BARCODE = 'food_logged_barcode',
  FOOD_LOGGED_AI = 'food_logged_ai',
  FOOD_SEARCH = 'food_search',

  EXERCISE_LOGGED = 'exercise_logged', // Exercise
  WATER_LOGGED = 'water_logged', // Water

  // Premium (Subscription Events)
  PREMIUM_SCREEN_VIEWED = 'premium_screen_viewed',
  SUBSCRIPTION_STARTED = 'subscription_started',
  SUBSCRIPTION_CANCELLED = 'subscription_cancelled',
  SUBSCRIPTION_RENEWED = 'subscription_renewed',

  // Engagement
  STREAK_ACHIEVED = 'streak_achieved',
  GOAL_REACHED = 'goal_reached',
}

// Log event helper
export const logEvent = (eventName: string, params?: Record<string, any>) => {
  if (!ANALYTICS_ENABLED || !analytics) {
    console.log(`[Analytics] ${eventName}`, params);
    return;
  }

  try {
    firebaseLogEvent(analytics, eventName, {
      ...params,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Analytics error:', error);
  }
};

// Set user ID (after login)
export const setAnalyticsUserId = (userId: string) => {
  if (!ANALYTICS_ENABLED || !analytics) return;

  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.error('Analytics setUserId error:', error);
  }
};

// Set user properties
export const setAnalyticsUserProperties = (properties: Record<string, any>) => {
  if (!ANALYTICS_ENABLED || !analytics) return;

  try {
    setUserProperties(analytics, properties);
  } catch (error) {
    console.error('Analytics setUserProperties error:', error);
  }
};

// Screen tracking
export const logScreenView = (screenName: string) => {
  logEvent(AnalyticsEvent.FOOD_SEARCH, {
    // Reusing existing event type
    screen_name: screenName,
    screen_class: screenName,
  });
};
