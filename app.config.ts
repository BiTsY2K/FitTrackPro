import { ConfigContext, ExpoConfig } from 'expo/config';

const ENV = (process.env.APP_ENV ?? 'development') as 'development' | 'staging' | 'production';

const names = {
  development: 'FitTrack Pro - Dev',
  staging: 'FitTrack Pro - Staging',
  production: 'FitTrack Pro',
} as const;

const bundleIds = {
  development: 'com.bitsdev.fittrack',
  staging: 'com.bitsdev.fittrack.staging',
  production: 'com.bitsdev.fittrack',
} as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: names[ENV],
  description: '',
  slug: 'fittrack-pro',
  scheme: 'com.bitsdev.fittrackpro',
  version: '1.0.0',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,

  owner: 'bitsdev_expo',
  icon: './assets/icon.png',
  platforms: ['ios', 'android', 'web'],

  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: bundleIds[ENV],
    googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    package: bundleIds[ENV],
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    softwareKeyboardLayoutMode: 'pan',
    // statusBarTranslucent: true,
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },

  plugins: [
    'expo-router',
    'expo-secure-store',
    '@sentry/react-native',
    'expo-web-browser',
    '@react-native-community/datetimepicker',
    '@react-native-firebase/app',
    '@react-native-firebase/app-check',

    '@react-native-google-signin/google-signin',

    ['expo-build-properties', { ios: { useFrameworks: 'static' } }],
    [
      '@sentry/react-native/expo',
      {
        url: 'https://sentry.io/',
        project: 'fit-track-bitsdev-2f8d90b74554',
        organization: 'bits-development',
      },
    ],
  ],

  experiments: { typedRoutes: true },
  assetBundlePatterns: ['**/*'],

  /* Any extra fields you want to pass to your experience. Values are accessible via Constants.expoConfig.extra */
  extra: {
    USDA_API_KEY: process.env.USDA_API_KEY,
    // nutritionixAppId: process.env.EXPO_PUBLIC_NUTRITIONIX_APP_ID,
    // nutritionixAppKey: process.env.EXPO_PUBLIC_NUTRITIONIX_APP_KEY,

    APP_ENV: ENV,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,
    APPCHECK_DEBUG_TOKEN: process.env.APPCHECK_DEBUG_TOKEN,
    SENTRY_DSN: process.env.SENTRY_DSN,

    GOOGLE_WEB_CLIENT_ID: process.env.GOOGLE_WEB_CLIENT_ID,

    // EAS Project ID - Only needed if using Expo Application Services
    // Run 'npm install -g eas-cli' and 'eas build:configure' to set up
    eas: { projectId: '9ede588f-efce-4fb6-99de-8bcb585817c5' },
  },
});
