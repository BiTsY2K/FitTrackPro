import { FieldValue, Timestamp } from '@firebase/firestore';

import { ActivityLevelType, DietType, Gender, GoalType } from './onboarding.types';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  // ── Onboarding Data ── //
  gender: Gender;
  birthDate: Date;
  currentHeightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  goal: GoalType;
  activityLevel: ActivityLevelType;
  workoutFrequencyPerWeek: number;
  dietType: DietType;
  allergies?: string[];

  // ── Calculated Targets ── //
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyFatGrams: number;
  dailyCarbsGrams: number;
  dailyWaterMl: number;

  // ── Metadata ── //
  createdAt: Date | Timestamp | FieldValue;
  updatedAt: Date | Timestamp | FieldValue;
  isPremium: boolean;
  premiumExpiresAt?: Date | Timestamp | FieldValue;
}
