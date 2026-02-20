/**
 * Design System
 * Minimal, trust-focused aesthetic for fitness tracking
 */

export const COLORS = {
  bg: '#0A0A0F',
  bgCard: '#12121A',
  bgCard2: '#1A1A26',
  accent: '#00FF87',
  accentDim: '#00CC6A',
  accentGlow: 'rgba(0,255,135,0.15)',
  purple: '#7C3AED',
  blue: '#3B82F6',
  orange: '#F59E0B',
  text: '#F0F0F5',
  textMuted: '#8888AA',
  border: 'rgba(255,255,255,0.08)',
  glass: 'rgba(255,255,255,0.04)',

  SEMANTIC: {
    success: '#00E676',
    warning: '#FFB020',
    error: '#FF4D6D',
    info: '#4DA3FF',
  },
} as const;

export const Colors = {
  // Primary (Calm, Professional Blue-Green)
  primary: {
    50: '#E6F7F5',
    100: '#B3E8E2',
    200: '#80D9CE',
    300: '#4DCABA',

    // Main brand color
    400: '#26BBA6',

    500: '#1EA892',
    600: '#16957E',
    700: '#0E826A',
    800: '#066F56',
    900: '#005C42',
  },

  // Neutrals (Sophisticated Grays)
  gray: {
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
  },

  // UI Elements
  background: '#FFFFFF',
  surface: '#FAFAFA',
  border: '#E5E5E5',
  text: {
    primary: '#171717',
    secondary: '#525252',
    tertiary: '#A3A3A3',
    inverse: '#FFFFFF',
  },

  success: '#00E676',
  warning: '#FFB020',
  error: '#FF4D6D',
  info: '#4DA3FF',

  // Social Buttons
  google: '#4285F4',
  apple: '#000000',
} as const;

export const Typography = {
  // Font Families (Using system fonts for performance + readability)
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font Sizes (Scale: 1.25 ratio)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 25,
    '2xl': 31,
    '3xl': 39,
    '4xl': 49,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Font Weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
  xxl: 40,
} as const;

export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
} as const;

// Animation Durations
export const Animation = {
  fast: 150,
  normal: 250,
  slow: 350,
} as const;
