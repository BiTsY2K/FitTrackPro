import { Fragment, useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { SectionLabel } from '@/components/common/SectionLabel';
import { colors, rounded, spacing, typography } from '@/themes';

interface MacroRingChartProps {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function MacroRingChart({ calories, proteinG, carbsG, fatG }: MacroRingChartProps) {
  const animProgress = useRef(new Animated.Value(0)).current;
  const animConfig = { toValue: 1, duration: 1000, delay: 200, useNativeDriver: false };
  useEffect(() => { Animated.timing(animProgress, animConfig).start()}, []); // prettier-ignore

  const R = 52, CX = 64, CY = 64, STROKE = 10; // prettier-ignore
  const circumference = 2 * Math.PI * R;
  const GAP = 0;

  const totalKcal = proteinG * 4 + carbsG * 4 + fatG * 9 || 1;
  const segments = [
    { label: 'Protein', value: proteinG, unit: 'g', kcal: proteinG * 4, color: colors.accent.blue },
    { label: 'Carbs', value: carbsG, unit: 'g', kcal: carbsG * 4, color: colors.accent.orange },
    { label: 'Fat', value: fatG, unit: 'g', kcal: fatG * 9, color: colors.accent.purple },
  ];

  let cumulativeAngle = 0;
  const arcs = segments.map(seg => {
    const fraction = seg.kcal / totalKcal;
    const arcLen = fraction * (circumference - GAP * segments.length);
    const startOffset = -(cumulativeAngle * circumference) - GAP;
    cumulativeAngle += fraction;
    return { ...seg, arcLen, startOffset };
  });

  return (
    <View style={macroRingStyles.card}>
      <SectionLabel icon="🥗">Macro Breakdown</SectionLabel>
      <View style={macroRingStyles.row}>
        {/* ─── SVG Donut ─── */}
        <View style={macroRingStyles.ringWrap}>
          <Svg width={128} height={128} style={{ transform: [{ rotate: '-90deg' }] }}>
            <Circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.border.default} strokeWidth={STROKE} />

            {arcs.map((arc, i) => (
              <Fragment key={`arcs_${i}`}>
                {/* prettier-ignore */}
                <Circle key={`arcs_circle_${i}`} cx={CX} cy={CY} r={R} fill="none" stroke={arc.color} strokeWidth={STROKE}
                  strokeDasharray={`${arc.arcLen} ${circumference}`} strokeDashoffset={arc.startOffset} strokeLinecap="round"
                />
              </Fragment>
            ))}
          </Svg>

          {/* Centre overlay */}
          <View style={macroRingStyles.centreOverlay}>
            <Text style={macroRingStyles.centreValue}>{calories}</Text>
            <Text style={macroRingStyles.centreUnit}>kcal/day</Text>
          </View>
        </View>

        {/* ─── Legend ─── */}
        <View style={macroRingStyles.legend}>
          {segments.map((seg, i) => (
            <View key={`segments_${i}`} style={macroRingStyles.legendRow}>
              <View style={macroRingStyles.legendDotLabel}>
                <View style={[macroRingStyles.legendDot, { backgroundColor: seg.color }]} />
                <Text style={macroRingStyles.legendLabel}>{seg.label}</Text>
              </View>
              <View style={[macroRingStyles.legendChip, { backgroundColor: `${seg.color}18`, borderColor: `${seg.color}40` }]}>
                <Text style={[macroRingStyles.legendValue, { color: seg.color }]}>{seg.value}</Text>
                <Text style={[macroRingStyles.legendUnit, { color: seg.color }]}>{seg.unit}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
const macroRingStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl },
  ringWrap: { position: 'relative', width: 128, height: 128 },

  centreOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  centreValue: {
    color: colors.accent.green,
    fontSize: typography.size.xl2,
    fontWeight: typography.weight.black,
    lineHeight: typography.height.base,
  },
  centreUnit: { color: colors.content.secondary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },

  legend: { flex: 1, gap: spacing['2.5'] },
  legendRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  legendDotLabel: { flexDirection: 'row', alignItems: 'center', gap: spacing['1.5'] },
  legendDot: { width: 8, height: 8, borderRadius: rounded.full },
  legendLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  legendChip: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing['0.5'],
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing.xs1,
  },
  legendValue: { fontSize: typography.size.sm, fontWeight: typography.weight.black },
  legendUnit: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
});
