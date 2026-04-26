import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

import { logger } from '@/utils/logger';

/**
 * Daily water log — persisted to AsyncStorage with a per-day key.
 *
 * Resets automatically when the date changes (next calendar day).
 * No Firestore needed — water is logged per-tap and doesn't require cross-device sync at this stage.
 */
export const useWaterLog = (date: Date = new Date()) => {
  const [waterMl, setWaterMl] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Key is scoped to the calendar date so tomorrow starts fresh automatically //
  const key = `water_log_${date.toISOString().split('T')[0]}`;

  useEffect(() => {
    loadWater();
  }, [key]);

  const loadWater = async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      setWaterMl(stored ? parseInt(stored, 10) : 0);
    } catch (error) {
      logger.error('Failed to load water log', error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Add ml to today's total — optimistic update then persisted to AsyncStorage
   */
  const addWater = useCallback(
    async (ml: number) => {
      try {
        const newTotal = waterMl + ml;
        setWaterMl(newTotal); // Optimistic update //
        await AsyncStorage.setItem(key, String(newTotal));
        logger.info('Water logged', { ml, totalMl: newTotal });
      } catch (error) {
        logger.error('Failed to save water log', error as Error);
      }
    },
    [waterMl, key],
  );

  /**
   * Reset today's water (e.g. for testing / support)
   */
  const resetWater = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(key);
      setWaterMl(0);
    } catch (error) {
      logger.error('Failed to reset water log', error as Error);
    }
  }, [key]);

  return { waterMl, addWater, resetWater, isLoading };
};
