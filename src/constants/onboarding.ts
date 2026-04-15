import React from 'react';

import { ActivityLevelType, DietType, GoalType } from '@/types/onboarding.types';

// Activity Level Multipliers (Mifflin-St Jeor based) //
export const ACTIVITY_MULTIPLIERS: Record<ActivityLevelType, number> = {
  sedentary: 1.2, // BMR × 1.2
  lightly_active: 1.375, // BMR × 1.375
  moderately_active: 1.55, // BMR × 1.55
  very_active: 1.725, // BMR × 1.725
  extremely_active: 1.9, // BMR × 1.9
} as const;

// Goal Calorie Adjustments (calories per day) //
export const GOAL_ADJUSTMENTS: Record<GoalType, number> = {
  lose_weight: -500, // 1 lb/week loss
  gain_muscle: 300, // 0.5-0.75 lb/week gain (lean mass)
  maintain_weight: 0, // Maintenance
  body_recomp: -200, // Slight deficit for recomp
} as const;

// Protein Targets (grams per kg bodyweight) //
export const PROTEIN_TARGETS: Record<GoalType, number> = {
  lose_weight: 2.2, // Higher protein to preserve muscle
  gain_muscle: 2.0, // Muscle building
  maintain_weight: 1.8, // Maintenance
  body_recomp: 2.2, // Recomp needs high protein
} as const;

// Fat Targets (percentage of calories) //
export const FAT_PERCENTAGE: Partial<Record<DietType, number>> = {
  standard: 0.25, // 25% of calories
  keto: 0.7, // 70% for keto
  low_fat: 0.2, // 20% for low-fat diets
} as const;

// Safe Weight Loss/Gain Rates (kg per week) //
export const SAFE_RATES: Partial<Record<GoalType, number>> = {
  lose_weight: 0.5, // 0.5 kg/week (1.1 lbs)
  gain_muscle: 0.25, // 0.25 kg/week (0.55 lbs)
} as const;

// Calorie per kg of bodyweight //
export const CALORIES_PER_KG: number = 7700; // 7700 kcal = 1 kg bodyweight

// Activity Level Descriptions //
export const ACTIVITY_DESCRIPTIONS: Record<ActivityLevelType, string> = {
  sedentary: 'Desk job, minimal activity',
  lightly_active: 'Light exercise 1-3 days/week',
  moderately_active: 'Moderate exercise 3-5 days/week',
  very_active: 'Intense exercise 6-7 days/week',
  extremely_active: 'Athlete or physical job + training',
} as const;

// Goal Descriptions //
export const GOAL_DESCRIPTIONS: Record<GoalType, string> = {
  lose_weight: 'Lose fat, preserve muscle',
  gain_muscle: 'Build muscle, minimize fat',
  maintain_weight: 'Stay at current weight',
  body_recomp: 'Lose fat and gain muscle simultaneously',
} as const;

// Loading Steps //
export const LOADING_STEPS: { icon: React.ReactNode; text: string }[] = [
  { icon: '🧬', text: 'Running Mifflin-St Jeor equation…' },
  { icon: '⚖️', text: 'Calculating your TDEE…' },
  { icon: '🥩', text: 'Optimising macronutrient ratios…' },
  { icon: '💧', text: 'Calibrating hydration targets…' },
  { icon: '📅', text: 'Estimating your timeline…' },
  { icon: '✅', text: 'Finalising your plan…' },
];
