import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import Constants from 'expo-constants';
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

export const initializeFirebase = () => {
    try {
        validateConfig();

        // Prevent multiple initializations //
        if (getApps().length === 0) {
            app = initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
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

        return { app, auth, db, storage, analytics };
    } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        throw error;
    }
};

// Export initialized instances //
export { app, auth, db, storage, analytics };