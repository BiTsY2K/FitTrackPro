import { primitives } from '@/themes/primitives';
import { hexToRgba } from '@/utils/utility_functions';

const { color, space, radius, fontSize, fontWeight, lineHeight, letterSpacing, duration, easing } = primitives;

// ─── Color Tokens ─────────────────────────────────────────────
const colors = {
  // Surfaces
  surface: {
    page: color.ink[950], // root background
    base: color.ink[900], // default card/panel
    raised: color.ink[800], // elevated card
    overlay: color.ink[700], // modal, sheet

    glass: hexToRgba(color.white, 0.03), // frosted glass
    lightGlass: hexToRgba(color.white, 0.12), // light frosted glass
    darkGlass: hexToRgba(color.black, 0.25), // dark frosted glass
    disabled: color.gray[900],
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
    brand: color.green[500],
    default: color.gray[800],
    subtle: hexToRgba(color.white, 0.1),

    strong: color.gray[800],
    focus: color.blue[500],
    error: color.red[500],
  },

  // Feedback states
  feedback: {
    success: color.green[500],  successSubtle: 'rgba(0,230,118,0.10)',
    warning: color.orange[500], warningSubtle: 'rgba(245,158,11,0.10)',
    error: color.red[500],      errorSubtle: 'rgba(255,76,106,0.10)',
    info: color.blue[400],      infoSubtle: 'rgba(77,163,255,0.10)',
  }, // prettier-ignore

  // Accent palette — for charts, tags, avatars, badges //
  accent: {
    purple  : color.purple[500],  purpleDimmed : color.purple[700],  purpleVivid: color.purple[300], 
    blue    : color.blue[500],    blueDimmed   : color.blue[700],    blueVivid: color.blue[300], 
    orange  : color.orange[500],  orangeDimmed : color.teal[700],    orangeVivid: color.teal[300], 
    pink    : color.pink[500],    pinkDimmed   : color.pink[700],    pinkVivid: color.pink[300], 
    teal    : color.teal[500],    tealDimmed   : color.teal[700],    tealVivid: color.teal[300], 
    green   : color.green[500],   greenDimmed  : color.green[700],   greenVivid: color.green[300]
  }, // prettier-ignore

  // Third-party auth //
  auth: { google: '#4285F4', apple: color.neutral[1000] },
} as const;

// ─── Typography Tokens ────────────────────────────────────────
const typography = {
  family: { sans: 'System', mono: 'System' },
  size: fontSize,
  weight: fontWeight,
  height: lineHeight,
  tighten: letterSpacing,
} as const;

// ─── Spacing Tokens ───────────────────────────────────────────
// Named aliases on top of the numeric scale.
// Use numeric scale for granular control, aliases for common slots.
const spacing = {
  ...space,
  px: 1, none: space[0], xs1: space[1], xs: space[2], sm: space[3], md: space[4], lg: space[6], xl: space[8], xl2: space[12], xl3: space[16],
  xl4: space[20], xl5: space[24], xl6: space[28], xl7: space[32], xl8: space[36], xl9: space[40], xl10: space[44], xl11: space[48], 
  xl12: space[52], xl13: space[56], xl14: space[60], xl15: space[64], xl16: space[72], xl17: space[80], xl18: space[96],
} as const; // prettier-ignore

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
