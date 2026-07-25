import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import { CustomProvider, initializeAppCheck } from 'firebase/app-check';
import {
  type Auth,
  browserLocalPersistence,
  connectAuthEmulator,
  getReactNativePersistence,
  initializeAuth,
  Persistence,
} from 'firebase/auth';
import { connectFirestoreEmulator, Firestore, getFirestore } from 'firebase/firestore';
import { connectFunctionsEmulator, Functions, getFunctions } from 'firebase/functions';
import { connectStorageEmulator, FirebaseStorage, getStorage } from 'firebase/storage';
import { Platform } from 'react-native';

import { EMULATOR_HOST, EMULATOR_PORTS } from '@/config/constants';
import { env, isDev } from '@/config/env';

declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: import('@react-native-async-storage/async-storage').AsyncStorageStatic): Persistence;
}

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: env.FIREBASE_API_KEY,
  authDomain: env.FIREBASE_AUTH_DOMAIN,
  projectId: env.FIREBASE_PROJECT_ID,
  storageBucket: env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.FIREBASE_MESSAGING_SENDER_ID,
  appId: env.FIREBASE_APP_ID,
  measurementId: env.FIREBASE_MEASUREMENT_ID,
};

export const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
// `getReactNativePersistence` only exists in the RN build of firebase/auth; on
// web it resolves to `undefined`, so pick persistence per platform.
const authPersistence: Persistence = Platform.OS === 'web' ? browserLocalPersistence : getReactNativePersistence(AsyncStorage);
export const auth: Auth = initializeAuth(app, { persistence: authPersistence });
export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);
export const functions: Functions = getFunctions(app, 'us-central1');

/**
 * Firebase is initialized as a side effect of importing this module, so the
 * instances above are already ready. This function exists so callers can make
 * that dependency explicit (and ensure this module is evaluated). Idempotent.
 */
export function initializeFirebase(): FirebaseApp {
  return app;
}

// --- App Check (anti-abuse) ---
if (isDev && env.APPCHECK_DEBUG_TOKEN) {
  // @ts-expect-error: debug global recognized by App Check at runtime
  globalThis.FIREBASE_APPCHECK_DEBUG_TOKEN = env.APPCHECK_DEBUG_TOKEN;
}

// Expo Go can't load custom native modules, so RNFB attestation only runs in a dev/
// production build. In Expo Go (and on web) we fall back to the placeholder token.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const placeholderProvider = new CustomProvider({
  getToken: async () => ({ token: 'debug', expireTimeMillis: Date.now() + 3_600_000 }),
});

void (async () => {
  try {
    let provider = placeholderProvider;

    if (Platform.OS !== 'web' && !isExpoGo) {
      // Lazy-load RNFB so its native module is never touched in Expo Go.
      const {
        ReactNativeFirebaseAppCheckProvider,
        initializeAppCheck: initializeRnfbAppCheck,
        getToken: getRnfbAppCheckToken,
      } = await import('@react-native-firebase/app-check');

      // Configure + initialize RNFB App Check for native device attestation.
      const rnfbProvider = new ReactNativeFirebaseAppCheckProvider();
      rnfbProvider.configure({
        android: { provider: isDev ? 'debug' : 'playIntegrity', debugToken: env.APPCHECK_DEBUG_TOKEN },
        apple: { provider: isDev ? 'debug' : 'appAttestWithDeviceCheckFallback', debugToken: env.APPCHECK_DEBUG_TOKEN },
        isTokenAutoRefreshEnabled: true,
      });
      const rnfbAppCheck = await initializeRnfbAppCheck(undefined, {
        provider: rnfbProvider,
        isTokenAutoRefreshEnabled: true,
      });

      // Bridge the native token into the JS SDK. RNFB manages the real expiry/refresh
      // natively, so a short TTL just makes the JS SDK re-pull a fresh token periodically.
      provider = new CustomProvider({
        getToken: async () => {
          const { token } = await getRnfbAppCheckToken(rnfbAppCheck);
          return { token, expireTimeMillis: Date.now() + 30 * 60 * 1000 };
        },
      });
    }

    initializeAppCheck(app, { provider, isTokenAutoRefreshEnabled: true });
  } catch {
    /* App Check init is best-effort; never block app startup */
  }
})();

// --- Emulators in dev only ---
if (isDev) {
  connectAuthEmulator(auth, `http://${EMULATOR_HOST}:${EMULATOR_PORTS.auth}`, { disableWarnings: true });
  connectFirestoreEmulator(db, EMULATOR_HOST, EMULATOR_PORTS.firestore);
  connectStorageEmulator(storage, EMULATOR_HOST, EMULATOR_PORTS.storage);
  connectFunctionsEmulator(functions, EMULATOR_HOST, EMULATOR_PORTS.functions);
}
