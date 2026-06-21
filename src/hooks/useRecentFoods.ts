import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, limit, orderBy, query, where } from 'firebase/firestore';

import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/services/firebase';
import { FoodItem, FoodLog } from '@/types/food.types';
import { logger } from '@/utils/logger';

const RECENT_FOODS_QUERY_KEY = 'recentFoods';
const MAX_RECENT_FOODS = 20;

/**
 * Hook for recently logged foods
 *
 * Queries the last 50 food_log entries, deduplicates by food ID,
 * and returns up to 20 unique items ordered by recency.
 */
export const useRecentFoods = () => {
  const { user } = useAuth();

  const {
    data: recentFoods,
    isLoading,
    refetch,
  } = useQuery<FoodItem[]>({
    queryKey: [RECENT_FOODS_QUERY_KEY, user?.uid],
    queryFn: async () => {
      if (!user) return [];

      try {
        const q = query(collection(db, 'food_logs'), where('userId', '==', user.uid), orderBy('consumedAt', 'desc'), limit(50));

        const snapshot = await getDocs(q);

        // Deduplicate by food ID — keep only the most recent occurrence //
        const seen = new Set<string>();
        const unique: FoodItem[] = [];

        for (const docSnap of snapshot.docs) {
          const data = docSnap.data() as FoodLog;
          if (!seen.has(data.foodItem.id)) {
            seen.add(data.foodItem.id);
            unique.push(data.foodItem);
          }
          if (unique.length >= MAX_RECENT_FOODS) break;
        }

        logger.info('Recent foods loaded', { count: unique.length });
        return unique;
      } catch (error) {
        logger.error('Failed to load recent foods', error as Error);
        return [];
      }
    },
    enabled: !!user,
    staleTime: 60 * 1000, // 1 minute — invalidated automatically after each food log
  });

  return {
    recentFoods: recentFoods ?? [],
    isLoading,
    refetch,
  };
};
