import type { ActivityLevel, Goal, Plan, Sex, UnitSystem } from '@/lib/nutrition/types';

export interface UserProfile {
  schemaVersion: number;
  sex: Sex;
  age: number;
  heightCm: number;
  startWeightKg: number;
  targetKg: number | null;
  goal: Goal;
  activityLevel: ActivityLevel;
  units: UnitSystem;
  plan: Plan;
  createdAt: number;
  updatedAt: number;
}
