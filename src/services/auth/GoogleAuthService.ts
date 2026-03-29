import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { authService } from './AuthService';
import { useEffect, useState } from 'react';
import { EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID, EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID, EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID } from '@env';
import { logger } from '@/utils/logger';

const GOOGLE_WEB_CLIENT_ID = EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

// Complete auth session for web browsers //
WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Generate proper redirect URI //
  const redirectUri = makeRedirectUri({
    scheme: 'com.bitsdev.fittrackpro', // Your app scheme
    path: '', // Optional: specific path
  });

  /** Configure Google Auth Request */
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    redirectUri, // Redirect URI: 'exp://192.168.1.7:8081/--/auth/callback'
    scopes: ['openid', 'profile', 'email'], // Scopes - request only what you need
    responseType: 'id_token', // Response type
    usePKCE: true,

    // Additional parameters for OAuth compliance //
    extraParams: {
      prompt: 'select_account', // Ensure fresh consent
    },
  });

  /* Handle authentication response */
  useEffect(() => {
    if (!response) return;

    const handleResponse = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (response?.type === 'success') {
          const id_token = response.params?.id_token;
          if (!id_token) throw new Error('No ID token received from Google');

          logger.info('Google Sign-In successful, exchanging token...');
          await authService.signInWithGoogle(id_token); // Sign in with Firebase using Google ID token
          logger.info('Firebase sign-in successful');
        } else if (response.type === 'cancel') {
          logger.info('Google Sign-In cancelled by user');
          setError('Sign-in cancelled');
        } else if (response.type === 'locked') {
          logger.warn('Google Sign-In browser locked');
          setError('Sign-in interrupted');
        } else {
          if (response.type === 'error') {
            const errorCode = response.params?.error || 'unknown_error';
            const errorDescription = response.params?.error_description || 'An unknown error occurred';

            logger.error('Google Sign-In error:', new Error(errorDescription), { 
            errorCode, errorDescription, params: response.params }); // prettier-ignore

            // Handle specific OAuth errors //
            if (errorCode === 'invalid_request') setError('OAuth configuration error. Please contact support.');
            else if (errorCode === 'access_denied') setError('Access denied. Please try again.');
            else setError(errorDescription);
          }
        }
      } catch (error) {
        logger.error('Failed to process Google Sign-In', error as Error);
        setError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    };

    handleResponse();
  }, [response]);

  // useEffect(() => {
  //   console.log('Google Sign-In. Response:', response);

  //   if (response?.type === 'success') {
  //     const id_token = response.authentication?.idToken || '';
  //     authService.signInWithGoogle(id_token);
  //   }
  // }, [response]);

  // Wrapper for promptAsync with error handling

  const signInWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      logger.info('Initiating Google Sign-In...');
      const result = await promptAsync(); // Trigger Google Sign-In
      return result; // Result will be handled by useEffect above
    } catch (error) {
      logger.error('Failed to initiate Google Sign-In', error as Error);
      setError((error as Error).message);
      setIsLoading(false);
      throw error;
    }
  };

  return {
    signInWithGoogle,
    loading: isLoading || !request,
    error,
    isReady: !!request,
  };
};
