import type { ActivityLevel, Goal, Sex } from '@/lib/nutrition/types';

export interface OnboardingDraft {
  goal?: Goal;
  sex?: Sex;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  activityLevel?: ActivityLevel;
  targetKg?: number;
  paceKgPerWeek?: number;
}
