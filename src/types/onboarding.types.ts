export type Gender = 'male' | 'female';
export type GoalType = 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'body_recomp';
export type ActivityLevelType = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'low_fat' | 'flexible'; // IIFYM

export interface OnboardingData {
  // Step 1: Goal
  goal: GoalType;

  // Step 2: Bio Data
  gender: Gender;
  birthDate: Date;
  age: number; // Calculated from birthDate

  // Step 3: Measurements
  heightFeet?: number; // For US users
  heightInches?: number;
  currentHeightCm: number;
  currentWeightKg: number;
  currentWeightLbs?: number; // For US users
  targetWeightKg?: number;
  targetWeightLbs?: number;

  // Step 4: Activity
  activityLevel: ActivityLevelType;
  workoutFrequencyPerWeek: number; // 0-7

  // Step 5: Preferences (Optional)
  dietType: DietType;
  allergies?: string[];

  // Calculated Results
  bmr?: number;
  tdee?: number;
  dailyCalorieTarget?: number;
  dailyProteinGrams?: number;
  dailyFatGrams?: number;
  dailyCarbsGrams?: number;
  estimatedWeeksToGoal?: number;
}
