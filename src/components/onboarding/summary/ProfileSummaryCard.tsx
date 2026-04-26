import { StyleSheet, Text, View } from 'react-native';

import { SectionLabel } from '@/components/common/SectionLabel';
import { COLORS } from '@/constants/theme';
import { colors, rounded, spacing, typography } from '@/themes';

interface ProfileChip {
  label: string;
  icon: string;
  color: string;
}

const GOAL_LABELS: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  maintain_weight: 'Maintain Weight',
  body_recomp: 'Body Recomp',
};
const GOAL_COLORS: Record<string, string> = {
  lose_weight: colors.accent.orange,
  gain_muscle: colors.accent.green,
  maintain_weight: colors.accent.blue,
  body_recomp: colors.accent.purple,
};
const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: 'Sedentary',
  lightly_active: 'Lightly Active',
  moderately_active: 'Mod. Active',
  very_active: 'Very Active',
  extremely_active: 'Extremely Active',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProfileSummaryCard({ data }: { data: any }) {
  const goalColor = GOAL_COLORS[data.goal] || colors.accent.green;
  const chips: ProfileChip[] = [
    { label: GOAL_LABELS[data.goal] || data.goal, icon: '🎯', color: goalColor },
    { label: data.gender === 'male' ? 'Male' : 'Female', icon: data.gender === 'male' ? '♂️' : '♀️', color: COLORS.blue },
    { label: `${data.age} yrs`, icon: '🎂', color: colors.accent.teal },
    data.targetWeightKg
      ? { label: `${data.currentWeightKg} → ${data.targetWeightKg} kg`, icon: '⚖️', color: colors.accent.green }
      : { label: `${data.currentWeightKg} kg`, icon: '⚖️', color: colors.accent.green },
    { label: ACTIVITY_LABELS[data.activityLevel] || data.activityLevel, icon: '🏃', color: COLORS.orange },
    { label: `${data.workoutFrequencyPerWeek}x / week`, icon: '🗓️', color: COLORS.purple },
  ].filter(Boolean) as ProfileChip[];

  return (
    <View style={profileSummaryStyles.card}>
      <SectionLabel icon="📋">Your Profile</SectionLabel>
      <View style={profileSummaryStyles.chipsWrap}>
        {chips.map((chip, i) => (
          <View key={i} style={[profileSummaryStyles.chip, { backgroundColor: `${chip.color}12`, borderColor: `${chip.color}30` }]}>
            <Text style={profileSummaryStyles.chipIcon}>{chip.icon}</Text>
            <Text style={[profileSummaryStyles.chipLabel, { color: chip.color }]}>{chip.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

ProfileSummaryCard.displayName = 'ProfileSummaryCard';
export { ProfileSummaryCard };

const profileSummaryStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    backgroundColor: colors.surface.overlay,
    borderColor: colors.border.default,
    padding: spacing.md,
  },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1.5'],
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing['1.5'],
  },
  chipIcon: { fontSize: typography.size.xs },
  chipLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
});
