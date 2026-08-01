import { z } from 'zod';

export const goalSchema = z.object({ goal: z.enum(['lose', 'maintain', 'gain']) });

export const statsSchema = z.object({
  sex: z.enum(['male', 'female']),
  age: z.number().int().min(13, 'Must be at least 13').max(100),
  heightCm: z.number().min(120).max(250),
  weightKg: z.number().min(30).max(400),
});

export const activitySchema = z.object({
  activityLevel: z.enum(['sedentary', 'light', 'moderate', 'active', 'athlete']),
});

export const targetSchema = z.object({
  targetKg: z.number().min(30).max(400),
  paceKgPerWeek: z.number().min(0.1).max(1.0),
});
