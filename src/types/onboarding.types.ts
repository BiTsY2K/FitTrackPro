export type Gender = 'male' | 'female';
export type GoalType = 'lose_weight' | 'gain_muscle' | 'maintain_weight' | 'body_recomp';
export type ActivityLevelType = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'low_fat' | 'flexible'; // IIFYM

export type UserBioInfo = { gender: Gender; birthDate: Date; age: number };
export type PhysicalMeasurements_Cm_Kg = { currentHeightCm: number; currentWeightKg: number; targetWeightKg?: number };
export type PhysicalMeasurements_Inches_Lbs = { heightFeets?: number; heightInches?: number; currentWeightLbs?: number; targetWeightLbs?: number }; // prettier-ignore
export type PhysicalActivity = { activityLevel: ActivityLevelType; workoutFrequencyPerWeek: number };

export type MetabolicInfo = { bmr: number; tdee: number };
export type DailyMacroTargets = { dailyCalorieTarget: number; dailyProteinGrams: number; dailyFatGrams: number; dailyCarbsGrams: number; dailyWaterMl: number }; // prettier-ignore
export type NutritionPlan = { metabolicInfo: MetabolicInfo; dailyMacroTargets: DailyMacroTargets };

export type OnboardingData = {
  goal: GoalType;
} & UserBioInfo &
  PhysicalMeasurements_Cm_Kg &
  PhysicalMeasurements_Inches_Lbs &
  PhysicalActivity &
  MetabolicInfo & {
    estimatedWeeksToGoal?: number;

    // Preferences (Optional) //
    dietType: DietType;
    allergies?: string[];
  };
