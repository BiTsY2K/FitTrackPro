export default {
  expo: {
    name: 'FitTrack Pro', // The name of your app as it appears both within Expo Go and on your home screen as a standalone app.
    description: '', // A short description of what your app is and why it is great.
    slug: 'fittrack-pro', // A URL-friendly name for your project that is unique across your account.
    version: '1.0.0', // Your app version
    scheme: 'com.bitsdev.fittrackpro',
    owner: 'bitsdev_expo', // The name of the Expo account that owns the project. Defaults to the username of the current user.
    // sdkVersion: '54.0.33', // The Expo sdkVersion to run the project on. Version specified in your package.json.
    platforms: ['ios', 'android', 'web'], // Platforms that your project explicitly supports. Defaults to ["ios", "android"]

    /**
     * Locks your app to a specific orientation with portrait or landscape. Defaults to no lock.
     */ orientation: 'portrait', // Valid values: default, portrait, landscape

    /**
     * Local path or remote URL to an image to use for your app's icon.
     */ icon: './assets/icon.png', // Recommended to use a 1024x1024 png file.

    /**
     * Configuration to force the app to always use the user-interface appearance, such as "dark mode",
     * or make it automatically adapt to the system preferences. Requires expo-system-ui.
     */ userInterfaceStyle: 'light', // If not provided, defaults to light.

    /**
     * The background color for your app, behind any of your React views. Requires expo-system-ui.
     * 6 character long hex color string, for example, '#000000'.
     */ backgroundColor: '#ffffff', // Default is white: '#ffffff'.

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

    /**
     * Any extra fields you want to pass to your experience.
     * Values are accessible via Constants.expoConfig.extra
     */

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
      bundler: 'metro',
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
