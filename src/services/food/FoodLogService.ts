import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';

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

  /** Add a food log entry. Calculates totals from servings consumed, denormalized for fast reads. */
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

  /** Get all food logs for a specific local date. Uses start-of-day / end-of-day boundaries (local time). */
  async getDailyLogs(userId: string, date: Date = new Date()): Promise<FoodLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    try {
      const q = query(
        this.logsCollection(),
        where('userId', '==', userId),
        where('consumedAt', '>=', Timestamp.fromDate(startOfDay)),
        where('consumedAt', '<=', Timestamp.fromDate(endOfDay)),
        orderBy('consumedAt', 'asc'),
      );
      const snapshot = await getDocs(q);

      return snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          consumedAt: (data.consumedAt as Timestamp).toDate(),
          createdAt: (data.createdAt as Timestamp).toDate(),
        } as FoodLog;
      });
    } catch (error) {
      logger.error('Failed to get daily logs', error as Error);
      return [];
    }
  }

  /* Delete a food log entry. */
  async deleteFoodLog(userId: string, logId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'food_logs', logId));
      logger.info('Food log deleted', { userId, logId });
    } catch (error) {
      logger.error('Failed to delete food log', error as Error);
      throw error;
    }
  }

  /**
   * Update the user's streak after a successful log entry
   *
   * Logic:
   * - If already logged today → streak unchanged
   * - If last log was yesterday → streak extends by 1
   * - Otherwise → streak resets to 1 (broken streak)
   */
  async updateStreak(
    userId: string,
    currentStreak: number,
    lastLogDate: string | undefined,
  ): Promise<{ currentStreak: number; lastLogDate: string }> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // Already logged today — no change needed //
    if (lastLogDate === today) {
      return { currentStreak, lastLogDate: today };
    }

    const yesterday = new Date(Date.now() - 86_400_000).toISOString().split('T')[0];
    const newStreak = lastLogDate === yesterday ? currentStreak + 1 : 1;

    try {
      await updateDoc(doc(db, 'users', userId), {
        currentStreak: newStreak,
        longestStreak: newStreak, // simplified: will be a Cloud Function later
        lastLogDate: today,
      });
      logger.info('Streak updated', { userId, newStreak, today });
    } catch (error) {
      // Non-critical — don't throw, streak update failure shouldn't block food logging //
      logger.error('Failed to update streak', error as Error);
    }

    return { currentStreak: newStreak, lastLogDate: today };
  }
}

export const foodLogService = new FoodLogService();
