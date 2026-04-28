/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosInstance } from 'axios';
import Constants from 'expo-constants';

import { APIResponse, FoodItem, NutritionInfo, ServingSize } from '@/types/food.types';
import { logger } from '@/utils/logger';

class OpenFoodFactsAPI {
  private client: AxiosInstance;

  constructor() {
    const appName = Constants.expoConfig?.name || 'FitTrackPro';
    const version = Constants.expoConfig?.version || '1.0.0';

    this.client = axios.create({
      baseURL: 'https://world.openfoodfacts.org/api/v2',
      timeout: 12000, // Increased: OFF is community-run and can be slow
      headers: {
        'User-Agent': `${appName}/${version} (Fitness Tracking App)`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Search foods in Open Food Facts
   *
   * @param query - Search term
   * @param pageSize - Results to return (default: 10)
   * @returns Food items
   */
  async search(query: string, pageSize: number = 10): Promise<APIResponse<FoodItem[]>> {
    try {
      logger.info('OFF search started', { query, pageSize });

      const response = await this.withRetry(() =>
        this.client.get('/search', {
          params: {
            search_terms: query,
            page_size: pageSize,
            json: 1, // integer form handled more reliably by some OFF servers
            fields: 'product_name,brands,serving_size,nutriments,nutriscore_grade,code,categories',
          },
        }),
      );

      const products = response.data.products || [];

      // Filter out products with missing nutrition data
      const validProducts = products.filter((p: any) => p.nutriments && p.nutriments['energy-kcal'] > 0);
      const mapped = validProducts.map((product: any) => this.mapOFFFood(product));

      logger.info('OFF search completed', { query, totalResults: products.length, validResults: mapped.length });
      return { success: true, data: mapped, source: 'OpenFoodFacts', timestamp: new Date() };
    } catch (error) {
      logger.error('OFF search failed', error as Error, { query });
      return { success: false, error: this.getErrorMessage(error), source: 'OpenFoodFacts', timestamp: new Date() };
    }
  }

  /**
   * Get food by barcode
   *
   * @param barcode - UPC/EAN code
   * @returns Single food item or null
   */
  async getByBarcode(barcode: string): Promise<APIResponse<FoodItem | null>> {
    try {
      logger.info('OFF barcode lookup', { barcode });

      const response = await this.withRetry(() =>
        this.client.get(`/product/${barcode}`, {
          params: {
            fields: 'product_name,brands,serving_size,nutriments,nutriscore_grade,code,categories',
          },
        }),
      );

      // Check if product exists
      if (response.data.status === 0) {
        return { success: true, data: null, source: 'OpenFoodFacts', timestamp: new Date() };
      }

      const food = this.mapOFFFood(response.data.product);

      logger.info('OFF barcode found', { barcode, productName: food.name });
      return { success: true, data: food, source: 'OpenFoodFacts', timestamp: new Date() };
    } catch (error) {
      logger.error('OFF barcode lookup failed', error as Error, { barcode });
      return { success: false, error: this.getErrorMessage(error), source: 'OpenFoodFacts', timestamp: new Date() };
    }
  }

  /** Map OFF response to FoodItem */
  private mapOFFFood(product: any): FoodItem {
    const nutrients = product.nutriments || {};

    // Serving size (default to 100g if not specified)
    const servingAmount = this.parseServingSize(product.serving_size) || 100;
    const servingSize: ServingSize = {
      amount: servingAmount,
      unit: this.detectServingUnit(product.serving_size),
      description: product.serving_size || '100g',
      gramsPerServing: servingAmount,
    };

    // Calculate nutrition per serving
    // OFF provides per 100g, we need per serving
    const multiplier = servingAmount / 100;

    const nutrition: NutritionInfo = {
      calories: Math.round((nutrients['energy-kcal_100g'] || nutrients['energy-kcal'] || 0) * multiplier),
      proteinGrams: Number(((nutrients.proteins_100g || nutrients.proteins || 0) * multiplier).toFixed(1)),
      carbsGrams: Number(((nutrients.carbohydrates_100g || nutrients.carbohydrates || 0) * multiplier).toFixed(1)),
      fatGrams: Number(((nutrients.fat_100g || nutrients.fat || 0) * multiplier).toFixed(1)),
      fiberGrams: Number(((nutrients.fiber_100g || nutrients.fiber || 0) * multiplier).toFixed(1)),
      sugarGrams: Number(((nutrients.sugars_100g || nutrients.sugars || 0) * multiplier).toFixed(1)),
      sodiumMg: Math.round((nutrients.sodium_100g || nutrients.sodium || 0) * multiplier * 1000),
      saturatedFatGrams: Number(((nutrients['saturated-fat_100g'] || nutrients['saturated-fat'] || 0) * multiplier).toFixed(1)),
    };

    // Calculate trust score
    const trustScore = this.calculateTrustScore(product);

    return {
      id: `off_${product.code}`,
      name: product.product_name || 'Unknown Product',
      brand: product.brands,
      servingSize,
      nutrition,
      source: 'OpenFoodFacts',
      trustScore,
      verifiedBy: trustScore >= 85 ? 'Community Verified' : undefined,
      barcode: product.code,
      offCode: product.code,
      category: product.categories?.split(',')[0]?.trim(),
      isPublic: true,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
  }

  /** Parse serving size from string (e.g., "150g" → 150) */
  private parseServingSize(servingString?: string): number | null {
    if (!servingString) return null;

    const match = servingString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : null;
  }

  /** Detect serving unit from string */
  private detectServingUnit(servingString?: string): string {
    if (!servingString) return 'g';

    const lower = servingString.toLowerCase();
    if (lower.includes('ml')) return 'ml';
    if (lower.includes('oz')) return 'oz';
    if (lower.includes('cup')) return 'cup';
    if (lower.includes('tbsp')) return 'tbsp';

    return 'g';
  }

  /** Calculate trust score based on data completeness */
  private calculateTrustScore(product: any): number {
    let score = 60; // Base score for community data
    if (product.nutriscore_grade) score += 10; // Bonus for Nutri-Score (shows thorough analysis)
    if (product.brands) score += 5; // Bonus for brand info

    // Bonus for complete nutrition data
    const nutrients = product.nutriments || {};
    if (nutrients.proteins_100g && nutrients.carbohydrates_100g && nutrients.fat_100g) {
      score += 10;
    }

    if (nutrients.fiber_100g) score += 5; // Bonus for fiber data
    if (product.categories) score += 5; // Bonus for categories

    if (!product.product_name || product.product_name === 'Unknown') score -= 20; // Penalty for missing product name
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Retry wrapper for transient server failures
   *
   * OFF is community-run and occasionally returns 503. We retry up to 2 times
   * with exponential back-off. 4xx errors (client mistakes) are NOT retried.
   */
  private async withRetry<T>(fn: () => Promise<T>, retries = 2, baseDelayMs = 600): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          if (status && status >= 400 && status < 500) break; // Client errors (4xx) won't be fixed by retrying — bail immediately
          if (status && status !== 503 && error.response) break; // Non-503 server errors with a response — also bail
        }

        if (attempt < retries) {
          const delay = baseDelayMs * (attempt + 1);
          logger.warn('OFF request retrying', { attempt: attempt + 1, delayMs: delay });
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }

  /** Extract error message */
  private getErrorMessage(error: any): string {
    if (!axios.isAxiosError(error)) {
      return 'Search failed. Please try again.';
    }

    if (error.code === 'ECONNABORTED') return 'Request timeout. Check your connection.';
    if (!error.response) return 'Network error. Check your internet connection.';
    return 'Search failed. Please try again.';
  }
}

export const openFoodFactsAPI = new OpenFoodFactsAPI();
