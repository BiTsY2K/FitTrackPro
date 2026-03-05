export default {
  expo: {
    name: 'FitTrack Pro',
    slug: 'fittrack-pro',
    version: '1.0.0',
    scheme: 'com.bitsdev.fittrackpro',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.bitsdev.fittrack',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      softwareKeyboardLayoutMode: 'pan',
      statusBarTranslucent: true,
      package: 'com.bitsdev.fittrack',
    },
    owner: 'bitsdev_expo',
    extra: {
      firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,

      // EAS Project ID - Only needed if using Expo Application Services
      // Run 'npm install -g eas-cli' and 'eas build:configure' to set up
      eas: {
        projectId: '9ede588f-efce-4fb6-99de-8bcb585817c5',
      },
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: [
      'expo-secure-store',
      'expo-web-browser',
      '@react-native-community/datetimepicker',
      [
        '@sentry/react-native/expo',
        {
          url: 'https://sentry.io/',
          project: 'fit-track-bitsdev-2f8d90b74554',
          organization: 'bits-development',
        },
      ],
    ],
  },
};
