import { Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

export function MacroBar({ label, consumed, target, unit = 'g' }: { label: string; consumed: number; target: number; unit?: string }) {
  const pct = target > 0 ? Math.min(consumed / target, 1) : 0;
  return (
    <View style={{ gap: spacing.xs }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={[typography.caption, { color: colors.text, fontWeight: '700' }]}>{label}</Text>
        <Text style={[typography.caption, { color: colors.textMuted }]}>
          {consumed}/{target}
          {unit}
        </Text>
      </View>
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 0, max: target, now: consumed }}
        style={{ height: 8, backgroundColor: colors.border, borderRadius: radius.pill }}
      >
        <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: colors.brand, borderRadius: radius.pill }} />
      </View>
    </View>
  );
}
