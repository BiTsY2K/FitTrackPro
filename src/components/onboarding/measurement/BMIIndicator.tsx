import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, rounded, spacing, typography } from '@/themes';

const BMI_SCALE_LABELS = [
  { v: '10.0', label: 'Severely Underweight', color: colors.accent.purple },
  { v: '18.5', label: 'Underweight', color: colors.accent.blue },
  { v: '25.0', label: 'Normal', color: colors.accent.green },
  { v: '30.0', label: 'Overweight', color: colors.accent.orange },
  { v: '40.0', label: 'Obese', color: colors.accent.red },
];
// [ 10.0, 14.25, 18.5, 21.75, 25.0, 27.5, 30.0, 40.0]
// ['#6366F1', '#3B82F6', '#22D3EE', '#00FF87', '#D9FF3B', '#F59E0B', '#FF4C6A']

interface BMIIndicatorProps {
  heightCm: number;
  weightKg: number;
}

const BMIIndicator: React.FC<BMIIndicatorProps> = ({ heightCm, weightKg }) => {
  const hM = heightCm / 100;
  const bmi = parseFloat((weightKg / (hM * hM)).toFixed(1));

  /* prettier-ignore */
  const category =
    bmi <= 10 ? BMI_SCALE_LABELS[0]
      : bmi <= 18.5 ? BMI_SCALE_LABELS[1]
        : bmi <= 25 ? BMI_SCALE_LABELS[2]
          : bmi <= 30 ? BMI_SCALE_LABELS[3]
            : BMI_SCALE_LABELS[4];

  // Map BMI 10-40 to 0-100% //
  const pct = Math.min(100, Math.max(0, ((bmi - 10) / 30) * 100));
  const needleAnim = useRef(new Animated.Value(pct)).current;
  const needleLeft = useMemo(() => needleAnim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), [needleAnim]);

  useEffect(() => {
    Animated.spring(needleAnim, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
  }, [pct]);

  return (
    <View style={bmiStyles.card}>
      <View style={bmiStyles.headerRow}>
        <SectionLabel icon="📊" styleContainerView={bmiStyles.sectionLabel}>
          BODY MASS INDEX (BMI)
        </SectionLabel>
        <View style={[bmiStyles.badge, { backgroundColor: `${category.color}18`, borderColor: `${category.color}40` }]}>
          <Text style={[bmiStyles.badgeText, { color: category.color }]}>
            {bmi} - {category.label}
          </Text>
        </View>
      </View>

      {/* Gradient track */}
      <View style={bmiStyles.trackWrap}>
        <LinearGradient
          colors={[colors.accent.purple, colors.accent.blue, colors.accent.green, colors.accent.orange, colors.accent.red]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={bmiStyles.track}
        />

        <Animated.View style={[bmiStyles.needle, { left: needleLeft, backgroundColor: category.color, shadowColor: category.color }]} />
      </View>

      {/* Scale labels */}
      <View style={bmiStyles.scaleRow}>
        {BMI_SCALE_LABELS.map(({ v, color }) => (
          <Text key={v} style={[bmiStyles.scaleLabel, { color: color }]}>
            {v}
          </Text>
        ))}
      </View>
    </View>
  );
};

BMIIndicator.displayName = 'BMIIndicator';
export { BMIIndicator };

const bmiStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    backgroundColor: colors.surface.overlay,
    borderColor: colors.border.default,
    padding: spacing.md,
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3.5], gap: spacing[2] },
  sectionLabel: { marginBottom: 0, marginTop: 0 },

  badge: { borderWidth: 1, borderRadius: rounded.md, paddingHorizontal: spacing['2.5'], paddingVertical: spacing.xs1 },
  badgeText: { fontSize: typography.size.xs, fontWeight: typography.weight.extrabold },
  trackWrap: { position: 'relative', height: 8, marginBottom: spacing['1.5'] },
  track: { position: 'absolute', top: '50%', transform: [{ translateY: '-50%' }], height: 8, borderRadius: rounded.full, width: '100%' },
  needle: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateX: '-50%' as const }, { translateY: '-50%' as const }],
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: rounded.full,
    borderColor: colors.surface.overlay,
  },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between' },
  scaleLabel: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
});
