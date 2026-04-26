import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { colors, rounded, spacing, typography } from '@/themes';

export function TimelineCard({ weeks }: { weeks: number }) {
  const etaDate = new Date(Date.now() + weeks * 7 * 86400000);
  const etaStr = etaDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const weeksAnim = useRef(new Animated.Value(0)).current;
  const weeksConfig = { toValue: 1, useNativeDriver: true, speed: 10, bounciness: 8 };
  useEffect(() => { Animated.spring(weeksAnim, weeksConfig).start() }, []); // prettier-ignore

  const milestones = [
    { week: 1, label: 'First results visible', icon: '👀' },
    { week: Math.round(weeks * 0.25), label: '25% of goal reached', icon: '⚡' },
    { week: Math.round(weeks * 0.5), label: 'Halfway there', icon: '🔥' },
    { week: weeks, label: 'Goal achieved', icon: '🏆' },
  ];

  return (
    <View style={timeLineStyles.card}>
      <SectionLabel icon="📅">Your Timeline</SectionLabel>

      {/* Hero weeks count */}
      <Animated.View style={[timeLineStyles.heroBox, { transform: [{ scale: weeksAnim }] }]}>
        <Text style={timeLineStyles.heroNum}>{weeks}</Text>
        <Text style={timeLineStyles.heroLabel}>weeks to your goal</Text>
        <View style={timeLineStyles.etaBadge}>
          <Text style={timeLineStyles.etaIcon}>📆</Text>
          <Text style={timeLineStyles.etaText}>
            Target:{'  '}
            <Text style={timeLineStyles.etaAccent}>{etaStr}</Text>
          </Text>
        </View>
      </Animated.View>

      {/* Milestone timeline */}
      <View style={timeLineStyles.timelineWrap}>
        {/* Vertical connector line */}
        <View style={timeLineStyles.connectorLine} />
        {milestones.map((m, i) => {
          const isLast = i === milestones.length - 1;
          return (
            <View key={i} style={[timeLineStyles.milestoneWrapper, i < milestones.length - 1 && globalStyles.marg_b_md]}>
              <View style={[timeLineStyles.milestoneDot, isLast && timeLineStyles.milestoneDotActive]} />
              <View style={timeLineStyles.milestone}>
                <View style={timeLineStyles.milestoneLabelWrapper}>
                  <Text style={timeLineStyles.milestoneIcon}>{m.icon}</Text>
                  <Text style={[timeLineStyles.milestoneLabel, isLast && { color: colors.accent.green }]}>{m.label}</Text>
                </View>
                <Text style={timeLineStyles.milestoneWeek}>Week {m.week}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={timeLineStyles.footnote}>Estimate based on safe weight change rates (0.5–1kg/week). Individual results vary.</Text>
    </View>
  );
}
const timeLineStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  heroBox: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingBottom: spacing[5],
    marginBottom: spacing.lg,
  },
  heroNum: {
    color: colors.accent.green,
    fontSize: typography.size.xl7,
    fontWeight: typography.weight.black,
    lineHeight: 68,
    letterSpacing: -3,
  },
  heroLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs1,
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['1.5'],
    flexShrink: 0,
  },
  etaIcon: { fontSize: typography.size.sm },
  etaText: { color: colors.content.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  etaAccent: { color: COLORS.text, fontWeight: '800' },
  timelineWrap: { position: 'relative', paddingLeft: spacing.lg },
  connectorLine: {
    position: 'absolute',
    left: 7,
    top: 6,
    bottom: 8,
    width: 2,
    backgroundColor: colors.accentGlow.green,
    borderRadius: 1,
  },
  milestoneWrapper: { flexDirection: 'row', alignItems: 'flex-start' },
  milestoneDot: {
    position: 'absolute',
    left: -spacing.lg + 0.75,
    top: 4,
    width: 14,
    height: 14,
    borderWidth: 1.5,
    borderRadius: rounded.full,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.overlay,
    zIndex: 1,
  },
  milestoneDotActive: {
    backgroundColor: colors.accent.green,
    borderColor: colors.accent.green,
    shadowColor: colors.accent.green,
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 4,
  },
  milestone: { flex: 1 },
  milestoneLabelWrapper: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  milestoneIcon: { fontSize: typography.size.md },
  milestoneLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  milestoneWeek: { color: colors.content.tertiary, fontSize: typography.size.xs, marginTop: spacing['0.5'] },
  footnote: {
    color: colors.content.tertiary,
    fontSize: typography.size.xs - 1,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 16,
  },
});
