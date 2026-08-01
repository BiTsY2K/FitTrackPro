import { Pressable, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export function OptionCard({ label, hint, selected, onPress }: { label: string; hint?: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={{
        borderWidth: 2,
        borderColor: selected ? colors.brand : colors.border,
        backgroundColor: selected ? '#0B51320D' : colors.bg,
        borderRadius: radius.md,
        padding: spacing.md,
        minHeight: 56,
        justifyContent: 'center',
      }}
    >
      <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>{label}</Text>
      {hint ? <Text style={[typography.caption, { color: colors.textMuted }]}>{hint}</Text> : null}
    </Pressable>
  );
}
