export interface NutritionPlan {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyFatGrams: number;
  dailyCarbsGrams: number;
  dailyWaterMl: number;
  estimatedWeeksToGoal: number | null;
}

export type CalculatedNutritionPlan = NutritionPlan | null;
