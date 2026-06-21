export interface NutritionPlan {
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyFatGrams: number;
  dailyCarbsGrams: number;
  dailyWaterMl: number;
}

export type CalculatedNutritionPlan =
  | (NutritionPlan & {
      estimatedWeeksToGoal: number | null;
    })
  | null;
