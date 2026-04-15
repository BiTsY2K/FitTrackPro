import { FontAwesome } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/common/Button';
import GradientText from '@/components/common/GradientText';
import { SectionLabel } from '@/components/common/SectionLabel';
import { SelectionCard } from '@/components/common/SelectionCard';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import type { ActivityLevelType } from '@/types/onboarding.types';

import { PROGRESS_STEPS_LABELS } from './GoalSelectionScreen';

export type ActivityOption = {
  type: 'activity';
  id: ActivityLevelType;
  title: string;
  description: string;
  iconEmoji: string;
  accentColor: string;
  accentGlow: string;
  multiplier: number;
  tag: string | null;
  stat: string;
  intensity: number;
};

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    type: 'activity',
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Little or no exercise. Mostly desk work or minimal movement.',
    iconEmoji: '🛋️',
    accentColor: colors.accent.blue,
    accentGlow: 'rgba(59,130,246,0.14)',
    multiplier: 1.2,
    tag: null,
    stat: 'x1.2 TDEE',
    intensity: 1,
  },
  {
    type: 'activity',
    id: 'lightly_active',
    title: 'Lightly Active',
    description: 'Light exercise or sports 1-3 days per week.',
    iconEmoji: '🚶',
    accentColor: COLORS.teal,
    accentGlow: 'rgba(6,182,212,0.14)',
    multiplier: 1.375,
    tag: null,
    stat: 'x1.375 TDEE',
    intensity: 2,
  },
  {
    type: 'activity',
    id: 'moderately_active',
    title: 'Moderately Active',
    description: 'Moderate exercise or sports 3-5 days per week.',
    iconEmoji: '🚴',
    accentColor: colors.accent.green,
    accentGlow: COLORS.accentGlow,
    multiplier: 1.55,
    tag: 'Most Common',
    stat: 'x1.55 TDEE',
    intensity: 3,
  },
  {
    type: 'activity',
    id: 'very_active',
    title: 'Very Active',
    description: 'Hard exercise or sports 6-7 days per week.',
    iconEmoji: '🏋️',
    accentColor: colors.accent.orange,
    accentGlow: 'rgba(255,107,53,0.14)',
    multiplier: 1.725,
    tag: null,
    stat: 'x1.725 TDEE',
    intensity: 4,
  },
  {
    type: 'activity',
    id: 'extremely_active',
    title: 'Extremely Active',
    description: 'Very hard exercise, physical job, or twice-daily training.',
    iconEmoji: '🔥',
    accentColor: colors.feedback.error,
    accentGlow: 'rgba(255,76,106,0.14)',
    multiplier: 1.9,
    tag: 'Elite',
    stat: 'x1.9 TDEE',
    intensity: 5,
  },
];

const WORKOUT_TIPS = [
  'Prioritize rest days and light movement to support recovery and prevent burnout.',
  'Start with a light routine to build momentum and make exercise a lasting habit.',
  'Focus on building consistency with a manageable weekly plan that fits your lifestyle.',
  'Maintain a balanced training split to improve strength, stamina, and recovery.',
  'Follow a structured 4-day split to steadily build muscle and overall fitness.',
  'Train with purpose to boost athletic performance, endurance, and mobility.',
  'Push your limits with high-performance workouts while balancing recovery well.',
  'Commit to an elite-level routine designed for peak results and long-term progress.',
];

// ── COMPONENT: WorkoutFrequencyPicker ──  8-cell day grid (0–7). Active cells fill left-to-right with purple ───────────────────
interface WorkoutFrequencyPickerProps {
  value: number;
  onChange: (v: number) => void;
  styleContainerView?: ViewStyle;
}

