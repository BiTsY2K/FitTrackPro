import { FieldValue, Timestamp } from '@firebase/firestore';

import { NutritionPlan, OnboardingData } from './onboarding.types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  onboardingData: OnboardingData | Partial<OnboardingData>;
  nutritionPlan: NutritionPlan;

  // ── Streak Tracking ── //
  currentStreak?: number; // Consecutive days with at least one food log
  longestStreak?: number; // All-time best streak
  lastLogDate?: string; // YYYY-MM-DD of last food log entry

  // ── Metadata ── //
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  isPremium: boolean;
  premiumExpiresAt?: Date | Timestamp | FieldValue;
}
