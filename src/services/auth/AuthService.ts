import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, 
  updatePassword, updateProfile, User, AuthError, GoogleAuthProvider, signInWithCredential, OAuthProvider,
} from 'firebase/auth'; // prettier-ignore
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';
import { validatePasswordStrength, validateEmail, sanitizeInput, SecureStorage } from '@/utils/security';
import { AUTH_ERRORS, RATE_LIMIT_CONFIG } from '@/constants/security';
import { logger } from '@/utils/logger';
import { logEvent, AnalyticsEvent, setAnalyticsUserId } from '@/services/analytics';
import * as Sentry from '@sentry/react-native';
import { UserProfile } from '@/types/users.types';

/**
 * Rate Limiter (In-Memory)
 * In production, use Redis or Firestore for distributed rate limiting
 */
class RateLimiter {
  private attempts: Map<string, { count: number; resetAt: number }> = new Map();

  check(key: string, maxAttempts: number, windowMs: number): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetAt) {
      this.attempts.set(key, { count: 1, resetAt: now + windowMs });
      return true;
    }

    if (record.count >= maxAttempts) {
      return false;
    }

    record.count++;
    return true;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

const rateLimiter = new RateLimiter();

/**
 * Authentication Service
 * Handles all authentication operations with security best practices
 */
class AuthenticationService {
  /** Sign Up with Email/Password */
  async signUp(email: string, password: string, displayName: string): Promise<User> {
    try {
      // Rate limiting //
      const rateLimitKey = `signup:${email}`;
      if (!rateLimiter.check(rateLimitKey, 3, 60 * 60 * 1000)) {
        throw new Error(AUTH_ERRORS.RATE_LIMIT_EXCEEDED);
      }

      // Validate inputs //
      const cleanEmail = sanitizeInput(email).toLowerCase();
      const cleanName = sanitizeInput(displayName);

      if (!validateEmail(cleanEmail)) {
        throw new Error('Invalid email address');
      }

      // Validate password strength //
      const passwordValidation = validatePasswordStrength(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0] || AUTH_ERRORS.WEAK_PASSWORD);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user; // Create user

      await updateProfile(user, { displayName: cleanName }); // Update profile
      await sendEmailVerification(user); // Send email verification

      // Create user document in Firestore //
      await this.createUserDocument(user.uid, {
        email: cleanEmail,
        displayName: cleanName,
        createdAt: new Date(),
        emailVerified: false,
      });

      // Store auth state securely //
      await this.storeAuthState(user);

      // Analytics //
      logEvent(AnalyticsEvent.SIGN_UP, { method: 'email' });
      setAnalyticsUserId(user.uid);

      // Sentry context //
      Sentry.setUser({ id: user.uid });

      logger.info('User signed up successfully', { uid: user.uid });

      return user;
    } catch (error) {
      logger.error('Signup failed', error as Error, { email });
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Sign In with Email/Password */
  async signIn(email: string, password: string): Promise<User> {
    try {
      // Rate limiting (prevent brute force)
      const rateLimitKey = `login:${email}`;
      if (!rateLimiter.check(rateLimitKey, RATE_LIMIT_CONFIG.MAX_LOGIN_ATTEMPTS, RATE_LIMIT_CONFIG.LOGIN_LOCKOUT_DURATION)) {
        throw new Error(AUTH_ERRORS.ACCOUNT_LOCKED);
      }

      // Validate email //
      const cleanEmail = sanitizeInput(email).toLowerCase();
      if (!validateEmail(cleanEmail)) throw new Error('Invalid email address');

      // Sign in //
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const user = userCredential.user;

      // Check email verification. Allow sign-in but show warning //
      if (!user.emailVerified) {
        logger.warn('User signed in without verified email', { uid: user.uid });
      }

      await this.updateLastLogin(user.uid); // Update last login
      await this.storeAuthState(user); // Store auth state
      rateLimiter.reset(rateLimitKey); // Reset rate limiter on success

      // Analytics //
      logEvent(AnalyticsEvent.LOGIN, { method: 'email' });
      setAnalyticsUserId(user.uid);

      // Sentry context //
      Sentry.setUser({ id: user.uid });

      logger.info('User signed in successfully', { uid: user.uid });

      return user;
    } catch (error) {
      logger.error('Sign in failed', error as Error, { email });
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Sign In with Google */
  async signInWithGoogle(idToken: string): Promise<User> {
    try {
      const credential = GoogleAuthProvider.credential(idToken);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if new user //
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create user document for new user
        await this.createUserDocument(user.uid, {
          email: user.email!,
          displayName: user.displayName || undefined,
          photoURL: user.photoURL || undefined,
          createdAt: new Date(),
          emailVerified: user.emailVerified,
        });
      } else {
        // Update last login
        await this.updateLastLogin(user.uid);
      }

      // Store auth state //
      await this.storeAuthState(user);

      // Analytics //
      logEvent(AnalyticsEvent.LOGIN, { method: 'google' });
      setAnalyticsUserId(user.uid);

      logger.info('User signed in with Google', { uid: user.uid });

      return user;
    } catch (error) {
      logger.error('Google sign in failed', error as Error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Sign In with Apple */
  async signInWithApple(identityToken: string, nonce: string): Promise<User> {
    try {
      const provider = new OAuthProvider('apple.com');
      const credential = provider.credential({
        idToken: identityToken,
        rawNonce: nonce,
      });

      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if new user
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await this.createUserDocument(user.uid, {
          email: user.email!,
          displayName: user.displayName || undefined,
          createdAt: new Date(),
          emailVerified: user.emailVerified,
        });
      } else {
        await this.updateLastLogin(user.uid);
      }

      await this.storeAuthState(user);

      logEvent(AnalyticsEvent.LOGIN, { method: 'apple' });
      setAnalyticsUserId(user.uid);

      logger.info('User signed in with Apple', { uid: user.uid });

      return user;
    } catch (error) {
      logger.error('Apple sign in failed', error as Error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Sign Out */
  async signOut(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (user) {
        logEvent(AnalyticsEvent.LOGOUT, { uid: user.uid });
        logger.info('User signed out', { uid: user.uid });
      }

      await signOut(auth);
      await SecureStorage.clear();

      Sentry.setUser(null);
    } catch (error) {
      logger.error('Sign out failed', error as Error);
      throw new Error(AUTH_ERRORS.UNKNOWN_ERROR);
    }
  }

  /** Send Password Reset Email */
  async resetPassword(email: string): Promise<void> {
    try {
      // Rate limiting
      const rateLimitKey = `reset:${email}`;
      if (!rateLimiter.check(rateLimitKey, RATE_LIMIT_CONFIG.MAX_PASSWORD_RESET_REQUESTS, RATE_LIMIT_CONFIG.PASSWORD_RESET_COOLDOWN)) {
        throw new Error(AUTH_ERRORS.RATE_LIMIT_EXCEEDED);
      }

      const cleanEmail = sanitizeInput(email).toLowerCase();
      if (!validateEmail(cleanEmail)) {
        throw new Error('Invalid email address');
      }

      await sendPasswordResetEmail(auth, cleanEmail);

      logger.info('Password reset email sent', { email: cleanEmail });

      // Don't reveal if email exists (security)
      // Always return success
    } catch (error) {
      // Don't reveal if email exists
      if ((error as AuthError).code !== 'auth/user-not-found') {
        logger.error('Password reset failed', error as Error, { email });
      }
      // Always return success to prevent email enumeration
    }
  }

  /** Change Password */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        throw new Error('No authenticated user');
      }

      // Validate new password
      const passwordValidation = validatePasswordStrength(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      // Re-authenticate first (security requirement)
      await signInWithEmailAndPassword(auth, user.email, currentPassword);

      // Update password
      await updatePassword(user, newPassword);

      logger.info('Password changed successfully', { uid: user.uid });
    } catch (error) {
      logger.error('Password change failed', error as Error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Resend Email Verification */
  async resendEmailVerification(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No authenticated user');
      if (user.emailVerified) throw new Error('Email already verified');

      // Rate limiting
      const rateLimitKey = `verify:${user.uid}`;
      if (!rateLimiter.check(rateLimitKey, RATE_LIMIT_CONFIG.MAX_EMAIL_VERIFICATIONS, RATE_LIMIT_CONFIG.EMAIL_VERIFICATION_COOLDOWN)) {
        throw new Error('Please wait before requesting another verification email');
      }

      await sendEmailVerification(user);

      logger.info('Email verification sent', { uid: user.uid });
    } catch (error) {
      logger.error('Email verification failed', error as Error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Delete Account */
  async deleteAccount(): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user');
      }

      // Delete user document
      // Note: Firestore security rules should allow user to delete their own document
      await this.deleteUserDocument(user.uid);

      // Delete auth user (this will trigger Cloud Function to cleanup data)
      await user.delete();

      await SecureStorage.clear();

      logger.info('Account deleted', { uid: user.uid });
    } catch (error) {
      logger.error('Account deletion failed', error as Error);
      throw this.handleAuthError(error as AuthError);
    }
  }

  /** Get Current User */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /** Check if User is Authenticated */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }

  /** Get ID Token (for API calls) */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    try {
      const user = auth.currentUser;
      if (!user) return null;

      return await user.getIdToken(forceRefresh);
    } catch (error) {
      logger.error('Failed to get ID token', error as Error);
      return null;
    }
  }

  // ==================== Private Helper Methods ==================== //

  private async createUserDocument(uid: string, data: Partial<UserProfile>): Promise<void> {
    try {
      await setDoc(doc(db, 'users', uid), {
        uid,
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isPremium: false,
      });
    } catch (error) {
      logger.error('Failed to create user document', error as Error, { uid });
      throw error;
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(db, 'users', uid), {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      logger.error('Failed to update last login', error as Error, { uid });
      // Don't throw - this is not critical
    }
  }

  private async deleteUserDocument(uid: string): Promise<void> {
    try {
      // Mark as deleted instead of actually deleting (for audit trail)
      await updateDoc(doc(db, 'users', uid), {
        deletedAt: serverTimestamp(),
        email: null, // Remove PII
        displayName: null,
        photoURL: null,
      });
    } catch (error) {
      logger.error('Failed to delete user document', error as Error, { uid });
      throw error;
    }
  }

  private async storeAuthState(user: User): Promise<void> {
    try {
      const token = await user.getIdToken();
      await SecureStorage.set('auth_token', token);
      await SecureStorage.set('user_id', user.uid);
    } catch (error) {
      logger.error('Failed to store auth state', error as Error);
      // Don't throw - auth still succeeded
    }
  }

  private handleAuthError(error: AuthError): Error {
    // Map Firebase errors to user-friendly messages
    switch (error.code) {
      case 'auth/email-already-in-use':
        return new Error('An account with this email already exists');
      case 'auth/invalid-email':
        return new Error('Invalid email address');
      case 'auth/operation-not-allowed':
        return new Error('This sign-in method is not enabled');
      case 'auth/weak-password':
        return new Error(AUTH_ERRORS.WEAK_PASSWORD);
      case 'auth/user-disabled':
        return new Error('This account has been disabled');
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        // Generic message to prevent user enumeration
        return new Error(AUTH_ERRORS.INVALID_CREDENTIALS);
      case 'auth/too-many-requests':
        return new Error(AUTH_ERRORS.ACCOUNT_LOCKED);
      case 'auth/network-request-failed':
        return new Error(AUTH_ERRORS.NETWORK_ERROR);
      case 'auth/popup-closed-by-user':
        return new Error('Sign-in cancelled');
      default:
        Sentry.captureException(error);
        return new Error(AUTH_ERRORS.UNKNOWN_ERROR);
    }
  }
}

// Export singleton instance
export const authService = new AuthenticationService();
