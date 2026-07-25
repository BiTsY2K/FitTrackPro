export const colors = {
  brand: '#0B5132', // primary green
  brandOn: '#FFFFFF', // text on brand (contrast ≥ 7:1)
  bg: '#FFFFFF',
  text: '#11181C', // on bg ≈ 16:1
  textMuted: '#5B6770', // on bg ≈ 5.3:1 (AA)
  danger: '#B3261E',
  warning: '#9A6700',
  success: '#1B7A3D',
  border: '#E2E6E9',
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 20, pill: 999 } as const;
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const },
  h2: { fontSize: 22, fontWeight: '700' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 13, fontWeight: '400' as const },
} as const;
