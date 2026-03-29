import { StyleSheet } from 'react-native';

import { colors, rounded, spacing, typography } from './themes';

export const globalStyles = StyleSheet.create({
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
    borderColor: colors.border.DEFAULT,
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
    fontSize: typography.size['3xl'] + 2,
    fontWeight: typography.weight.black,
    letterSpacing: -0.5,
    marginBottom: spacing[2],
  },
  titleAccent: {
    color: colors.accent.green,
    fontSize: typography.size['5xl'],
    fontWeight: typography.weight.black,
    letterSpacing: -0.8,
    marginTop: -6,
    lineHeight: 54,
  },
  subtitle: {
    color: colors.content.tertiary,
    fontSize: typography.size.sm,
    lineHeight: 22,
  },
});
