import { addDoc, collection, Timestamp } from 'firebase/firestore';

import { FoodItem, FoodLog, MealType } from '@/types/food.types';
import { logger } from '@/utils/logger';

import { db } from '../firebase';

/**
 * Recursively removes keys whose value is `undefined` from a plain object.
 *
 * WHY: Firestore's addDoc/setDoc throw:
 *   "Unsupported field value: undefined"
 * when any nested key is `undefined`. Optional fields on FoodItem (brand,
 * description, fiberGrams, etc.) are frequently absent on USDA results and
 * arrive as `undefined`. Stripping them before the write avoids the error
 * while preserving Firestore's schema — absent optional fields simply don't
 * appear in the document, which is idiomatic Firestore usage.
 *
 * Note: `null` is a valid Firestore value and is NOT removed.
 */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(stripUndefined) as unknown as T;
  }
  if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, stripUndefined(v)]),
    ) as T;
  }
  return value;
}

/**
 * Firestore Food Log Service
 *
 * Handles all food logging persistence:
 * - Add / delete log entries (top-level: food_logs/{logId} with userId field)
 * - Query logs by date range for daily summaries
 * - Streak update after each successful log
 *
 * Collection: food_logs/{logId}
 * Security rules require userId field on every document (see firestore.rules).
 */
class FoodLogService {
  /** Reference to the top-level food_logs collection */
  private logsCollection = () => collection(db, 'food_logs');

  /**
   * Add a food log entry
   *
   * Calculates totals from servings consumed, denormalized for fast reads.
   */
  async addFoodLog(userId: string, foodItem: FoodItem, servingsConsumed: number, mealType: MealType): Promise<FoodLog> {
    logger.info('Adding food log', { userId, foodId: foodItem.id, servingsConsumed, mealType });

    // Denormalize totals upfront — avoids recomputation during reads //
    const totalCalories = Math.round(foodItem.nutrition.calories * servingsConsumed);
    const totalProteinGrams = Math.round(foodItem.nutrition.proteinGrams * servingsConsumed * 10) / 10;
    const totalCarbsGrams = Math.round(foodItem.nutrition.carbsGrams * servingsConsumed * 10) / 10;
    const totalFatGrams = Math.round(foodItem.nutrition.fatGrams * servingsConsumed * 10) / 10;

    const now = Timestamp.now();

    // Strip undefined from foodItem before embedding in Firestore document.
    // Firestore does not support undefined values — optional FoodItem fields
    // (brand, description, fiberGrams, etc.) are often absent on USDA results.
    const sanitizedFoodItem = stripUndefined(foodItem);

    const logData = {
      userId,
      foodItem: sanitizedFoodItem,
      servingsConsumed,
      mealType,
      totalCalories,
      totalProteinGrams,
      totalCarbsGrams,
      totalFatGrams,
      totalWaterMl: 0,
      consumedAt: now,
      createdAt: now,
    };

    try {
      const docRef = await addDoc(this.logsCollection(), logData);
      logger.info('Food log added', { logId: docRef.id });

      return {
        id: docRef.id,
        ...logData,
        foodItem, // return the original (with optionals) to the caller
        consumedAt: now.toDate(),
        createdAt: now.toDate(),
      };
    } catch (error) {
      logger.error('Failed to add food log', error as Error);
      throw error;
    }
  }
}

export const foodLogService = new FoodLogService();
