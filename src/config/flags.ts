export const defaultFlags = {
  ai_meal_recognition: false,
  voice_logging: false,
  social_feed: false,
  premium_gates: false,
} as const;

export type FeatureFlag = keyof typeof defaultFlags;
export type Flags = Record<FeatureFlag, boolean>;
