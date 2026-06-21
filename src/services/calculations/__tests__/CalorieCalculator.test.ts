import { OnboardingData } from '@/types/onboarding.types';

import { CalorieCalculator } from '../CalorieCalculator';

describe('CalorieCalculator', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for male', () => {
      // 80kg, 180cm, 30 years old male
      const bmr = CalorieCalculator.calculateBMR(80, 180, 30, 'male');

      // Expected: (10 × 80) + (6.25 × 180) - (5 × 30) + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it('should calculate BMR for female', () => {
      // 60kg, 165cm, 25 years old female
      const bmr = CalorieCalculator.calculateBMR(60, 165, 25, 'female');

      // Expected: (10 × 60) + (6.25 × 165) - (5 × 25) - 161 = 1345
      expect(bmr).toBe(1345);
    });
  });

  describe('calculateTDEE', () => {
    it('should calculate TDEE for moderately active person', () => {
      const bmr = 1800;
      const tdee = CalorieCalculator.calculateTDEE(bmr, 'moderately_active');

      // Expected: 1800 × 1.55 = 2790
      expect(tdee).toBe(2790);
    });

    it('should calculate TDEE for sedentary person', () => {
      const bmr = 1500;
      const tdee = CalorieCalculator.calculateTDEE(bmr, 'sedentary');

      // Expected: 1500 × 1.2 = 1800
      expect(tdee).toBe(1800);
    });
  });

  describe('calculateCalorieTarget', () => {
    it('should apply weight loss deficit', () => {
      const tdee = 2500;
      const target = CalorieCalculator.calculateCalorieTarget(tdee, 'lose_weight');

      // Expected: 2500 - 500 = 2000
      expect(target).toBe(2000);
    });

    it('should apply weight gain surplus', () => {
      const tdee = 2500;
      const target = CalorieCalculator.calculateCalorieTarget(tdee, 'gain_muscle');

      // Expected: 2500 + 300 = 2800
      expect(target).toBe(2800);
    });

    it('should enforce minimum calorie floor', () => {
      const tdee = 1000; // Unrealistically low
      const target = CalorieCalculator.calculateCalorieTarget(tdee, 'lose_weight');

      // Should cap at 1200 minimum
      expect(target).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('calculateProteinTarget', () => {
    it('should calculate high protein for weight loss', () => {
      const weight = 80; // kg
      const protein = CalorieCalculator.calculateProteinTarget(weight, 'lose_weight');

      // Expected: 80 × 2.2 = 176g
      expect(protein).toBe(176);
    });

    it('should calculate moderate protein for maintenance', () => {
      const weight = 70; // kg
      const protein = CalorieCalculator.calculateProteinTarget(weight, 'maintain_weight');

      // Expected: 70 × 1.8 = 126g
      expect(protein).toBe(126);
    });
  });

  describe('calculateCarbsTarget', () => {
    it('should calculate carbs from remaining calories', () => {
      const calories = 2000;
      const protein = 150; // 150g = 600 cal
      const fat = 67; // 67g = 603 cal

      // Remaining: 2000 - 600 - 603 = 797 cal
      // Carbs: 797 / 4 = 199g
      const carbs = CalorieCalculator.calculateCarbsTarget(calories, protein, fat);

      expect(carbs).toBeCloseTo(199, 0);
    });
  });

  describe('estimateTimeToGoal', () => {
    it('should estimate time for weight loss', () => {
      const current = 80; // kg
      const target = 75; // kg

      // Difference: 5 kg
      // Rate: 0.5 kg/week
      // Time: 5 / 0.5 = 10 weeks
      const weeks = CalorieCalculator.estimateTimeToGoal(current, target, 'lose_weight');

      expect(weeks).toBe(10);
    });

    it('should return null for maintenance goal', () => {
      const weeks = CalorieCalculator.estimateTimeToGoal(80, 80, 'maintain_weight');

      expect(weeks).toBeNull();
    });
  });

  describe('calculateNutritionPlan', () => {
    it('should calculate complete plan', () => {
      const data = {
        goal: 'lose_weight' as const,
        gender: 'male' as const,
        birthDate: new Date(1990, 0, 1),
        age: 34,
        currentHeightCm: 180,
        currentWeightKg: 85,
        targetWeightKg: 75,
        activityLevel: 'moderately_active' as const,
        workoutFrequencyPerWeek: 4,
        dietType: 'standard' as const,
      } as OnboardingData;

      const plan = CalorieCalculator.calculateNutritionPlan(data);

      // Verify all fields are present
      expect(plan.bmr).toBeGreaterThan(0);
      expect(plan.tdee).toBeGreaterThan(plan.bmr);
      expect(plan.dailyCalorieTarget).toBeGreaterThan(1200);
      expect(plan.dailyProteinGrams).toBeGreaterThan(0);
      expect(plan.dailyFatGrams).toBeGreaterThan(0);
      expect(plan.dailyCarbsGrams).toBeGreaterThan(0);
      expect(plan.dailyWaterMl).toBeGreaterThan(0);
      expect(plan.estimatedWeeksToGoal).toBeGreaterThan(0);
    });
  });
});
