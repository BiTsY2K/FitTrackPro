import { COMMON_PASSWORDS, PASSWORD_CONFIG, VALIDATION_PATTERNS } from '@/constants/security';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

/**
 * Password Strength Checker
 * Based on NIST 800-63B guidelines
 */
export const validatePasswordStrength = (
  password: string,
): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} => {
  const errors: string[] = [];

  // Check length
  if (password.length < PASSWORD_CONFIG.MIN_LENGTH) {
    errors.push(`Must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`);
  }

  if (password.length > PASSWORD_CONFIG.MAX_LENGTH) {
    errors.push(`Must be less than ${PASSWORD_CONFIG.MAX_LENGTH} characters`);
  }

  // Check against common passwords
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    errors.push('Password is too common');
  }

  // Check for sequential characters (123, abc, etc)
  const hasSequential =
    /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(
      password,
    );
  if (hasSequential) {
    errors.push('Avoid sequential characters');
  }

  // Check for repeated characters (aaa, 111)
  const hasRepeated = /(.)\1{2,}/.test(password);
  if (hasRepeated) {
    errors.push('Avoid repeated characters');
  }

  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (password.length >= 16 && errors.length === 0) {
    strength = 'strong';
  } else if (password.length >= 12 && errors.length === 0) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

/**
 * Email Validator
 */
export const validateEmail = (email: string): boolean => {
  return VALIDATION_PATTERNS.EMAIL.test(email.trim().toLowerCase());
};

/**
 * Sanitize User Input (prevent XSS)
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < and >
    .slice(0, 255); // Limit length
};

/**
 * Generate Secure Random Token
 */
export const generateSecureToken = async (): Promise<string> => {
  const randomBytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(randomBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Secure Storage Wrapper
 * Never store sensitive data in AsyncStorage
 */
export const SecureStorage = {
  async set(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
      });
    } catch (error) {
      console.error('SecureStorage set error:', error);
      throw new Error('Failed to store sensitive data');
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(key);
    } catch (error) {
      console.error('SecureStorage get error:', error);
      return null;
    }
  },

  async delete(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('SecureStorage delete error:', error);
    }
  },

  async clear(): Promise<void> {
    // Clear all app-specific keys
    const keys = ['auth_token', 'refresh_token', 'user_id', 'biometric_enabled'];
    await Promise.all(keys.map(key => this.delete(key)));
  },
};

/**
 * Timing-Safe String Comparison
 * Prevents timing attacks
 */
export const timingSafeEqual = (a: string, b: string): boolean => {
  if (a.length !== b.length) return false;

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
};

/**
 * Hash Sensitive Data (one-way)
 * Use for comparing values without storing them
 */
export const hashData = async (data: string): Promise<string> => {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, data);
};
