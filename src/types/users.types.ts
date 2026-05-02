import { FieldValue, Timestamp } from '@firebase/firestore';

import { NutritionPlan, OnboardingData } from './onboarding.types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  // Set during onboarding, populated incrementally //
  onboardingData: OnboardingData | Partial<OnboardingData>;

  // Populated only after PlanSummaryScreen completes //
  nutritionPlan?: NutritionPlan;
  onboardingCompletedAt?: Date | Timestamp | FieldValue;

  // ── Streak Tracking ── //
  currentStreak?: number; // Consecutive days with at least one food log
  longestStreak?: number; // All-time best streak
  lastLogDate?: string; // YYYY-MM-DD of last food log entry

  // ── Metadata ── //
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  isPremium?: boolean;
  premiumExpiresAt?: Date | Timestamp | FieldValue;
}
