import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Animated, Text } from 'react-native';

import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { colors, rounded, spacing, typography } from '@/themes';

export function WeightDeltaCard({ currentKg, targetKg, metric }: { currentKg: number; targetKg: number; metric: boolean }) {
  const unit = metric ? 'kg' : 'lbs';
  const factor = metric ? 1 : 2.205;
  const current = parseFloat((currentKg * factor).toFixed(1));
  const target = parseFloat((targetKg * factor).toFixed(1));
  const delta = parseFloat((target - current).toFixed(1));
  const isLoss = delta < 0;
  const isSame = Math.abs(delta) < 0.5;
  const color = isSame ? COLORS.blue : isLoss ? COLORS.orange : COLORS.accent;
  const weeks = Math.round(Math.abs(delta) / (metric ? 0.5 : 1.1));

  const slideAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    slideAnim.setValue(0);
    Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 6 }).start();
  }, [currentKg, targetKg]);

  const cardAnim = useMemo(
    () => ({
      opacity: slideAnim,
      transform: [{ scale: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
    }),
    [slideAnim],
  );

  const iconBoxStyle = useMemo(() => [weightDeltaStyles.iconBox, { backgroundColor: `${color}18`, borderColor: `${color}40` }], [color]);
  const deltaPillStyle = useMemo(
    () => [weightDeltaStyles.deltaPill, { backgroundColor: `${color}18`, borderColor: `${color}30` }],
    [color],
  );

  return (
    <Animated.View style={[weightDeltaStyles.card, cardAnim]}>
      <View style={iconBoxStyle}>
        <Text style={weightDeltaStyles.icon}>{isSame ? '⚖️​' : isLoss ? '📉' : '📈'}</Text>
      </View>

      <View style={weightDeltaStyles.content}>
        <Text style={[weightDeltaStyles.title, { color }]}>
          {isSame ? 'Maintaining weight' : isLoss ? `Lose ${Math.abs(delta)} ${unit}` : `Gain ${delta} ${unit}`}
        </Text>
        <Text style={weightDeltaStyles.body}>
          {isSame ? 'Your plan focuses on body composition' : `~${weeks} weeks at a sustainable pace`}
        </Text>
      </View>

      <View style={deltaPillStyle}>
        <Text style={[weightDeltaStyles.deltaNum, { color }]}>
          {delta > 0 ? '+' : ''}
          {delta}
        </Text>
        <Text style={[weightDeltaStyles.deltaUnit, { color }]}>{unit}</Text>
      </View>
    </Animated.View>
  );
}

const weightDeltaStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3.5'],
    borderWidth: 1,
    borderRadius: rounded.lg,
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    padding: spacing['3.5'],
    ...globalStyles.marg_b_md,
  },

  iconBox: { width: spacing[12], height: spacing[12], borderWidth: 1, borderRadius: rounded.lg, borderColor: 'transparent',
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, // prettier-ignore
  icon: { fontSize: typography.size.xl2 },

  content: { flex: 1, flexShrink: 1, minWidth: 0 },
  title: { color: colors.accent.green, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold, marginBottom: spacing.xs1 },
  body: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: typography.size.xs * 1.2, fontWeight: 500 },

  deltaPill: { borderWidth: 1, borderRadius: rounded.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2], gap: spacing['0.5'],
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', flexShrink: 0, minWidth: spacing[16] }, // prettier-ignore
  deltaNum: { fontSize: 18, fontWeight: '900' },
  deltaUnit: { fontSize: 10, fontWeight: '700', marginTop: 1 },
});
