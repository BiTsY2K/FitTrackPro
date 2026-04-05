const white = '#fafafa' as const; // hsl(0, 0%, 98%)
const black = '#020817' as const; // hsl(223, 84%, 5%)

const gray = { 50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db', 400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151', 800: '#1f2933', 900: '#111827', 950: '#030712' } as const; // prettier-ignore
const red = { 50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a' } as const; // prettier-ignore
const orange = { 50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 900: '#7c2d12', 950: '#431407' } as const; // prettier-ignore
const yellow = { 50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047', 400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207', 800: '#854d0e', 900: '#713f12', 950: '#422006' } as const; // prettier-ignore
const green = { 50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac', 400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d', 800: '#166534', 900: '#14532d', 950: '#052e16' } as const; // prettier-ignore
const blue = { 50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554' } as const; // prettier-ignore
const purple = { 50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764' } as const; // prettier-ignore
const pink = { 50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4', 400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d', 800: '#9d174d', 900: '#831843', 950: '#500724' } as const; // prettier-ignore
const teal = {50: '#9fd4c7', 100: '#8bcbbc', 200: '#76c2b2', 300: '#5fbaa7', 400: '#45b19c', 500: '#1EA892', 600: '#19927e', 700: '#137c6b', 800: '#0e6758', 900: '#095246', 950: '#053f35' } as const; // prettier-ignore

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
  color: { white, black, gray, red, orange, yellow, green, blue, purple, pink, teal, ink, neutral },
  radius: { none: 0, xs2: 2, xs: 4, sm: 6, md: 8, lg: 12, xl: 16, xl2: 24, xl3: 32, full: 9999 },

  /* prettier-ignore */
  space: { 0: 0, 0.5: 2, 1: 4, 1.5: 6, 2: 8, 2.5: 10, 3: 12, 3.5: 14, 4: 16, 5: 20, 6: 24, 7: 28, 8: 32, 9:36, 10: 40, 11: 44, 12: 48, 14: 56, 
    16: 64, 20: 80, 24: 96, 28: 112, 32: 128, 36: 144, 40: 160, 44: 176, 48: 192, 52: 208, 56: 224, 60: 240, 64: 256, 72: 288, 80: 320, 96: 384 },

  fontSize: { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xl2: 24, xl3: 30, xl4: 36, xl5: 48, xl6: 60, xl7: 72, xl8: 96, xl9: 128 },
  fontWeight: { thin: 100, extraLight: 200, light: 300, regular: 400, medium: 500, semibold: 600, bold: 700, extrabold: 800, black: 900 },
  lineHeight: { xs: 16, sm: 20, base: 24, lg: 28, xl: 28, xl2: 32, xl3: 36, xl4: 40, xl5: 48, xl6: 60, xl7: 72, xl8: 96, xl9: 128 },
  letterSpacing: { none: 1, tight: 1.2, snug: 1.375, normal: 1.5, relaxed: 1.625, loose: 2 },

  duration: { instant: 0, fast: 120, normal: 220, slow: 350, glacial: 600 },
  easing: { linear: 'linear', ease: 'ease', easeIn: 'ease-in', easeOut: 'ease-out', easeInOut: 'ease-in-out', spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' }, // prettier-ignore
} as const;

// Type helpers — derived from primitives so they stay in sync automatically
export type Primitives = typeof primitives;
export type PrimitiveColor = typeof primitives.color;
export type PrimitiveSpace = typeof primitives.space;
