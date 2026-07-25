import { create } from 'zustand';

import type { AuthClaims, AuthStatus, SessionUser } from './types';

interface AuthState {
  status: AuthStatus;
  user: SessionUser | null;
  emailVerified: boolean;
  profileComplete: boolean;
  claims: AuthClaims;
  set: (partial: Partial<AuthState>) => void;
  reset: () => void;
}

const initial = {
  status: 'loading' as AuthStatus,
  user: null,
  emailVerified: false,
  profileComplete: false,
  claims: { premium: false, admin: false },
};

export const useAuthStore = create<AuthState>(set => ({
  ...initial,
  set: partial => set(partial),
  reset: () => set(initial),
}));
