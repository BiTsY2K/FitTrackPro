export type FoodSource = 'usda' | 'off' | 'user';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type LogOrigin = 'manual' | 'barcode' | 'ai' | 'voice';

export interface ServingOption {
  label: string;
  grams: number;
}

export interface FoodItem {
  id: string;
  name: string;
  brand: string | null;
  source: FoodSource;
  trustScore: number;
  per100g: { kcal: number; protein: number; carbs: number; fat: number };
  servings: ServingOption[];
  barcode: string | null;
}

export interface FoodEntry {
  id?: string;
  foodId: string;
  name: string;
  brand: string | null;
  grams: number; // resolved serving grams × quantity
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: MealType;
  origin: LogOrigin;
  source: FoodSource;
  trustScore: number;
  createdAt: number;
  _optimistic?: boolean;
}

export interface DailyTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}
