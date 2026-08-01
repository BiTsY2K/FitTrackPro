import { ActivityLevel, BodyStats, Goal, Macros, Plan, Sex, Timeline } from '@/lib/nutrition/types';

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
};

const KCAL_PER_KG = 7700; // approx energy in 1 kg body mass
const MAX_PACE = 1.0; // kg/week safety cap
const SEX_CAL_FLOOR: Record<Sex, number> = { male: 1500, female: 1200 }; // common guideline floors

/** Mifflin–St Jeor Basal Metabolic Rate. */
export function bmrMifflin({ sex, age, heightCm, weightKg }: BodyStats): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return Math.round(base + (sex === 'male' ? 5 : -161));
}

/** Total Daily Energy Expenditure */
export function tdee(bmr: number, level: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_FACTORS[level]);
}

/**
 * Goal-adjusted daily calories.
 * pace is kg/week (positive magnitude); clamped to MAX_PACE.
 * Applies a safety floor: never below max(BMR*1.1, sex floor).
 */
export function targetCalories(tdeeVal: number, bmr: number, goal: Goal, sex: Sex, paceKgPerWeek: number): number {
  const pace = Math.min(Math.abs(paceKgPerWeek), MAX_PACE);
  const dailyDelta = (pace * KCAL_PER_KG) / 7; // e.g. 0.45 kg/wk ≈ 495 kcal/day
  let target = tdeeVal;
  if (goal === 'lose') target = tdeeVal - dailyDelta;
  else if (goal === 'gain') target = tdeeVal + dailyDelta;
  const floor = Math.max(Math.round(bmr * 1.1), SEX_CAL_FLOOR[sex]);
  return Math.max(Math.round(target), floor);
}

/** Protein-first macro split. Protein scales with bodyweight; fat = 25% kcal; carbs = remainder. */
export function macros(calories: number, weightKg: number, goal: Goal): Macros {
  const proteinPerKg = goal === 'lose' ? 2.0 : 1.8; // higher protein when cutting
  const proteinG = Math.round(weightKg * proteinPerKg);
  const fatG = Math.round((calories * 0.25) / 9);
  const remainder = calories - proteinG * 4 - fatG * 9;
  const carbsG = Math.max(0, Math.round(remainder / 4));
  return { proteinG, carbsG, fatG };
}

/** Estimated weeks + ETA to reach target weight at the chosen pace. */
export function estimateTimeline(
  currentKg: number,
  targetKg: number | null,
  goal: Goal,
  paceKgPerWeek: number,
  from: Date = new Date(),
): Timeline {
  if (goal === 'maintain' || targetKg == null || paceKgPerWeek <= 0) {
    return { weeks: null, etaIso: null };
  }
  const delta = Math.abs(currentKg - targetKg);
  const weeks = Math.ceil(delta / Math.min(paceKgPerWeek, MAX_PACE));
  const eta = new Date(from.getTime() + weeks * 7 * 24 * 60 * 60 * 1000);
  return { weeks, etaIso: eta.toISOString() };
}

/** Composes the full plan. Single entry point reused on device + Cloud Functions. */
export function buildPlan(stats: BodyStats, goal: Goal, activityLevel: ActivityLevel, paceKgPerWeek: number): Plan {
  const bmr = bmrMifflin(stats);
  const tdeeVal = tdee(bmr, activityLevel);
  const pace = goal === 'maintain' ? 0 : Math.min(Math.abs(paceKgPerWeek), MAX_PACE);
  const calories = targetCalories(tdeeVal, bmr, goal, stats.sex, pace);
  const m = macros(calories, stats.weightKg, goal);
  return { bmr, tdee: tdeeVal, calories, goal, activityLevel, paceKgPerWeek: pace, ...m };
}
