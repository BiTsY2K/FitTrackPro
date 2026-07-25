import { useMutation } from '@tanstack/react-query';
import { FirebaseError } from 'firebase/app';

import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { logger } from '@/lib/logger';

import * as api from '../api/auth';
import { getLock, recordFailure, recordSuccess } from '../api/rateLimit';

function friendly(e: unknown): string {
  if (!(e instanceof FirebaseError)) {
    return 'Something went wrong. Please try again.';
  }

  switch (e.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.'; // generic — no enumeration
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

export function useLogin() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const lock = await getLock(email);
      if (lock.locked) throw new Error(`Locked. Try Again in ${lock.secondsLeft}s.`);

      try {
        const cred = await api.signInEmail(email, password);
        await recordSuccess(email);
        logEvent(AnalyticsEvent.Login, { method: 'email' });
        return cred;
      } catch (e) {
        await recordFailure(email);
        throw new Error(friendly(e));
      }
    },

    onError: e => {
      logger.warn('Login failed', { error: e });
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const cred = await api.signUpEmail(email, password);
      logEvent(AnalyticsEvent.SignUp, { method: 'email' });
      return cred;
    },

    onError: e => {
      throw new Error(friendly(e));
    },
  });
}

export function useGoogle() {
  return useMutation({
    mutationFn: api.signInGoogle,
    onSuccess: () => logEvent(AnalyticsEvent.Login, { method: 'google' }),
    onError: e => logger.warn('google_failed', { error: e }),
  });
}

export function useApple() {
  return useMutation({
    mutationFn: api.signInApple,
    onSuccess: () => logEvent(AnalyticsEvent.Login, { method: 'apple' }),
    onError: e => logger.warn('apple_failed', { error: e }),
  });
}

export function useResetPassword() {
  return useMutation({ mutationFn: (email: string) => api.resetPassword(email) });
}
