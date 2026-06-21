import Constants from 'expo-constants';
import { Analytics, getAnalytics } from 'firebase/analytics';
import { FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { FirebaseStorage, getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseAppId,
  measurementId: Constants.expoConfig?.extra?.firebaseMeasurementId,
};

// Validation //
const validateConfig = () => {
  const required = ['apiKey', 'authDomain', 'projectId'];
  const missing = required.filter(key => !firebaseConfig[key as keyof typeof firebaseConfig]);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase config: ${missing.join(', ')}`);
  }
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let analytics: Analytics | null = null;

// Eager initialization if configuration is already available in the environment
const hasConfig = !!(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId
);

if (hasConfig) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully (eagerly)');
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    if (Constants.platform?.web) {
      analytics = getAnalytics(app);
    }
  } catch (error) {
    console.warn('⚠️ Firebase eager initialization failed:', error);
  }
}

const initializeFirebase = () => {
  try {
    if (!app) {
      validateConfig();

      // Prevent multiple initializations //
      if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);
        console.log('✅ Firebase initialized successfully (lazily)');
      } else {
        app = getApps()[0];
      }

      // Initialize services //
      auth = getAuth(app);
      db = getFirestore(app);
      storage = getStorage(app);

      // Analytics only works on web in Expo //
      if (Constants.platform?.web) {
        analytics = getAnalytics(app);
      }
    }

    return { app, auth, db, storage, analytics };
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error);
    throw error;
  }
};

// Export initialized instances //
export { analytics, app, auth, db, initializeFirebase, storage };
