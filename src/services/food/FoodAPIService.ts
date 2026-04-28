import { search as fuzzySearch } from 'fast-fuzzy';

import { FoodItem, SearchResult } from '@/types/food.types';
import { logger } from '@/utils/logger';

import { openFoodFactsAPI } from './OpenFoodFactsAPI';
import { usdaAPI } from './USDAFoodAPI';

/**
 * Unified Food API Service
 *
 * Orchestrates multiple food databases with intelligent routing:
 * - USDA: Best for whole foods, ingredients
 * - Open Food Facts: Best for packaged foods, barcodes
 *
 * Strategy: 1. Try both APIs in parallel, 2. Deduplicate results, 3. Sort by trust score, 4. Return top N results
 */
class FoodAPIService {
  /**
   * Search all available databases
   *
   * @param query - Search term
   * @param maxResults - Maximum results to return
   * @returns Deduplicated, sorted food items
   */
  async search(query: string, maxResults: number = 20): Promise<FoodItem[]> {
    const startTime = Date.now();
    logger.info('Food search started', { maxResults, query });

    try {
      // Search both APIs in parallel (faster than sequential) //
      const [usdaResponse, offResponse] = await Promise.all([usdaAPI.search(query, 15), openFoodFactsAPI.search(query, 15)]);
      const allResults: FoodItem[] = []; // Collect successful results

      if (usdaResponse.success && usdaResponse.data) {
        allResults.push(...usdaResponse.data);
      } else if (usdaResponse.error) {
        logger.warn('USDA search failed', { error: usdaResponse.error });
      }

      if (offResponse.success && offResponse.data) {
        allResults.push(...offResponse.data);
      } else if (offResponse.error) {
        logger.warn('OFF search failed', { error: offResponse.error });
      }

      // If both failed, return empty //
      if (allResults.length === 0) {
        logger.error('All food APIs failed', new Error('No results from any source'));
        return [];
      }

      const unique = this.deduplicateFoods(allResults); // Deduplicate by name + brand
      const scored = this.scoreResults(query, unique); // Calculate relevance scores

      // Sort by relevance × trust score //
      const sorted = scored.sort((a, b) => {
        const scoreA = (a.relevanceScore || 0) * (a.trustScore / 100);
        const scoreB = (b.relevanceScore || 0) * (b.trustScore / 100);
        return scoreB - scoreA;
      });

      const limited = sorted.slice(0, maxResults); // Limit results

      const duration = Date.now() - startTime;
      logger.info('Food search completed', { query, usdaCount: usdaResponse.data?.length || 0, offCount: offResponse.data?.length || 0, 
        uniqueCount: unique.length, finalCount: limited.length, durationMs: duration }); // prettier-ignore
      return limited;
    } catch (error) {
      logger.error('Food search failed', error as Error, { query });
      return [];
    }
  }

  /** Deduplicate foods by name + brand. Keep the one with highest trust score */
  private deduplicateFoods(foods: FoodItem[]): FoodItem[] {
    const seen = new Map<string, FoodItem>();

    for (const food of foods) {
      // Create unique key (case-insensitive)
      const name = food.name.toLowerCase().trim();
      const brand = (food.brand || '').toLowerCase().trim();
      const key = `${name}|${brand}`;

      const existing = seen.get(key);

      // Keep the one with higher trust score //
      if (!existing || food.trustScore > existing.trustScore) {
        seen.set(key, food);
      }
    }

    return Array.from(seen.values());
  }

  /** Calculate relevance scores using fuzzy matching */
  private scoreResults(query: string, foods: FoodItem[]): SearchResult[] {
    const queryLower = query.toLowerCase();

    return foods.map(food => {
      const nameLower = food.name.toLowerCase().trim();
      const brandLower = (food.brand || '').toLowerCase().trim();

      // Exact match bonus
      let score = 0;
      if (nameLower === queryLower) score = 100;
      else if (nameLower.startsWith(queryLower)) score = 90;
      else if (nameLower.includes(queryLower)) score = 80;

      // Brand match bonus
      if (brandLower.includes(queryLower)) score += 10;

      // Fuzzy match if no exact/partial match
      if (score === 0) {
        // Use fast-fuzzy for similarity
        const nameScore = fuzzySearch(queryLower, [nameLower], { returnMatchData: true })[0];
        score = nameScore ? nameScore.score * 100 : 0;
      }

      return {
        ...food,
        relevanceScore: score,
      };
    });
  }

  /** Check if APIs are available */
  isAvailable(): { usda: boolean; off: boolean; any: boolean } {
    const usda = usdaAPI.isAvailable();
    const off = true; // OFF is always available (no key required)

    return { usda, off, any: usda || off };
  }
}

export const foodAPIService = new FoodAPIService();
