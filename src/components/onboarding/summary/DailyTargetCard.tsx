import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, rounded, spacing, typography } from '@/themes';
import { CalculatedNutritionPlan } from '@/types/calorieCalculator.types';

export function DailyTargetsCard({ plan }: { plan: CalculatedNutritionPlan }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const fillAnimConfig = { toValue: 1, duration: 900, delay: 300, useNativeDriver: false };
  useEffect(() => { Animated.timing(fillAnim, fillAnimConfig).start() }, []); // prettier-ignore

  const rows = [
    {
      icon: '🔥',
      label: 'Calories',
      rawValue: plan?.dailyCalorieTarget ?? NaN,
      display: `${plan?.dailyCalorieTarget ?? NaN}`,
      unit: 'kcal',
      color: colors.accent.green,
      bg: colors.accentGlow.green,
      max: 4000,
    },
    {
      icon: '🥩',
      label: 'Protein',
      rawValue: plan?.dailyProteinGrams ?? NaN,
      display: `${plan?.dailyProteinGrams ?? NaN}`,
      unit: 'g',
      color: colors.accent.blue,
      bg: colors.accentGlow.blue,
      max: 300,
    },
    {
      icon: '🌾',
      label: 'Carbs',
      rawValue: plan?.dailyCarbsGrams ?? NaN,
      display: `${plan?.dailyCarbsGrams ?? NaN}`,
      unit: 'g',
      color: colors.accent.orange,
      bg: colors.accentGlow.orange,
      max: 400,
    },
    {
      icon: '🫒',
      label: 'Fat',
      rawValue: plan?.dailyFatGrams ?? NaN,
      display: `${plan?.dailyFatGrams ?? NaN}`,
      unit: 'g',
      color: colors.accent.purple,
      bg: colors.accentGlow.purple,
      max: 120,
    },
    {
      icon: '💧',
      label: 'Water',
      rawValue: plan?.dailyWaterMl ?? NaN / 1000,
      display: (plan?.dailyWaterMl ?? NaN / 1000).toFixed(1),
      unit: 'L',
      color: colors.accent.teal,
      bg: colors.accentGlow.teal,
      max: 5,
    },
  ];

  return (
    <View style={dailyTargetStyles.card}>
      <SectionLabel icon="🎯">Daily Targets</SectionLabel>
      {rows.map((row, i) => (
        <View key={i} style={[dailyTargetStyles.row, i < rows.length - 1 && dailyTargetStyles.rowBorder]}>
          <View style={[dailyTargetStyles.iconBox, { backgroundColor: row.bg, borderColor: `${row.color}30` }]}>
            <Text style={dailyTargetStyles.icon}>{row.icon}</Text>
          </View>
          <Text style={dailyTargetStyles.rowLabel}>{row.label}</Text>
          <View style={dailyTargetStyles.fillTrack}>
            <Animated.View
              style={[
                dailyTargetStyles.fillBar,
                {
                  backgroundColor: row.color,
                  width: fillAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', `${Math.min(100, ((row.rawValue || 0) / row.max) * 100)}%`],
                  }),
                },
              ]}
            />
          </View>
          <View style={[dailyTargetStyles.valueBadge, { backgroundColor: `${row.color}12`, borderColor: `${row.color}30` }]}>
            <Text style={[dailyTargetStyles.valueNum, { color: row.color }]}>{row.display}</Text>
            <Text style={[dailyTargetStyles.valueUnit, { color: row.color }]}>{row.unit}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const dailyTargetStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
    paddingBottom: spacing[1],
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.default },

  icon: { fontSize: typography.size.lg },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: rounded.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold, width: 58 },
  fillTrack: { flex: 1, height: 4, borderRadius: rounded.full, backgroundColor: colors.border.default, overflow: 'hidden' },
  fillBar: { height: '100%', borderRadius: rounded.full },
  valueBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['0.5'],
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing.xs1,
    flexShrink: 0,
  },
  valueNum: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  valueUnit: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
});
