import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { colors, rounded, spacing, typography } from '@/themes';

export function ScienceCard({ bmr, tdee, target }: { bmr: number; tdee: number; target: number }) {
  const deficit = tdee - target;
  const rows = [
    { label: 'BMR — Resting metabolism', sub: 'Energy at complete rest', value: bmr, unit: 'kcal/day', color: colors.accent.blue },
    { label: 'TDEE — Total daily burn', sub: 'BMR x activity multiplier', value: tdee, unit: 'kcal/day', color: colors.accent.teal },
    {
      label: 'Daily calorie target',
      sub: deficit > 0 ? `${deficit} kcal daily deficit` : `${Math.abs(deficit)} kcal daily surplus`,
      value: target,
      unit: 'kcal/day',
      color: colors.accent.green,
    },
  ];

  return (
    <View style={scienceCardStyles.card}>
      <SectionLabel icon="🔬">The Science</SectionLabel>
      {rows.map((row, i) => (
        <View key={i} style={[scienceCardStyles.row, i < rows.length - 1 && scienceCardStyles.rowBorder]}>
          <View style={globalStyles.flex_1}>
            <Text style={scienceCardStyles.rowLabel}>{row.label}</Text>
            <Text style={scienceCardStyles.rowSub}>{row.sub}</Text>
          </View>
          <View style={[scienceCardStyles.valueBadge, { backgroundColor: `${row.color}12`, borderColor: `${row.color}30` }]}>
            <Text style={[scienceCardStyles.valueNum, { color: row.color }]}>{row.value}</Text>
            <Text style={[scienceCardStyles.valueUnit, { color: row.color }]}>{row.unit}</Text>
          </View>
        </View>
      ))}

      {/* Footnote */}
      <View style={scienceCardStyles.footnote}>
        <Text style={scienceCardStyles.footnoteIcon}>💡</Text>
        <Text style={scienceCardStyles.footnoteText}>
          Calculated using the <Text style={scienceCardStyles.footnoteAccent}>Mifflin-St Jeor equation</Text> (1990) — the gold standard for
          calorie estimation in clinical and sports nutrition.
        </Text>
      </View>
    </View>
  );
}

const scienceCardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.overlay,
    padding: spacing.md,
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  rowLabel: { color: colors.content.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  rowSub: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: 15, marginTop: 2 },

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

  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.accentGlow.green,
    backgroundColor: colors.accentGlow.greenSoft,
    padding: spacing.sm,
    marginTop: spacing.sm,
  },
  footnoteIcon: { fontSize: typography.size.lg },
  footnoteText: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: 15, flex: 1 },
  footnoteAccent: { color: colors.accent.green, fontWeight: '700' },
});
