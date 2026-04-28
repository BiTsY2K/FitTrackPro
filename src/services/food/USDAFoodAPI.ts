/* eslint-disable @typescript-eslint/no-explicit-any */

import axios, { AxiosError, AxiosInstance } from 'axios';
import Constants from 'expo-constants';

import { APIResponse, FoodItem, NutritionInfo, ServingSize } from '@/types/food.types';
import { logger } from '@/utils/logger';

class USDAFoodAPI {
  private client: AxiosInstance;
  private apiKey: string;
  private requestCount: number = 0;
  private resetTime: number = Date.now() + 60 * 60 * 1000;

  constructor() {
    this.apiKey = Constants.expoConfig?.extra?.usdaApiKey || '';
    if (!this.apiKey) logger.warn('USDA API key not configured. Food search will be limited.');

    this.client = axios.create({
      baseURL: 'https://api.nal.usda.gov/fdc/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for rate limiting //
    this.client.interceptors.request.use(
      config => {
        // Reset counter every hour
        if (Date.now() > this.resetTime) {
          this.requestCount = 0;
          this.resetTime = Date.now() + 3600000;
        }

        // Check rate limit
        if (this.requestCount >= 1000) {
          throw new Error('USDA API rate limit exceeded. Try again in an hour.');
        }

        this.requestCount++;
        return config;
      },

      error => Promise.reject(error),
    );
  }

  /**
   * Search foods in USDA database using keywords
   *
   * @param query - Search term (e.g., "chicken breast")
   * @param pageSize - Results to return (default: 10, max: 50)
   * @returns Food items with USDA data
   */
  async search(query: string, pageSize: number = 10): Promise<APIResponse<FoodItem[]>> {
    try {
      logger.info('USDA search started', { query, pageSize });

      const response = await this.client.get('/foods/search', {
        params: {
          api_key: this.apiKey,
          query,
          pageSize: Math.min(pageSize, 50),
          dataType: 'SR Legacy', // Optional. Filter on a specific data type. Available values: Branded, Foundation, Survey (FNDDS), SR Legacy
          sortBy: 'dataType.keyword', // Optional. Specify one of the possible values to sort by that field. Available values: dataType, lowercaseDescription, fdcId, publishedDate
          sortOrder: 'asc',
        },
      });

      const foods = response.data.foods || [];
      const mapped = foods.map((food: any) => this.mapUSDAFood(food));

      logger.info('USDA search completed', { query, resultsCount: mapped.length, requestsRemaining: 1000 - this.requestCount });
      return { success: true, data: mapped, source: 'USDA', timestamp: new Date() };
    } catch (error) {
      logger.error('USDA search failed', error as Error, { query });
      return { success: false, error: this.getErrorMessage(error as AxiosError), source: 'USDA', timestamp: new Date() };
    }
  }

  /**
   * Get food by FDC ID
   *
   * @param fdcId - USDA FoodData Central ID
   * @returns Single food item
   */
  async getById(fdcId: string): Promise<APIResponse<FoodItem>> {
    try {
      const response = await this.client.get(`/food/${fdcId}`, {
        params: {
          api_key: this.apiKey,
          format: 'full',
        },
      });

      const food = this.mapUSDAFood(response.data);
      return { success: true, data: food, source: 'USDA', timestamp: new Date() };
    } catch (error) {
      logger.error('USDA getById failed', error as Error, { fdcId });
      return { success: false, error: this.getErrorMessage(error as AxiosError), source: 'USDA', timestamp: new Date() };
    }
  }

  /** Map USDA API response to our FoodItem type */
  private mapUSDAFood(usdaFood: any): FoodItem {
    /* prettier-ignore */
    // USDA Nutrient IDs (standardized across datasets) //
    const NUTRIENT_IDS = { CALORIES: 1008, CARBS: 1005, FAT: 1004, FIBER: 1079, PROTEIN: 1003, 
      SATURATED_FAT: 1258, SODIUM: 1093, SUGAR: 2000,
    };

    const nutrients = usdaFood.foodNutrients || []; // Extract nutrients
    const getNutrient = (nutrientId: number): number => {
      const nutrient = nutrients.find((n: Record<string, unknown>) => n.nutrientId === nutrientId);
      return nutrient?.value || 0;
    };

    // Serving size (USDA defaults to 100g) //
    const servingSize: ServingSize = {
      amount: usdaFood.servingSize || 100,
      unit: usdaFood.servingSizeUnit || 'g',
      description: usdaFood.servingSizeUnit ? `${usdaFood.servingSize} ${usdaFood.servingSizeUnit}` : '100g',
      gramsPerServing: usdaFood.servingSize || 100,
    };

    // Nutrition per serving //
    const nutrition: NutritionInfo = {
      calories: getNutrient(NUTRIENT_IDS.CALORIES),
      proteinGrams: getNutrient(NUTRIENT_IDS.PROTEIN),
      carbsGrams: getNutrient(NUTRIENT_IDS.CARBS),
      fatGrams: getNutrient(NUTRIENT_IDS.FAT),
      fiberGrams: getNutrient(NUTRIENT_IDS.FIBER),
      sugarGrams: getNutrient(NUTRIENT_IDS.SUGAR),
      sodiumMg: getNutrient(NUTRIENT_IDS.SODIUM),
      saturatedFatGrams: getNutrient(NUTRIENT_IDS.SATURATED_FAT),
    };

    return {
      id: `usda_${usdaFood.fdcId}`,
      name: this.cleanFoodName(usdaFood.description),
      brand: usdaFood.brandOwner,
      servingSize,
      nutrition,
      source: 'USDA',
      trustScore: 100, // USDA is gold standard
      verifiedBy: 'USDA',
      fdcId: String(usdaFood.fdcId),
      category: usdaFood.foodCategory,
      isPublic: true,
      createdAt: new Date(usdaFood.publicationDate || Date.now()),
      lastUpdated: new Date(usdaFood.publicationDate || Date.now()),
    };
  }

  /** Clean food names (USDA uses uppercase, add punctuation) */
  private cleanFoodName(name: string): string {
    /* prettier-ignore */
    // Convert to title case //
    return name.toLowerCase().split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  }

  /** Extract user-friendly error message */
  private getErrorMessage(error: AxiosError): string {
    if (!axios.isAxiosError(error)) {
      return 'Search failed. Please try again.';
    }

    if (error.response?.status === 403) return 'Invalid API key. Please check your USDA credentials.';
    if (error.response?.status === 429) return 'Rate limit exceeded. Try again in an hour.';
    if (error.code === 'ECONNABORTED') return 'Request timeout. Check your connection.';
    if (!error.response) return 'Network error. Check your internet connection.';

    return 'Search failed. Please try again.';
  }

  /** Get remaining API quota */
  getRemainingQuota(): number {
    return Math.max(0, 1000 - this.requestCount);
  }

  /** Check if API is available */
  isAvailable(): boolean {
    return !!this.apiKey && this.requestCount < 1000;
  }
}

export const usdaAPI = new USDAFoodAPI();