const WorkoutFrequencyPicker: React.FC<WorkoutFrequencyPickerProps> = React.memo(
  ({ value, onChange, styleContainerView }) => {
    const labels = ['Rest', '1x', '2x', '3x', '4x', '5x', '6x', 'Daily'];

    // Spring scale for active cell //
    const scales = useRef(Array.from({ length: 8 }, () => new Animated.Value(1))).current;

    const handlePress = (d: number) => {
      Animated.sequence([
        Animated.spring(scales[d], { toValue: 1.1, useNativeDriver: true, speed: 50, bounciness: 14 }),
        Animated.spring(scales[d], { toValue: 1, useNativeDriver: true, speed: 30 }),
      ]).start();
      onChange(d);
    };

    return (
      <View style={[workoutFreqStyles.card, styleContainerView]}>
        {/* ── Header ── */}
        <View style={workoutFreqStyles.headerRow}>
          <SectionLabel icon="🗓️" styleContainerView={tdeeStyles.sectionLabel}>
            WORKOUT DAYS / WEEK
          </SectionLabel>

          {/* ── Workout Pill ── */}
          <View
            style={[
              workoutFreqStyles.workoutDayPill,
              { borderColor: `${colors.accent.purple}40`, backgroundColor: `${colors.accent.purple}20` },
            ]}
          >
            <Text style={[workoutFreqStyles.workoutDayNum, workoutFreqStyles.textPurple]}>{value}</Text>
            <Text style={[workoutFreqStyles.workoutDayUnit, workoutFreqStyles.textPurple]}>days</Text>
          </View>
        </View>

        {/* ── Day grid ── */}
        <View style={workoutFreqStyles.grid}>
          {labels.map((lbl, d) => {
            const isActive = d === value;
            const isFilled = d < value;
            return (
              <Animated.View key={d} style={[globalStyles.flex_1, { transform: [{ scale: scales[d] }] }]}>
                <TouchableOpacity
                  onPress={() => handlePress(d)}
                  activeOpacity={0.8}
                  style={[workoutFreqStyles.cell, isFilled && workoutFreqStyles.cellFilled, isActive && workoutFreqStyles.cellActive]}
                >
                  <Text
                    style={[
                      workoutFreqStyles.cellLabel,
                      isFilled && workoutFreqStyles.cellLabelFilled,
                      isActive && workoutFreqStyles.cellLabelActive,
                    ]}
                  >
                    {lbl}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        {/* ── Tip row ── */}
        <View style={workoutFreqStyles.tipRow}>
          <View style={workoutFreqStyles.tipDot} />
          <Text style={workoutFreqStyles.tipText}>{WORKOUT_TIPS[value]}</Text>
        </View>
      </View>
    );
  },

  (prevProps, nextProps) => {
    return prevProps.value === nextProps.value && prevProps.onChange === nextProps.onChange;
  },
);

WorkoutFrequencyPicker.displayName = 'WorkoutFrequencyPicker';
export { WorkoutFrequencyPicker };

const workoutFreqStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3.5], gap: spacing[2] },
  textPurple: { color: colors.accent.purple },
  workoutDayPill: { borderWidth: 1, borderRadius: rounded.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2],
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', flexShrink: 0, minWidth: spacing[16] }, // prettier-ignore
  workoutDayNum: { fontSize: typography.size.xl, fontWeight: typography.weight.black, marginRight: spacing[1] },
  workoutDayUnit: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },

  grid: { flexDirection: 'row', gap: spacing.xs1, marginBottom: spacing['3.5'] },
  cell: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: rounded.lg,
    borderWidth: 1.5,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  cellFilled: { backgroundColor: colors.accentGlow.purpleSoft, borderColor: colors.accentGlow.purple },
  cellActive: {
    backgroundColor: colors.accent.purple,
    borderColor: colors.accent.purple,
    shadowColor: colors.accent.purple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 6,
  },

  cellLabel: { color: colors.content.tertiary, fontSize: typography.size.sm - 1, fontWeight: typography.weight.semibold },
  cellLabelFilled: { color: colors.accent.purple, fontWeight: typography.weight.bold },
  cellLabelActive: { color: '#fff', fontWeight: typography.weight.black },

  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: `${colors.accent.purpleDimmed}44`,
    backgroundColor: `${colors.accent.purpleDimmed}14`,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tipDot: { width: 6, height: 6, borderRadius: rounded.full, backgroundColor: colors.accent.purple, flexShrink: 0, marginTop: spacing.xs1 },
  tipText: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: 15, flex: 1 },
});

// ── COMPONENT: TDEEPreview ── estimated macro targets, updates live and reacts to both activityLevel and workoutFrequency ───────────────────
interface TDEEPreviewProps {
  activityLevel: ActivityLevelType;
  workoutDays: number;
  bmr?: number; /** Optional BMR from BioDataScreen. Falls back to avg demo value. */
  styleContainerView?: ViewStyle;
}

