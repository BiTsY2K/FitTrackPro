import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { foodAPIService } from '@/services/food/FoodAPIService';
import { logger } from '@/utils/logger';

const RECENT_SEARCHES_KEY = 'recent_food_searches';
const MAX_RECENT_SEARCHES = 10;

/** Food search hook with debouncing and caching */
export const useFoodSearch = () => {
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Debounce search query (300ms) //
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load recent searches on mount //
  useEffect(() => { loadRecentSearches() }, []); // prettier-ignore

  /* prettier-ignore */
  // Search query (cached for 5 minutes) //
  const { data: results, isLoading, error, refetch } = useQuery({
    queryKey: ['foodSearch', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) return [];
    
      logger.info('Food search query', { query: debouncedQuery });
      
      const results = await foodAPIService.search(debouncedQuery, 20);
      if (results.length > 0) await addRecentSearch(debouncedQuery); // Save to recent searches

      return results;
    },

    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (previously cacheTime)
  });

  const loadRecentSearches = async () => {
    try {
      const stored = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);

      if (!stored) return;
      setRecentSearches(JSON.parse(stored));
    } catch (error) {
      logger.error('Failed to load recent searches', error as Error);
    }
  };

  const addRecentSearch = async (search: string) => {
    try {
      const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, MAX_RECENT_SEARCHES);

      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      logger.error('Failed to save recent search', error as Error);
    }
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      logger.error('Failed to clear recent searches', error as Error);
    }
  };

  return {
    query,
    setQuery,
    results: results || [],
    isLoading,
    error,
    recentSearches,
    clearRecentSearches,
    refetch,
  };
};
