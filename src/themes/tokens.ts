import { primitives } from './primitives';

const { color, space, radius, fontSize, fontWeight, lineHeight, duration, easing } = primitives;

// ─── Color Tokens ─────────────────────────────────────────────
const colors = {
  // Surfaces
  surface: {
    page: color.ink[950], // root background
    base: color.ink[900], // default card/panel
    raised: color.ink[800], // elevated card
    overlay: color.ink[700], // modal, sheet
    glass: color.ink[600], // frosted glass effect
  },

  // Brand
  brand: {
    DEFAULT: color.green[500],
    dim: color.green[600],
    subtle: 'rgba(0,255,135,0.10)',
    glow: 'rgba(0,255,135,0.20)',
    text: color.green[500],
  },

  // Content / Text
  content: {
    primary: color.ink[50],
    secondary: color.ink[100],
    tertiary: color.ink[200],
    disabled: color.ink[300],
    inverse: color.neutral[900],
    onBrand: color.neutral[900], // text sitting on accent bg
  },

  // Borders
  border: {
    DEFAULT: color.ink[500],
    subtle: color.ink[600],
    strong: color.ink[400],
    brand: 'rgba(0,255,135,0.30)',
  },

  // Feedback states
  feedback: {
    success: color.green[500],
    successSubtle: 'rgba(0,230,118,0.10)',
    warning: color.orange[500],
    warningSubtle: 'rgba(245,158,11,0.10)',
    error: color.red[500],
    errorSubtle: 'rgba(255,76,106,0.10)',
    info: color.blue[400],
    infoSubtle: 'rgba(77,163,255,0.10)',
  },

  // Accent palette — for charts, tags, avatars, badges
  accent: {
    purple: color.purple[500],
    blue: color.blue[500],
    orange: color.orange[500],
    pink: color.pink[500],
    teal: color.teal[500],
    green: color.green[500],
  },

  // Third-party auth
  auth: {
    google: '#4285F4',
    apple: color.neutral[1000],
  },
} as const;

// ─── Typography Tokens ────────────────────────────────────────
const typography = {
  family: {
    sans: 'System',
    mono: 'System',
  },
  size: fontSize,
  weight: fontWeight,
  lineHeight,
} as const;

// ─── Spacing Tokens ───────────────────────────────────────────
// Named aliases on top of the numeric scale.
// Use numeric scale for granular control, aliases for common slots.

const spacing = {
  ...space,
  // Named aliases — map to numeric scale
  px: 1,
  none: space[0],
  xs: space[1], // 4
  sm: space[2], // 8
  md: space[4], // 16
  lg: space[6], // 24
  xl: space[8], // 32
  '2xl': space[12], // 48
  '3xl': space[16], // 64
} as const;

// ───  ─────────────────────────────────────

// ─── Shadow Tokens ────────────────────────────────────────────
// React Native compatible. Tailwind uses box-shadow CSS separately.

const shadow = {
  none: {
    shadowColor: color.neutral[1000],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: color.neutral[1000],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: color.neutral[1000],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: color.neutral[1000],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: color.neutral[1000],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 10,
  },
  // Colored glow shadows for accent elements
  brand: {
    shadowColor: color.green[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  error: {
    shadowColor: color.red[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
} as const;

const rounded = radius; // Border Radius Tokens
const motion = { duration, easing } as const; // Motion Tokens
const zIndex = { base: 0, raised: 10, dropdown: 20, sticky: 30, overlay: 40, modal: 50, toast: 60, tooltip: 70 } as const; // Z-Index Scale

export const tokens = { colors, typography, spacing, rounded, shadow, motion, zIndex } as const; // Token Export
export { colors, motion, rounded, shadow, spacing, typography, zIndex }; // Convenience named exports

// ─── Types ─────────────────────────────────────────────
export type Tokens = typeof tokens;
export type ColorTokens = typeof colors;
export type SpacingTokens = typeof spacing;
export type RoundedTokens = typeof rounded;
export type ShadowTokens = typeof shadow;
export type MotionTokens = typeof motion;
