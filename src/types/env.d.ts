declare module '@env' {
  export const APP_ENV: string;
  export const EXPO_PUBLIC_FIREBASE_API_KEY: string;
  export const EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
  export const EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
  export const EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
  export const EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
  export const EXPO_PUBLIC_FIREBASE_APP_ID: string;
  export const EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: string;
  export const SENTRY_DSN: string;

  export const EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
  export const EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: string;
  export const EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_FIREBASE_API_KEY: string;
      EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID: string;
      EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
      EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
      EXPO_PUBLIC_FIREBASE_APP_ID: string;
      EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID: string;
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: string;
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: string;
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: string;
      EXPO_PUBLIC_USDA_API_KEY: string;
    }
  }
}

export {};