const TDEEPreview: React.FC<TDEEPreviewProps> = React.memo(
  ({ activityLevel, workoutDays, bmr = 1750, styleContainerView }) => {
    const fadeAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 0.6, duration: 80, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
    }, [activityLevel, workoutDays]);

    const option = ACTIVITY_OPTIONS.find(o => o.id === activityLevel);
    if (!option) return null;

    const tdee = Math.round(bmr * option.multiplier);
    const workoutBonus = workoutDays * 80; // ~80 kcal per additional workout session
    const total = tdee + workoutBonus;

    const macros = [
      { label: 'Calories', value: total, unit: 'kcal', color: option.accentColor },
      { label: 'Protein', value: Math.round((total * 0.3) / 4), unit: 'g', color: colors.accent.blue },
      { label: 'Carbs', value: Math.round((total * 0.42) / 4), unit: 'g', color: colors.accent.orange },
      { label: 'Fat', value: Math.round((total * 0.28) / 9), unit: 'g', color: colors.accent.purple },
    ];

    return (
      <Animated.View style={[tdeeStyles.card, { opacity: fadeAnim }, styleContainerView]}>
        <View style={tdeeStyles.headerRow}>
          <SectionLabel icon="⚡" styleContainerView={tdeeStyles.sectionLabel}>
            ESTIMATED DAILY TARGETS
          </SectionLabel>
          <View style={tdeeStyles.liveBadge}>
            <View style={tdeeStyles.liveDot} />
            <Text style={tdeeStyles.liveText}>Live</Text>
          </View>
        </View>
        <View style={tdeeStyles.macrosRow}>
          {macros.map((m, i) => (
            <View key={i} style={tdeeStyles.macroChip}>
              <Text style={[tdeeStyles.macroValue, { color: m.color }]}>{m.value}</Text>
              <Text style={tdeeStyles.macroUnit}>{m.unit}</Text>
              <Text style={tdeeStyles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
        <Text style={tdeeStyles.note}>
          Based on your bio and {option.title.toLowerCase()} lifestyle.{'\n'}Finalised after review step.
        </Text>
      </Animated.View>
    );
  },

  (prevProps, nextProps) => {
    return (
      prevProps.activityLevel === nextProps.activityLevel &&
      prevProps.workoutDays === nextProps.workoutDays &&
      prevProps.bmr === nextProps.bmr &&
      prevProps.styleContainerView === nextProps.styleContainerView
    );
  },
);

TDEEPreview.displayName = 'TDEEPreview';
export { TDEEPreview };

const tdeeStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.overlay,
    padding: spacing.md,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[3.5], gap: spacing[2] },
  sectionLabel: { marginBottom: 0, marginTop: 0 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1.5'],
    borderWidth: 1,
    borderRadius: rounded.full,
    borderColor: colors.brand.glow,
    backgroundColor: colors.accentGlow.greenSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing['0.5'],
  },
  liveDot: { width: 5, height: 5, borderRadius: rounded.full, backgroundColor: colors.accent.green },
  liveText: { color: colors.accent.green, fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
  macrosRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.sm },
  macroChip: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: rounded.lg,
    backgroundColor: colors.surface.raised,
    borderColor: colors.border.default,
    padding: spacing.sm,
  },
  macroValue: { fontSize: typography.size.lg, fontWeight: typography.weight.black },
  macroUnit: { color: colors.content.secondary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold, marginTop: 1 },
  macroLabel: { color: colors.content.secondary, fontSize: typography.size.xs - 1, marginTop: 4 },
  note: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, textAlign: 'center', lineHeight: 15 },
});

// ── ActivityScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Activity'>;

