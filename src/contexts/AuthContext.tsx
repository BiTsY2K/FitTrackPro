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
  const { user, loading, error, isAuthenticated, 
    setUser, setLoading, setError, clearError, initialize } = useAuthStore(); // prettier-ignore
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (user) sessionManager.start();
    else sessionManager.stop();
  }, [user]);

  useEffect(() => {
    // Initialize auth state listener
    const unsubscribe = initialize();
    setInitialized(true);

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [initialize]);

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setLoading(true);
      clearError();
      const user = await authService.signUp(email, password, displayName);
      setUser(user);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      clearError();
      const user = await authService.signIn(email, password);
      setUser(user);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      clearError();
      const response = useGoogleAuth();
      console.log(
        'Google Sign-In implementation (requires expo-auth-session). Response: ',
        response,
      );
      // Google Sign-In implementation (requires expo-auth-session)
      // See Day 2 for full implementation
      throw new Error('Not implemented yet');
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const signInWithApple = async () => {
    try {
      setLoading(true);
      clearError();
      // Apple Sign-In implementation
      throw new Error('Not implemented yet');
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await authService.signOut();
      setUser(null);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      clearError();
      await authService.resetPassword(email);
    } catch (error) {
      setError((error as Error).message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /* prettier-ignore */
  const value: AuthContextValue = { user, loading, error, isAuthenticated, 
    signUp, signIn, signInWithGoogle, signInWithApple, signOut, resetPassword, clearError, };

  // Don't render children until auth is initialized
  if (!initialized) {
    return null; // Or a loading screen
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
