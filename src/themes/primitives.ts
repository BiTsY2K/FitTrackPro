const green = {
  50: '#E6FFF4',
  100: '#B3FFDA',
  200: '#80FFBF',
  300: '#4DFFA5',
  400: '#26FF93',
  500: '#00FF87', // brand
  600: '#00CC6A',
  700: '#00994F',
  800: '#006635',
  900: '#00331A',
} as const;

const purple = {
  300: '#A78BFA',
  400: '#8B5CF6',
  500: '#7C3AED',
  600: '#6D28D9',
  700: '#5B21B6',
} as const;

const blue = {
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6',
  600: '#2563EB',
  700: '#1D4ED8',
} as const;

const orange = {
  300: '#FCD34D',
  400: '#FBBF24',
  500: '#F59E0B',
  600: '#D97706',
  700: '#B45309',
} as const;

const pink = {
  300: '#F9A8D4',
  400: '#F472B6',
  500: '#EC4899',
  600: '#DB2777',
  700: '#BE185D',
} as const;

const red = {
  300: '#FCA5A5',
  400: '#F87171',
  500: '#FF4C6A',
  600: '#DC2626',
  700: '#B91C1C',
} as const;

const teal = {
  400: '#26BBA6',
  500: '#1EA892',
  600: '#16957E',
} as const;

// Dark UI surfaces — what the app is built on
const ink = {
  50: '#F0F0F5', // primary text on dark
  100: '#C8C8DC', // secondary text
  200: '#8888AA', // muted text
  300: '#44445A', // subtle borders
  400: 'rgba(255,255,255,0.12)',
  500: 'rgba(255,255,255,0.08)', // default border
  600: 'rgba(255,255,255,0.03)', // glass
  700: '#1A1A26', // card surface 2
  800: '#12121A', // card surface 1
  900: '#0D0D14', // base surface
  950: '#0A0A0F', // page background
} as const;

const neutral = {
  0: '#FFFFFF',
  50: '#FAFAFA',
  100: '#F5F5F5',
  200: '#E5E5E5',
  300: '#D4D4D4',
  400: '#A3A3A3',
  500: '#737373',
  600: '#525252',
  700: '#404040',
  800: '#262626',
  900: '#171717',
  1000: '#000000',
} as const;

export const primitives = {
  color: {
    green,
    purple,
    blue,
    orange,
    pink,
    red,
    teal,
    ink,
    neutral,
  },

  // Raw scale — unitless (RN uses numbers, CSS uses rem/px)
  space: {
    0: 0,
    0.5: 2,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 20,
    6: 24,
    7: 28,
    8: 32,
    10: 40,
    12: 48,
    16: 64,
    20: 80,
    24: 96,
  },

  radius: {
    none: 0,
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  fontSize: {
    '2xs': 10,
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  fontWeight: {
    thin: '100',
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },

  lineHeight: {
    none: 1,
    tight: 1.2,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  duration: {
    instant: 0,
    fast: 120,
    normal: 220,
    slow: 350,
    glacial: 600,
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

// Type helpers — derived from primitives so they stay in sync automatically
export type Primitives = typeof primitives;
export type PrimitiveColor = typeof primitives.color;
export type PrimitiveSpace = typeof primitives.space;