export const ActivityScreen: React.FC<Props> = ({ navigation, route }) => {
  const headerHeight = useHeaderHeight();
  const { onboardingData } = route.params ?? {};

  const [activityLevel, setActivityLevel] = useState<ActivityLevelType>('moderately_active');
  const [workoutFrequency, setWorkoutFrequency] = useState<number>(3);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();
  }, []);

  // Ambient glow shifts with selected activity color
  const selectedOption = ACTIVITY_OPTIONS.find(o => o.id === activityLevel);

  const handleContinue = () => {
    navigation.navigate('Summary', {
      onboardingData: {
        ...onboardingData,
        activityLevel,
        workoutFrequencyPerWeek: workoutFrequency,
        dietType: 'standard',
      },
    });
  };

  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* Ambient glow — shifts with selected goal color */}
      <View style={[globalStyles.glowAmbientBlobTR, selectedOption && { backgroundColor: `${selectedOption.accentColor}14` }]} />
      <View style={globalStyles.glowAmbientBlobBL} />

      <KeyboardAwareScrollView
        style={globalStyles.scroll}
        contentContainerStyle={globalStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={20}
      >
        {/* ── Header ── */}
        <Animated.View style={[globalStyles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowIcon}>⚡</Text>
            <Text style={styles.eyebrowText}>Lifestyle Profile</Text>
          </View>
          <Text style={globalStyles.title}>
            {'Your \n'}
            <GradientText textStyle={globalStyles.titleAccent}>activity level.</GradientText>
          </Text>

          {/* ── Progress bar ── */}
          <ProgressBar name="Onboarding" currentStep={4} totalSteps={5} stepLabels={PROGRESS_STEPS_LABELS} />

          <Text style={globalStyles.subtitle}>Be honest — we'll adjust your calorie needs accordingly. No judgment here.</Text>
        </Animated.View>

        {/* ── Activity Level Cards ── */}
        <SectionLabel icon="🏃">Daily Activity</SectionLabel>
        <View style={styles.cards}>
          {ACTIVITY_OPTIONS.map((activity, i) =>
            /* prettier-ignore */
            <SelectionCard key={activity.id} option={activity} selected={activityLevel === activity.id}
              onPress={() => setActivityLevel(activity.id)} animDelay={i * 80 + 80}
            />,
          )}
        </View>

        {/* ── Workout Frequency ── */}
        <SectionLabel icon="🗓️">Weekly Workouts</SectionLabel>
        <WorkoutFrequencyPicker value={workoutFrequency} onChange={setWorkoutFrequency} styleContainerView={globalStyles.marg_b_md} />

        {/* ── Live TDEE preview ── */}
        <TDEEPreview
          activityLevel={activityLevel}
          workoutDays={workoutFrequency}
          bmr={onboardingData?.bmr ?? 1750}
          styleContainerView={globalStyles.marg_b_md}
        />

        {/* ── Tip ── */}
        <View style={[tipStyles.card, globalStyles.marg_b_md]}>
          <View style={tipStyles.iconBox}>
            <Text style={tipStyles.icon}>💡</Text>
          </View>
          <View style={tipStyles.content}>
            <Text style={tipStyles.title}>Overestimating slows progress.</Text>
            <Text style={tipStyles.body}>Pick the level that matches your average week, not your best week.</Text>
          </View>
        </View>

        {/* ── CTA Button ── */}
        <Button
          rightIcon={<FontAwesome name="long-arrow-right" color="#000" size={18} />}
          label={'Continue to Summary Review'}
          onPress={() => handleContinue()}
        />

        <Text style={styles.finePrint}>
          You can update your activity level anytime in <Text style={styles.finePrintAccent}>Settings</Text>.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

ActivityScreen.displayName = 'ActivityScreen';
export default ActivityScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.accent.greenDimmed,
    backgroundColor: colors.accentGlow.greenStrong,
    borderRadius: rounded.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing['1.5'],
    marginBottom: spacing['3.5'],
  },
  eyebrowIcon: { fontSize: typography.size.xs },
  eyebrowText: {
    color: colors.accent.greenVivid,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },

  cards: { flexDirection: 'column', marginBottom: spacing.md, gap: spacing.sm },
  finePrint: { color: colors.content.tertiary, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: typography.height.xs }, // prettier-ignore
  finePrintAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
});

const tipStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing['3.5'], borderWidth: 1, borderRadius: rounded.xl,
    borderColor: colors.border.default, backgroundColor: colors.surface.raised, padding: spacing['3.5'],
  }, // prettier-ignore

  iconBox: { width: spacing[12], height: spacing[12], borderWidth: 1, borderRadius: rounded.lg, borderColor: `${colors.border.brand}40`,
    backgroundColor: colors.accentGlow.greenSoft, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, // prettier-ignore
  icon: { fontSize: typography.size.xl2 },

  content: { flex: 1, flexShrink: 1, minWidth: 0 },
  title: { color: colors.accent.green, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold, marginBottom: spacing.xs1 },
  body: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: typography.size.xs * 1.2, fontWeight: 500 },
});
