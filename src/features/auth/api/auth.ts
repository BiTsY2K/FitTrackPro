import * as AppleAuthentication from 'expo-apple-authentication';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Crypto from 'expo-crypto';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile,
  type UserCredential,
} from 'firebase/auth';

import { env } from '@/config/env';
import { auth } from '@/lib/firebase';
import { logger } from '@/lib/logger';

// Expo Go can't load custom native modules, so Google Sign-In only works in a
// dev/production build. We lazy-load it (never touching the native module at
// import time) and throw a clear error if it's invoked inside Expo Go.
const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let googleSigninPromise: Promise<typeof import('@react-native-google-signin/google-signin').GoogleSignin> | null = null;
function loadGoogleSignin() {
  if (isExpoGo) throw new Error('Google Sign-In requires a development build (not available in Expo Go).');
  if (!googleSigninPromise) {
    googleSigninPromise = import('@react-native-google-signin/google-signin').then(({ GoogleSignin }) => {
      GoogleSignin.configure({ webClientId: env.GOOGLE_WEB_CLIENT_ID, offlineAccess: false });
      return GoogleSignin;
    });
  }
  return googleSigninPromise;
}

export async function signUpEmail(email: string, password: string): Promise<UserCredential> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await sendEmailVerification(cred.user);
  return cred;
}

export function signInEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function resendVerification() {
  if (auth.currentUser) return sendEmailVerification(auth.currentUser);
  throw new Error('No active user');
}

export function resetPassword(email: string) {
  // Generic by design — never reveals whether the email exists (no enumeration).
  return sendPasswordResetEmail(auth, email);
}

export async function signInGoogle(): Promise<UserCredential> {
  const GoogleSignin = await loadGoogleSignin();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const result = await GoogleSignin.signIn();
  const idToken = result.data?.idToken;
  if (!idToken) throw new Error('Google sign-in returned no idToken');
  return signInWithCredential(auth, GoogleAuthProvider.credential(idToken));
}

export async function signInApple(): Promise<UserCredential> {
  const rawNonce = Crypto.randomUUID();
  const hashedNonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, rawNonce);
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
    nonce: hashedNonce,
  });
  if (!credential.identityToken) throw new Error('Apple sign-in returned no identity token');
  const provider = new OAuthProvider('apple.com');
  const cred = await signInWithCredential(auth, provider.credential({ idToken: credential.identityToken, rawNonce }));
  // Apple returns the name only on first authorization — persist it immediately.
  const fullName = [credential.fullName?.givenName, credential.fullName?.familyName].filter(Boolean).join(' ');
  if (fullName && !cred.user.displayName) {
    await updateProfile(cred.user, { displayName: fullName }).catch(e => logger.warn('apple_name_save_failed', { error: e }));
  }
  return cred;
}

export async function signOut() {
  try {
    // Only touch the native Google module if it's available (skipped in Expo Go).
    if (!isExpoGo) {
      const GoogleSignin = await loadGoogleSignin();
      await GoogleSignin.signOut().catch(() => undefined);
    }
  } finally {
    // Navigation is driven reactively by the auth listener: signing out fires
    // onAuthStateChanged(null) → store status 'unauthed' → layouts redirect to login.
    await fbSignOut(auth);
  }
}
