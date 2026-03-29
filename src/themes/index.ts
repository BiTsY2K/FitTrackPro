import { tokens } from '@/themes/tokens';

export type { Primitives } from '@/themes/primitives';
export { primitives } from '@/themes/primitives';
export type { ColorTokens, MotionTokens,RoundedTokens, ShadowTokens, SpacingTokens, Tokens } from '@/themes/tokens';
export { colors, motion, rounded, shadow, spacing, tokens, typography, zIndex } from '@/themes/tokens';

/**
 * The single object your components import.
 *
 * @example
 * const styles = StyleSheet.create({
 *   card: {
 *     backgroundColor: theme.colors.surface.base,
 *     borderRadius: theme.rounded.lg,
 *     padding: theme.spacing.md,
 *     ...theme.shadow.md,
 *   }
 * })
 */
export const theme = tokens;

export type Theme = typeof theme;

/**
 * useTheme hook — returns current theme.
 * Stubbed for now; wire up a ThemeContext here when you add dark mode.
 * Your components don't need to change — just update this hook.
 *
 * @example
 * const { colors } = useTheme()
 */
export function useTheme(): Theme {
  // Future: return useContext(ThemeContext)
  return theme;
}
