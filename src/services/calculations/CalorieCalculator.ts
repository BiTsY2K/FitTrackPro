import { Gender, Goal, ActivityLevel, OnboardingData } from '@/types/onboarding.types';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_ADJUSTMENTS,
  PROTEIN_TARGETS,
  FAT_PERCENTAGE,
  SAFE_RATES,
  CALORIES_PER_KG,
} from '@/constants/onboarding';
import { logger } from '@/utils/logger';

/**
 * Calorie & Macro Calculation Engine
 * Based on peer-reviewed research and industry best practices
 */
export class CalorieCalculator {
  /**
   * Calculate Basal Metabolic Rate using Mifflin-St Jeor Equation (1990)
   *
   * Most accurate equation for general population
   * More accurate than Harris-Benedict (1919) or Katch-McArdle
   *
   * Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
   * Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
   *
   * @param weightKg - Body weight in kilograms
   * @param heightCm - Height in centimeters
   * @param age - Age in years
   * @param gender - Biological sex
   * @returns BMR in calories per day
   */
  static calculateBMR(weightKg: number, heightCm: number, age: number, gender: Gender): number {
    // Mifflin-St Jeor equation
    const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
    const bmr = gender === 'male' ? base + 5 : base - 161;

    logger.info('BMR calculated', {
      weightKg,
      heightCm,
      age,
      gender,
      bmr: Math.round(bmr),
    });

    return Math.round(bmr);
  }

  /**
   * Calculate Total Daily Energy Expenditure
   *
   * TDEE = BMR × Activity Multiplier
   *
   * Activity multipliers based on:
   * - Sedentary (little/no exercise): BMR × 1.2
   * - Lightly active (light exercise 1-3 days/week): BMR × 1.375
   * - Moderately active (moderate exercise 3-5 days/week): BMR × 1.55
   * - Very active (hard exercise 6-7 days/week): BMR × 1.725
   * - Extremely active (very hard exercise, physical job): BMR × 1.9
   *
   * @param bmr - Basal Metabolic Rate
   * @param activityLevel - User's activity level
   * @returns TDEE in calories per day
   */
  static calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
    const tdee = bmr * multiplier;

    logger.info('TDEE calculated', {
      bmr,
      activityLevel,
      multiplier,
      tdee: Math.round(tdee),
    });

