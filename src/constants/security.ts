/**
 *          Security configuration          *
 * DO NOT modify these without security review.
 */

// Password Requirements (NIST 800-63B compliant) //
export const PASSWORD_CONFIG = {
  MIN_LENGTH: 12, // NIST recommends 8, we go higher
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: false, // NIST says don't force complexity
  REQUIRE_LOWERCASE: false,
  REQUIRE_NUMBER: false,
  REQUIRE_SPECIAL: false,
  // Instead, check against common passwords
  CHECK_COMMON_PASSWORDS: true,
} as const;

// Session Configuration //
export const SESSION_CONFIG = {
  TOKEN_REFRESH_INTERVAL: 55 * 60 * 1000, // 55 minutes (tokens expire at 60)
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
  IDLE_TIMEOUT: 15 * 60 * 1000, // 15 minutes of inactivity
  MAX_CONCURRENT_SESSIONS: 5, // Limit device count
} as const;

// Rate Limiting (Defense against brute force) //
export const RATE_LIMIT_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOGIN_LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  MAX_PASSWORD_RESET_REQUESTS: 3,
  PASSWORD_RESET_COOLDOWN: 60 * 60 * 1000, // 1 hour
  MAX_EMAIL_VERIFICATIONS: 5,
  EMAIL_VERIFICATION_COOLDOWN: 60 * 1000, // 1 minute
} as const;

// Validation Patterns //
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // No phone validation - it's too complex across countries
  NAME: /^[a-zA-Z\s'-]{2,50}$/, // Password validation is length-based, not pattern-based
} as const;

// Error Messages (User-friendly, never reveal system details)
export const AUTH_ERRORS = {
  // Generic messages prevent user enumeration attacks
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_VERIFIED: 'Please verify your email address',
  ACCOUNT_LOCKED: 'Account temporarily locked. Try again later',
  WEAK_PASSWORD: 'Password is too common. Please choose a stronger password',
  PASSWORD_TOO_SHORT: `Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`,
  RATE_LIMIT_EXCEEDED: 'Too many attempts. Please try again later',
  TOKEN_EXPIRED: 'Session expired. Please sign in again',
  NETWORK_ERROR: 'Connection error. Please check your internet',
  UNKNOWN_ERROR: 'Something went wrong. Please try again',
} as const;

// Common passwords (top 100 - in production, use Have I Been Pwned API)
export const COMMON_PASSWORDS = new Set([
  'password',
  '123456',
  '123456789',
  'qwerty',
  'abc123',
  'password123',
  'iloveyou',
  'welcome',
  'admin',
  'letmein',
  // ... add top 100-1000 common passwords
]);
