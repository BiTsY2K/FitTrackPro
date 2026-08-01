export type Sex = 'male' | 'female';
export type Goal = 'lose' | 'maintain' | 'gain';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'athlete';
export type UnitSystem = 'metric' | 'imperial';

export interface BodyStats {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
}

export interface Macros {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Plan extends Macros {
  bmr: number;
  tdee: number;
  calories: number; // daily target
  goal: Goal;
  activityLevel: ActivityLevel;
  paceKgPerWeek: number; // 0 for maintain
}

export interface Timeline {
  weeks: number | null; // null for maintain or no target
  etaIso: string | null; // ISO date string
}
