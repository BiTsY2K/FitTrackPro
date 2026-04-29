export type FoodSource = 'USDA' | 'OpenFoodFacts' | 'Nutritionix' | 'User' | 'Cache'; // Food source determines trust level and caching strategy
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'; // Meal types for contextual suggestions

export type FoodLogItem = { name: string; cal: number; p: number; c: number; f: number };
export type MealLog = { type: string; label: string; icon: string; time: string; calories: number; items: FoodLogItem[] };

// type DailyLog = { calories: number; protein: number; carbs: number; fat: number; water: number; meals: MealLog[] };
// type NutritionPlan = { dailyCalorieTarget: number; dailyProteinGrams: number; dailyCarbsGrams: number; dailyFatGrams: number; dailyWaterMl: number };

/**
 * Nutrition information - optimized for common use cases
 * Extended nutrients (vitamins, minerals) stored separately to reduce payload
 */
export interface NutritionInfo {
  // Macros (always present)
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;

  // Common nutrients (optional)
  fiberGrams?: number;
  sugarGrams?: number;
  sodiumMg?: number;
  saturatedFatGrams?: number;

  // Extended nutrients stored in separate collection (premium feature)
  hasExtendedNutrients?: boolean;
}

/**  Serving size with multiple representation options */
export interface ServingSize {
  amount: number;
  unit: string; // "g", "ml", "oz", "cup", "tbsp", "piece", etc.
  description?: string; // "1 medium apple (182g)"
  gramsPerServing?: number; // For unit conversion
}

/**
 * Food item - core data structure
 * Optimized for Firestore indexing and caching
 */
export interface FoodItem {
  id: string;
  name: string;
  brand?: string | undefined;
  description?: string | undefined;

  // Serving //
  servingSize: ServingSize;
  alternativeServings?: ServingSize[]; // Common alternatives

  // Nutrition (per serving) //
  nutrition: NutritionInfo;

  // Data Quality //
  source: FoodSource;
  trustScore: number; // 0-100 (100 = USDA verified)
  verifiedBy?: string;
  barcode?: string; // UPC/EAN

  // API References //
  fdcId?: string; // USDA FoodData Central ID
  offCode?: string; // Open Food Facts code

  category?: string;
  tags?: string[];

  // Ownership
  isPublic: boolean;
  createdBy?: string; // User ID if custom

  cacheKey?: string;
  cachedAt?: Date;
  lastUpdated: Date;
  createdAt: Date;
}

/** Food log entry — stored in /food_logs/{logId} (top-level, userId-scoped by rules) */
export interface FoodLog {
  id: string;
  userId: string;

  // Food reference (denormalized for performance)
  foodItem: FoodItem;

  // Consumption
  servingsConsumed: number;
  mealType: MealType;

  // Denormalized YYYY-MM-DD — enables equality-based daily query without composite index
  // dateString: string;

  // Calculated totals (denormalized to avoid recomputation on reads)
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
  totalWaterMl: number;

  // Timestamps
  consumedAt: Date; // When they ate
  createdAt: Date; // When they logged

  // Optional
  notes?: string;
  photoUrl?: string;
}

/**
 * Daily summary - aggregated statistics
 */
export interface DailySummary {
  id: string; // Format: userId_YYYY-MM-DD
  userId: string;
  date: Date;

  // Consumed totals
  totalCalories: number;
  totalProteinGrams: number;
  totalCarbsGrams: number;
  totalFatGrams: number;
  totalFiberGrams: number;

  // Exercise (added in Week 5)
  exerciseCaloriesBurned: number;

  // Net
  netCalories: number;

  // Targets (snapshot from user profile)
  calorieTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;

  // Progress percentages
  caloriePercentage: number;
  proteinPercentage: number;
  carbsPercentage: number;
  fatPercentage: number;

  // Metadata
  mealsLogged: number;
  lastUpdated: Date;
}

/**
 * Search result with highlighting
 */
export interface SearchResult extends FoodItem {
  relevanceScore?: number;
  matchedTerms?: string[];
}

/**
 * API response wrapper for error handling
 */
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  source?: FoodSource;
  cached?: boolean;
  timestamp: Date;
}
