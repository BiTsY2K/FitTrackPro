import { OnboardingData } from '@/types/onboarding.types';
import { logger } from '@/utils/logger';

/**
 * Validation Service
 * Ensures all inputs are safe and reasonable before calculations
 */
export class ValidationService {
  /**
   * Validate age
   * Must be between 13 and 100 years
   */
  static validateAge(age: number): { valid: boolean; error?: string } {
    if (age < 13) {
      return {
        valid: false,
        error: 'You must be at least 13 years old to use this app',
      };
    }

    if (age > 100) {
      return {
        valid: false,
        error: 'Please verify your birth date',
      };
    }

    return { valid: true };
  }

  /**
   * Validate height
   * Must be between 120cm (3'11") and 220cm (7'3")
   */
  static validateHeight(heightCm: number): { valid: boolean; error?: string } {
    if (heightCm < 120) {
      return {
        valid: false,
        error: 'Height must be at least 120cm (3\'11")',
      };
    }

    if (heightCm > 220) {
      return {
        valid: false,
        error: 'Height must be less than 220cm (7\'3")',
      };
    }

    return { valid: true };
  }

  /**
   * Validate weight
   * Must be between 30kg (66lbs) and 300kg (660lbs)
   */
  static validateWeight(weightKg: number): { valid: boolean; error?: string } {
    if (weightKg < 30) {
      return {
        valid: false,
        error: 'Weight must be at least 30kg (66lbs)',
      };
    }

    if (weightKg > 300) {
      return {
        valid: false,
        error: 'Weight must be less than 300kg (660lbs)',
      };
    }

    return { valid: true };
  }

  /**
   * Validate target weight (if applicable)
   * Must be reasonable relative to current weight
   */
  static validateTargetWeight(currentWeightKg: number, targetWeightKg: number, goal: string): { valid: boolean; error?: string } {
    const weightDiff = Math.abs(currentWeightKg - targetWeightKg);

    // Target weight too close to current (< 0.5 kg)
    if (weightDiff < 0.5) {
      return {
        valid: false,
        error: 'Target weight should differ from current weight by at least 0.5kg',
      };
    }

    // Losing too much (> 40% of body weight)
    if (goal === 'lose_weight' && targetWeightKg < currentWeightKg * 0.6) {
      return {
        valid: false,
        error: 'Target weight loss is too aggressive. Please consult a healthcare provider.',
      };
    }

    // Gaining too much (> 50% of body weight)
    if (goal === 'gain_weight' && targetWeightKg > currentWeightKg * 1.5) {
      return {
        valid: false,
        error: 'Target weight gain is too aggressive. Please set a more moderate goal.',
      };
    }

    // Target in wrong direction
    if (goal === 'lose_weight' && targetWeightKg >= currentWeightKg) {
      return {
        valid: false,
        error: 'Target weight must be less than current weight for weight loss',
      };
    }

    if (goal === 'gain_weight' && targetWeightKg <= currentWeightKg) {
      return {
        valid: false,
        error: 'Target weight must be more than current weight for weight gain',
      };
    }

    return { valid: true };
  }

  /**
   * Validate complete onboarding data
   */
  static validateOnboardingData(data: OnboardingData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate age
    const ageValidation = this.validateAge(data.age);
    if (!ageValidation.valid) {
      errors.push(ageValidation.error!);
    }

    // Validate height
    const heightValidation = this.validateHeight(data.heightCm);
    if (!heightValidation.valid) {
      errors.push(heightValidation.error!);
    }

    // Validate current weight
    const weightValidation = this.validateWeight(data.currentWeightKg);
    if (!weightValidation.valid) {
      errors.push(weightValidation.error!);
    }

    // Validate target weight (if applicable)
    if (data.targetWeightKg) {
      const targetValidation = this.validateTargetWeight(data.currentWeightKg, data.targetWeightKg, data.goal);
      if (!targetValidation.valid) {
        errors.push(targetValidation.error!);
      }
    }

    // Log validation result
    if (errors.length > 0) {
      logger.warn('Onboarding data validation failed', { errors });
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate calculated plan (safety checks)
   */
  static validateCalculatedPlan(plan: {
    dailyCalorieTarget: number;
    dailyProteinGrams: number;
    dailyFatGrams: number;
    dailyCarbsGrams: number;
  }): { valid: boolean; warnings: string[] } {
    const warnings: string[] = [];

    // Check minimum calories (1200 for women, 1500 for men)
    // We use 1200 as absolute minimum
    if (plan.dailyCalorieTarget < 1200) {
      warnings.push('Calorie target is below recommended minimum. Consider increasing activity level or adjusting goal.');
    }

    // Check protein isn't too high (> 3.0 g/kg is excessive)
    // We don't have weight here, so check if protein > 40% of calories
    const proteinCalories = plan.dailyProteinGrams * 4;
    const proteinPercentage = proteinCalories / plan.dailyCalorieTarget;
    if (proteinPercentage > 0.4) {
      warnings.push('Protein intake is very high. This is safe but may be unnecessary.');
    }

    // Check fat isn't too low (< 15% can affect hormones)
    const fatCalories = plan.dailyFatGrams * 9;
    const fatPercentage = fatCalories / plan.dailyCalorieTarget;
    if (fatPercentage < 0.15) {
      warnings.push('Fat intake is very low. Consider increasing for hormonal health.');
    }

    // Check carbs aren't negative (shouldn't happen, but safety check)
    if (plan.dailyCarbsGrams < 0) {
      warnings.push('Carbohydrate calculation error. Please review your inputs.');
    }

    return {
      valid: warnings.length === 0,
      warnings,
    };
  }
}
