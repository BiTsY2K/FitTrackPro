export type Gender = 'male' | 'female' | 'other';
export type Goal = 'lose_weight' | 'gain_weight' | 'maintain_weight';
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietType = 'standard' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'other';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;

  // Onboarding Data
  gender: Gender;
  birthDate: Date;
  heightCm: number;
  currentWeightKg: number;
  targetWeightKg?: number;
  goal: Goal;
  activityLevel: ActivityLevel;
  workoutFrequencyPerWeek: number;
  dietType: DietType;
  allergies?: string[];

  // Calculated Targets
  bmr: number;
  tdee: number;
  dailyCalorieTarget: number;
  dailyProteinGrams: number;
  dailyFatGrams: number;
  dailyCarbsGrams: number;
  dailyWaterMl: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  isPremium: boolean;
  premiumExpiresAt?: Date;
}
