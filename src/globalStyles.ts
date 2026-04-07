import { StyleSheet, ViewStyle } from 'react-native';

import { colors, rounded, spacing, typography } from './themes';

type SpacingKey = 'sm' | 'md' | 'lg';
type MarginKey = `marg_t_${SpacingKey}` | `marg_b_${SpacingKey}`;

const sizes: SpacingKey[] = ['sm', 'md', 'lg'];

type MarginStyles = Record<MarginKey, ViewStyle>;

export const marginStyles = sizes.reduce((acc, size) => {
  acc[`marg_t_${size}`] = { marginTop: spacing[size] };
  acc[`marg_b_${size}`] = { marginBottom: spacing[size] };
  return acc;
}, {} as MarginStyles);

// ─── Global Styles ──────────────────────────────────────────────────────────────────────────────────────────────
export const globalStyles = StyleSheet.create({
  alignItemsCenter: { alignItems: 'center' },
  alignItemsStart: { alignItems: 'flex-start' },

  displayNone: { display: 'none' },

  flex_1: { flex: 1 },
  flexDirectionColumn: { flexDirection: 'column' },
  flexDirectionRow: { flexDirection: 'row' },

  ...marginStyles,

  // ─── Layout ──────────────────────────────────────────────────────────────────────────────────────────────
  safe: { flex: 1, backgroundColor: colors.surface.page, alignItems: 'stretch' },
  scroll: { flex: 1 },
  content: {
    overflow: 'hidden',
    position: 'relative',
    paddingHorizontal: spacing[4] + 1,
    paddingTop: spacing.md,
    paddingBottom: spacing[10] - 4,
  },

  // ─── Ambient Blobs ───────────────────────────────────────────────────────────────────────────────────────
  glowAmbientBlobTR: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(0,255,135,0.07)',
  },
  glowAmbientBlobBL: {
    position: 'absolute',
    bottom: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(124,58,237,0.08)',
  },

  // ─── Navigation ──────────────────────────────────────────────────────────────────────────────────────────
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  backBtn: {},
  backCircle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  backArrow: { color: colors.content.primary, fontSize: typography.size.lg },
  backText: { color: colors.content.tertiary, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },

  // ─── Logo Row ─────────────────────────────────────────────────────────────────────────────────────────────
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoIcon: { fontSize: typography.size.sm },
  logoBadge: { alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: rounded.sm + 3 },
  logoText: { color: colors.content.primary, fontWeight: typography.weight.extrabold, fontSize: typography.size.sm },
  skipText: { color: colors.content.tertiary, fontSize: typography.size.xs + 1, fontWeight: typography.weight.semibold },

  // ─── Header ─────────────────────────────────────────────────────────────────────────────────────────────
  header: { marginBottom: spacing[6] },
  title: {
    color: colors.content.primary,
    fontSize: typography.size.xl3,
    lineHeight: typography.height.xl3,
    fontWeight: typography.weight.black,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  titleAccent: {
    color: colors.accent.green,
    fontSize: typography.size.xl5,
    lineHeight: typography.size.xl5 * 1.125,
    fontWeight: typography.weight.black,
    letterSpacing: -0.8,
    marginTop: -spacing['1.5'],
  },
  subtitle: {
    color: colors.content.tertiary,
    fontSize: typography.size.sm,
    lineHeight: typography.size.sm * 1.25,
  },
});