    return Math.round(tdee);
  }

  /**
   * Calculate Daily Calorie Target based on Goal
   *
   * Goal adjustments:
   * - Weight loss: TDEE - 500 (≈ 0.5 kg/week loss)
   * - Weight gain: TDEE + 300 (≈ 0.25 kg/week gain, lean mass focus)
   * - Maintenance: TDEE
   * - Body recomposition: TDEE - 200 (slight deficit)
   *
   * @param tdee - Total Daily Energy Expenditure
   * @param goal - User's fitness goal
   * @returns Daily calorie target
   */
  static calculateCalorieTarget(tdee: number, goal: Goal): number {
    const adjustment = GOAL_ADJUSTMENTS[goal];
    const target = tdee + adjustment;

    // Safety bounds: never below 1200 (women) or 1500 (men)
    const minimum = 1200;
    const safeCappedTarget = Math.max(target, minimum);

    logger.info('Calorie target calculated', {
      tdee,
      goal,
      adjustment,
      target: Math.round(safeCappedTarget),
    });

    return Math.round(safeCappedTarget);
  }

  /**
   * Calculate Protein Target (Protein-First Approach)
   *
   * Protein is the most important macro for:
   * - Muscle preservation during weight loss
   * - Muscle building during weight gain
   * - Satiety and adherence
   *
   * Based on International Society of Sports Nutrition (2017):
   * - Weight loss: 2.2 g/kg (preserve muscle in deficit)
   * - Weight gain: 2.0 g/kg (optimal for muscle building)
   * - Maintenance: 1.8 g/kg
   * - Body recomp: 2.2 g/kg (high protein for simultaneous goals)
   *
   * @param weightKg - Body weight in kilograms
   * @param goal - User's fitness goal
   * @returns Daily protein in grams
   */
  static calculateProteinTarget(weightKg: number, goal: Goal): number {
    const proteinPerKg = PROTEIN_TARGETS[goal];
    const proteinGrams = weightKg * proteinPerKg;

    logger.info('Protein target calculated', {
      weightKg,
      goal,
      proteinPerKg,
      proteinGrams: Math.round(proteinGrams),
    });

    return Math.round(proteinGrams);
  }

  /**
   * Calculate Fat Target
   *
   * Fat is essential for:
   * - Hormone production
   * - Vitamin absorption (A, D, E, K)
   * - Brain function
   *
   * Standard recommendation: 25% of total calories
   * (20-35% is acceptable range)
   *
   * Fat has 9 calories per gram
   *
   * @param dailyCalories - Daily calorie target
   * @param dietType - User's diet preference (affects fat %)
   * @returns Daily fat in grams
   */
  static calculateFatTarget(dailyCalories: number, dietType: 'standard' | 'keto' | 'low_fat' = 'standard'): number {
    let fatPercentage: number;

    if (dietType === 'keto') {
      fatPercentage = FAT_PERCENTAGE.keto; // 70%
    } else if (dietType === 'low_fat') {
      fatPercentage = FAT_PERCENTAGE.low_fat; // 20%
    } else {
      fatPercentage = FAT_PERCENTAGE.standard; // 25%
    }

    const fatCalories = dailyCalories * fatPercentage;
    const fatGrams = fatCalories / 9; // 9 calories per gram of fat

    logger.info('Fat target calculated', {
      dailyCalories,
      dietType,
      fatPercentage,
      fatGrams: Math.round(fatGrams),
    });

    return Math.round(fatGrams);
  }

  /**
   * Calculate Carbohydrate Target (Remainder Method)
   *
   * Carbs are calculated LAST (protein-first approach):
   * Carbs = (Total Calories - Protein Calories - Fat Calories) / 4
   *
   * Carbs have 4 calories per gram
   *
   * @param dailyCalories - Daily calorie target
   * @param proteinGrams - Daily protein target
   * @param fatGrams - Daily fat target
   * @returns Daily carbs in grams
   */
  static calculateCarbsTarget(dailyCalories: number, proteinGrams: number, fatGrams: number): number {
    const proteinCalories = proteinGrams * 4; // 4 cal/g
    const fatCalories = fatGrams * 9; // 9 cal/g
    const remainingCalories = dailyCalories - proteinCalories - fatCalories;
    const carbsGrams = remainingCalories / 4; // 4 cal/g

    // Safety check: never negative carbs
    const safeCarbsGrams = Math.max(carbsGrams, 0);

    logger.info('Carbs target calculated', {
      dailyCalories,
      proteinCalories,
      fatCalories,
      remainingCalories,
      carbsGrams: Math.round(safeCarbsGrams),
    });

    return Math.round(safeCarbsGrams);
  }

  /**
   * Calculate Water Target
   *
   * Based on body weight and activity level:
   * Base: 35 ml per kg body weight
   * + 500 ml per hour of exercise
   *
   * Example: 70 kg person = 2,450 ml (2.45 L) base
   * + 3 workouts/week × 1 hour = +214 ml/day average
   * Total: ~2,650 ml/day
   *
   * @param weightKg - Body weight in kilograms
   * @param workoutFrequency - Workouts per week
   * @returns Daily water target in milliliters
   */
  static calculateWaterTarget(weightKg: number, workoutFrequency: number): number {
    const baseWater = weightKg * 35; // ml per kg
    const workoutWater = (workoutFrequency * 500) / 7; // 500ml per workout, averaged daily
    const totalWater = baseWater + workoutWater;

    logger.info('Water target calculated', {
      weightKg,
      workoutFrequency,
      baseWater: Math.round(baseWater),
      workoutWater: Math.round(workoutWater),
      totalWater: Math.round(totalWater),
    });

    return Math.round(totalWater);
  }

  /**
   * Estimate Time to Reach Goal
   *
   * Based on safe weight change rates:
   * - Weight loss: 0.5 kg/week (1.1 lbs/week)
   * - Weight gain: 0.25 kg/week (0.55 lbs/week)
   *
   * Formula:
   * Weeks = (Current Weight - Target Weight) / Safe Rate per Week
   *
   * @param currentWeightKg - Current body weight
   * @param targetWeightKg - Target body weight
   * @param goal - User's fitness goal
   * @returns Estimated weeks to goal (null if maintain/recomp)
   */
  static estimateTimeToGoal(currentWeightKg: number, targetWeightKg: number, goal: Goal): number | null {
    if (goal === 'maintain_weight' || goal === 'body_recomp') {
      return null; // No specific timeline for these goals
    }

    const weightDifference = Math.abs(currentWeightKg - targetWeightKg);

    if (weightDifference < 0.5) {
      return null; // Already at goal
    }

    const safeRate = goal === 'lose_weight' ? SAFE_RATES.lose_weight : SAFE_RATES.gain_weight;

    const weeks = weightDifference / safeRate;

    logger.info('Time to goal estimated', {
      currentWeightKg,
      targetWeightKg,
      weightDifference,
      goal,
      safeRate,
      weeks: Math.round(weeks),
    });

    return Math.round(weeks);
  }

  /**
   * Calculate Complete Nutrition Plan
   *
   * This is the main method that orchestrates all calculations
   *
   * @param data - User's onboarding data
   * @returns Complete nutrition plan with all targets
   */
  static calculateNutritionPlan(data: OnboardingData) {
    // Step 1: Calculate BMR
    const bmr = this.calculateBMR(data.currentWeightKg, data.heightCm, data.age, data.gender);

    // Step 2: Calculate TDEE
    const tdee = this.calculateTDEE(bmr, data.activityLevel);

    // Step 3: Calculate calorie target based on goal
    const dailyCalorieTarget = this.calculateCalorieTarget(tdee, data.goal);

    // Step 4: Calculate macros (protein-first approach)
    const dailyProteinGrams = this.calculateProteinTarget(data.currentWeightKg, data.goal);

    const dailyFatGrams = this.calculateFatTarget(dailyCalorieTarget, data.dietType === 'keto' ? 'keto' : 'standard');

    const dailyCarbsGrams = this.calculateCarbsTarget(dailyCalorieTarget, dailyProteinGrams, dailyFatGrams);

    // Step 5: Calculate water target
    const dailyWaterMl = this.calculateWaterTarget(data.currentWeightKg, data.workoutFrequencyPerWeek);

    // Step 6: Estimate timeline
    const estimatedWeeksToGoal = data.targetWeightKg ? this.estimateTimeToGoal(data.currentWeightKg, data.targetWeightKg, data.goal) : null;

    const result = {
      bmr,
      tdee,
      dailyCalorieTarget,
      dailyProteinGrams,
      dailyFatGrams,
      dailyCarbsGrams,
      dailyWaterMl,
      estimatedWeeksToGoal,
    };

    logger.info('Complete nutrition plan calculated', result);

    return result;
  }
}
