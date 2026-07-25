import { ActivityIndicator, Pressable, type PressableProps, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

type Variant = 'primary' | 'secondary' | 'danger';
interface Props extends PressableProps {
  title: string;
  loading?: boolean;
  variant?: Variant;
}

const bg: Record<Variant, string> = { primary: colors.brand, secondary: colors.border, danger: colors.danger };
const fg: Record<Variant, string> = { primary: colors.brandOn, secondary: colors.text, danger: '#fff' };

export function Button({ title, loading, variant = 'primary', disabled, ...rest }: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      style={({ pressed }) => ({
        backgroundColor: bg[variant],
        opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1,
        minHeight: 48, // ≥44pt touch target
        borderRadius: radius.md,
        paddingHorizontal: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
      })}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={fg[variant]} />
      ) : (
        <Text style={[typography.body, { color: fg[variant], fontWeight: '700' }]}>{title}</Text>
      )}
    </Pressable>
  );
}
