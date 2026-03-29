import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { authService } from '@/services/auth/AuthService';
import { useAuthStore } from '@/store/authStore';
import { sessionManager } from '@/services/auth/SessionManager';
import { useGoogleAuth } from '@/services/auth/GoogleAuthService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Methods
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const { signInWithGoogle: gOAuthSignIn, loading: gOAuthLoading, error: gOAuthError, isReady: gOAuthIsReady } = useGoogleAuth(); // Google Auth hook
  const { user, loading, error, isAuthenticated, setUser, setLoading, setError, clearError, initialize } = useAuthStore(); // Auth store

  useEffect(() => {
    // Session management //
    if (user) sessionManager.start();
    else sessionManager.stop();
  }, [user]);

  useEffect(() => {
    // Initialize auth state listener //
    const unsubscribe = initialize();
    setInitialized(true);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initialize]);

  /** Sign Up with Email/Password */
  const signUp = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    clearError();
    try {
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Sing In with Email/Password */
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    clearError();
    try {
      const user = await authService.signIn(email, password);
      setUser(user);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Sign In with  Google */
  const signInWithGoogle = async () => {
    setLoading(true);
    clearError();

    try {
      if (!gOAuthIsReady) {
        throw new Error('Google Sign-In is not ready. Please try again.');
      }

      // The actual sign-in is handled by the useGoogleAuth hook
      // which will automatically call authService.signInWithGoogle when successful
      await gOAuthSignIn();
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Sign In with Apple */
  const signInWithApple = async () => {
    setLoading(true);
    clearError();

    try {
      // Apple Sign-In implementation
      throw new Error('Apple Sign-In is not available yet. Please use email or Google sign-in.');
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Sign Out */
  const signOut = async () => {
    setLoading(true);
    clearError();

    try {
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Reset Password */
  const resetPassword = async (email: string) => {
    setLoading(true);
    clearError();

    try {
      await authService.resetPassword(email);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /** Context value */
  const value: AuthContextValue = {
    user, loading: (loading || gOAuthLoading), error, isAuthenticated,
    signUp, signIn, signInWithGoogle, signInWithApple, signOut, resetPassword, clearError
  }; // prettier-ignore

  // Don't render children until auth is initialized
  if (!initialized) return null; // Or a loading screen

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Custom hook to use auth context */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
