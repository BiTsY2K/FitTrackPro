import Constants from 'expo-constants';
import { getAnalytics, isSupported, logEvent as firebaseLogEvent, setUserId, setUserProperties } from 'firebase/analytics';

import { app } from '@/lib/firebase';

const APP_ENV = Constants.expoConfig?.extra?.appEnv || 'development';
const ANALYTICS_ENABLED = APP_ENV === 'production';

// Event types (strongly typed)
/* prettier-ignore */
export const AnalyticsEvent = {
  AppOpen: 'app-open', ScreenView: 'screen_view', // App Events
  SignUp: 'sign_up', Login: 'login', Logout: 'logout', // Authentication
  OnboardingStarts: 'onboarding_starts', OnboardingComplete: 'onboarding_complete',
  OnboardingSkips: 'onboarding_skips', // Onboarding

  // User Events
  PROFILE_UPDATE: 'profile_update',
  EMAIL_VERIFIED: 'email_verified',
  PASSWORD_CHANGED: 'password_changed',
  ACCOUNT_DELETED: 'account_deleted',

  // Feature Usage
  FEATURE_USED: 'feature_used',

  // Error Events
  ERROR_OCCURRED: 'error_occurred',

  // Food Logging
  FOOD_LOGGED_MANUAL: 'food_logged_manual',
  FOOD_LOGGED_BARCODE: 'food_logged_barcode',
  FOOD_LOGGED_AI: 'food_logged_ai',
  FOOD_SEARCH: 'food_search',

  EXERCISE_LOGGED: 'exercise_logged', // Exercise
  WATER_LOGGED: 'water_logged', // Water

  // Premium (Subscription Events)
  PREMIUM_SCREEN_VIEWED: 'premium_screen_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_RENEWED: 'subscription_renewed',

  // Engagement
  STREAK_ACHIEVED: 'streak_achieved',
  GOAL_REACHED: 'goal_reached',
};

// eslint-disable-next-line @typescript-eslint/no-redeclare
export type AnalyticsEvent = (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

let analytics: ReturnType<typeof getAnalytics> | null = null;
void isSupported().then(ok => {
  if (ok) analytics = getAnalytics(app);
});

// Log event helper
export const logEvent = (eventName: AnalyticsEvent, params?: Record<string, unknown>) => {
  if (!ANALYTICS_ENABLED || !analytics) {
    console.warn(`[${new Date().toString()}] [Analytics] ${eventName}`, params);
  }

  try {
    if (analytics) firebaseLogEvent(analytics, eventName, { ...params, timestamp: new Date().toString() });
  } catch (error) {
    console.error(`[${new Date().toString()}] [Analytics] Analytics error:`, error);
  }
};

// Set user ID (after login)
export const setAnalyticsUserId = (userId: string) => {
  if (!ANALYTICS_ENABLED || !analytics) return;

  try {
    setUserId(analytics, userId);
  } catch (error) {
    console.warn('Analytics setUserId error:', error);
  }
};

// Set user properties
export const setAnalyticsUserProperties = (properties: Record<string, unknown>) => {
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
