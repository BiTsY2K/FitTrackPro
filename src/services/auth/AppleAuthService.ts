import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';

import { authService } from './AuthService';

export const signInWithApple = async () => {
  try {
    // Generate nonce for security
    const nonce = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, Math.random().toString());

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      nonce,
    });

    // Sign in with Firebase
    await authService.signInWithApple(credential.identityToken!, nonce);
  } catch (error) {
    const errorCode = error instanceof Error && (error as Error & { code?: string }).code;
    if (errorCode === 'ERR_CANCELED') {
      return; // User cancelled
    }
    throw error;
  }
};
