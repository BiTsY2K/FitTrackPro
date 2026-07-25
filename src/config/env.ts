import Constants from 'expo-constants';
import { z } from 'zod';

const schema = z.object({
  APP_ENV: z.enum(['development', 'staging', 'production']),
  FIREBASE_API_KEY: z.string().min(1),
  FIREBASE_AUTH_DOMAIN: z.string().min(1),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_STORAGE_BUCKET: z.string().min(1),
  FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  FIREBASE_APP_ID: z.string().min(1),
  FIREBASE_MEASUREMENT_ID: z.string().optional(),
  APPCHECK_DEBUG_TOKEN: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  GOOGLE_WEB_CLIENT_ID: z.string().min(1),
});

const parsed = schema.safeParse(Constants.expoConfig?.extra ?? {});
if (!parsed.success) {
  // Fail fast at startup with a precise message instead of mysterious runtime errors.
  throw new Error(`Invalid environment config:\n${parsed.error.toString()}`);
}

export const env = parsed.data;
export const isDev = env.APP_ENV === 'development';
export const isProd = env.APP_ENV === 'production';
