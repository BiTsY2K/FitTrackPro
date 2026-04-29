import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/contexts/AuthContext';
import { foodLogService } from '@/services/food/FoodLogService';
import { FoodItem, FoodLog, MealType } from '@/types/food.types';
import { UserProfile } from '@/types/users.types';
import { logger } from '@/utils/logger';

const DAILY_LOG_QUERY_KEY = 'dailyFoodLogs';

export type AddFoodParams = { foodItem: FoodItem; servings: number; mealType: MealType };
export type DailyTotals = { calories: number; protein: number; carbs: number; fat: number; water: number };

interface UseFoodLogReturn {
  logs: FoodLog[];
  isLoading: boolean;
  isFetching: boolean;
  dailyTotals: DailyTotals;
  logsByMeal: Record<MealType, FoodLog[]>;
  addFood: (params: AddFoodParams) => Promise<void>;
  deleteFood: (logId: string) => Promise<void>;
  isAdding: boolean;
  isDeleting: boolean;
  refetch: () => Promise<unknown>;
}

/**
 * Hook for daily food log state management
 *
 * Handles:
 * - Real-time daily log fetching (react-query cached)
 * - Macro aggregation across all entries
 * - Add / delete mutations with cache invalidation
 * - Streak update after each successful add
 */
export const useFoodLog = (date: Date = new Date(), profile?: UserProfile | null): UseFoodLogReturn => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // ── Daily log query ── //
  const {
    data: logs,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [DAILY_LOG_QUERY_KEY, user?.uid, date.toDateString()],
    queryFn: () => foodLogService.getDailyLogs(user!.uid, date),
    enabled: !!user,
    staleTime: 30 * 1000, // 30 seconds — balance between freshness and API calls
  });

  // ── Aggregate daily totals from all log entries ── //
  const dailyTotals = (logs || []).reduce<DailyTotals>(
    (acc: DailyTotals, log: FoodLog) => ({
      calories: acc.calories + log.totalCalories,
      protein: acc.protein + log.totalProteinGrams,
      carbs: acc.carbs + log.totalCarbsGrams,
      fat: acc.fat + log.totalFatGrams,
      water: acc.water + log.totalWaterMl,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, water: 0 },
  );

  // ── Group logs by meal type ── //
  const logsByMeal = (logs || []).reduce<Record<MealType, FoodLog[]>>(
    (acc: Record<MealType, FoodLog[]>, log: FoodLog) => {
      acc[log.mealType] = [...(acc[log.mealType] || []), log];
      return acc;
    },
    { breakfast: [], lunch: [], dinner: [], snack: [] },
  );

  // ── Add food mutation ── //
  const { mutateAsync: addFoodMutation, isPending: isAdding } = useMutation({
    mutationFn: ({ foodItem, servings, mealType }: AddFoodParams) => foodLogService.addFoodLog(user!.uid, foodItem, servings, mealType),

    onSuccess: async () => {
      // Refresh daily logs immediately //
      queryClient.invalidateQueries({ queryKey: [DAILY_LOG_QUERY_KEY, user?.uid] });

      // Update streak (non-blocking) //
      if (profile) {
        await foodLogService.updateStreak(user!.uid, profile.currentStreak ?? 0, profile.lastLogDate);
      }

      logger.info('Food log added, cache invalidated');
    },

    onError: error => {
      logger.error('Failed to add food log', error as Error);
    },
  });

  const addFood = async (params: AddFoodParams) => {
    await addFoodMutation(params);
  };

  // ── Delete food mutation ── //
  const { mutateAsync: deleteFoodMutation, isPending: isDeleting } = useMutation({
    mutationFn: (logId: string) => foodLogService.deleteFoodLog(user!.uid, logId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [DAILY_LOG_QUERY_KEY, user?.uid] });
      logger.info('Food log deleted, cache invalidated');
    },
    onError: error => {
      logger.error('Failed to delete food log', error as Error);
    },
  });

  const deleteFood = async (logId: string) => {
    await deleteFoodMutation(logId);
  };

  return {
    logs: logs || [],
    isLoading,
    isFetching,
    dailyTotals,
    logsByMeal,
    addFood,
    deleteFood,
    isAdding,
    isDeleting,
    refetch,
  };
};
