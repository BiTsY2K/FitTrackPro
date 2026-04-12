import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { create } from 'zustand';

import { auth, initializeFirebase } from '@/services/firebase';
import { logger } from '@/utils/logger';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  initialize: () => () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,

  setUser: user => set({ user, isAuthenticated: !!user, loading: false }),
  setLoading: loading => set({ loading }),
  setError: error => set({ error, loading: false }),
  clearError: () => set({ error: null }),

  initialize: () => {
    initializeFirebase();
    // Listen for auth state changes //
    const unsubscribe = onAuthStateChanged(
      auth,
      user => {
        // User is signed in, see docs (https://firebase.google.com/docs/reference/js/auth.user)
        // for a list of available properties
        logger.info('Auth state changed', { authenticated: !!user, uid: user?.uid });
        set({ user, isAuthenticated: !!user, loading: false });
      },
      error => {
        logger.error('Auth state error', error);
        set({ error: error.message, loading: false });
      },
    );

    return unsubscribe; // Return cleanup function
  },
}));
