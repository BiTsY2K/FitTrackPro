export type AuthStatus = 'loading' | 'authed' | 'unauthed';

export interface SessionUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthClaims {
  premium: boolean; // reserved (Week 8)
  admin: boolean; // reserved (admin panel)
}
