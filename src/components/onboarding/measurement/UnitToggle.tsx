import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, rounded, spacing, typography } from '@/themes';

export function UnitToggle({ metric, onToggle }: { metric: boolean; onToggle: (v: boolean) => void }) {
  const slideAnim = useRef(new Animated.Value(metric ? 1 : 0)).current;
  useEffect(() => {
    Animated.spring(slideAnim, { toValue: metric ? 1 : 0, useNativeDriver: false, speed: 20, bounciness: 6 }).start();
  }, [metric]);

  return (
    <View style={unitStyle.wrapper}>
      {/* Sliding pill background */}
      <View style={unitStyle.track}>
        <Animated.View style={[unitStyle.pill, { left: slideAnim.interpolate({ inputRange: [0, 1], outputRange: ['2%', '50%'] }) }]} />
        {[
          { label: 'Imperial', sub: 'lbs / ft', value: false },
          { label: 'Metric', sub: 'kg / cm', value: true },
        ].map(t => (
          <TouchableOpacity key={String(t.value)} onPress={() => onToggle(t.value)} style={unitStyle.tab} activeOpacity={0.8}>
            <Text style={[unitStyle.tabLabel, metric === t.value && unitStyle.tabLabelActive]}>{t.label}</Text>
            <Text style={[unitStyle.tabSub, metric === t.value && unitStyle.tabSubActive]}>{t.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const unitStyle = StyleSheet.create({
  wrapper: { alignItems: 'center', marginBottom: spacing.lg },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.xs1,
    position: 'relative',
  },
  pill: { position: 'absolute', top: 6, bottom: 6, width: '50%', backgroundColor: colors.accent.green, borderRadius: rounded.md + 2 },

  tab: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, zIndex: 1 },
  tabLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  tabLabelActive: { color: colors.surface.page, fontWeight: typography.weight.extrabold },
  tabSub: { color: colors.content.tertiary, fontSize: typography.size.xs - 1 },
  tabSubActive: { color: colors.surface.page, fontWeight: typography.weight.medium },
});
