import { FontAwesome } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/common/Button';
import GradientText from '@/components/common/GradientText';
import { SelectionCard } from '@/components/common/SelectionCard';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { globalStyles } from '@/globalStyles';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import type { GoalType } from '@/types/onboarding.types';

export type GoalOption = {
  type: 'goal';
  id: GoalType;
  title: string;
  description: string;
  iconEmoji: string;
  accentColor: string;
  accentGlow: string;
  tag: string | null;
  stat: string;
};

export const GOAL_OPTIONS: GoalOption[] = [
  {
    type: 'goal',
    id: 'lose_weight',
    title: 'Lose Weight',
    description: 'Burn fat, boost metabolism & build sustainable habits for a leaner body.',
    iconEmoji: '🔥',
    accentColor: colors.accent.orange,
    accentGlow: colors.accentGlow.orangeSoft,
    tag: 'Most Popular',
    stat: '-2kg / month avg',
  },
  {
    type: 'goal',
    id: 'gain_muscle',
    title: 'Gain Muscle',
    description: 'Progressive overload plans to build strength, size & raw power.',
    iconEmoji: '💪',
    accentColor: colors.accent.green,
    accentGlow: colors.accentGlow.greenSoft,
    tag: 'Trending',
    stat: '+1.5kg muscle / month',
  },
  {
    type: 'goal',
    id: 'maintain_weight',
    title: 'Maintain Weight',
    description: "Stay consistent, keep performance high & protect what you've built.",
    iconEmoji: '⚖️',
    accentColor: colors.accent.blue,
    accentGlow: colors.accentGlow.blueSoft, // 'rgba(59,130,246,0.12)',
    tag: null,
    stat: 'Balanced macros',
  },
  {
    type: 'goal',
    id: 'body_recomp',
    title: 'Body Recomposition',
    description: 'Simultaneously burn fat & build muscle — the advanced route to elite shape.',
    iconEmoji: '⚡',
    accentColor: colors.accent.purple,
    accentGlow: colors.accentGlow.purpleSoft, // 'rgba(124,58,237,0.14)',
    tag: 'Advanced',
    stat: 'Dual-phase training',
  },
];

const GOAL_HINTS: Record<GoalType, { text: string; emoji: string }> = {
  lose_weight: { emoji: '🎯', text: 'Great choice! Most users see visible results within 4 weeks.' },
  gain_muscle: { emoji: '💡', text: "Perfect. We'll build a hypertrophy program just for you." },
  maintain_weight: { emoji: '🧠', text: 'Smart. Consistency beats intensity every time.' },
  body_recomp: { emoji: '🔥', text: "Bold move. This route demands discipline — you're up for it." },
};

// ── GoalHint ─────────────────────────────────────────────────────────────────────────────
const GoalHint = React.memo<{ goalId: GoalType | null }>(
  ({ goalId }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(8)).current;

    useEffect(() => {
      if (goalId) {
        Animated.parallel([
          Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
        ]).start();
      } else {
        Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
        slideAnim.setValue(8);
      }
    }, [fadeAnim, goalId, slideAnim]);

    const hint = goalId ? GOAL_HINTS[goalId] : null;

    return (
      <Animated.View
        style={[hintStyles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        pointerEvents={goalId ? 'auto' : 'none'}
      >
        {hint && (
          <>
            <Text style={hintStyles.emoji}>{hint.emoji}</Text>
            <Text style={hintStyles.text}>{hint.text}</Text>
          </>
        )}
      </Animated.View>
    );
  },
  (prev, next) => prev.goalId === next.goalId,
);

GoalHint.displayName = 'GoalHint';

const hintStyles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.sm,
    overflow: 'hidden',
    minHeight: spacing.xl3,
  },

  emoji: { fontSize: typography.size.xl2 },
  text: { flex: 1, color: colors.content.tertiary, fontSize: typography.size.xs, lineHeight: typography.height.xs },
});

// ── GoalSelectionScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<OnboardingStackParamList, 'GoalSelection'>;

export const GoalSelectionScreen: React.FC<Props> = ({ navigation, route }) => {
  const headerHeight = useHeaderHeight();
  const { onboardingData } = route.params ?? {};

  const [selectedGoal, setSelectedGoal] = useState<GoalType>('gain_muscle');
  const [headerMounted, setHeaderMounted] = useState<boolean>(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (!headerMounted) {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
    }
  }, [headerMounted]);

  useEffect(() => {
    const t = setTimeout(() => setHeaderMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  const handleContinue = () => {
    if (!selectedGoal) return;
    navigation.navigate('BioData', { onboardingData: { ...onboardingData, goal: selectedGoal } });
  };

  const selectedGoalData = GOAL_OPTIONS.find(g => g.id === selectedGoal) ?? null;
  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* Ambient glow — shifts with selected goal color */}
      <View style={[globalStyles.glowAmbientBlobTR, selectedGoalData && { backgroundColor: `${selectedGoalData.accentColor}14` }]} />
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
          {/* Eyebrow badge */}
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowIcon}>🎯</Text>
            <Text style={styles.eyebrowText}>Personalize Your Journey</Text>
          </View>

          {/* Headline */}
          <Text style={globalStyles.title}>
            {"What's your \n"}
            <GradientText textStyle={[globalStyles.titleAccent]}>primary goal?</GradientText>
          </Text>

          {/* ── Progress bar ── */}
          <ProgressBar
            name="Onboarding"
            currentStep={1}
            totalSteps={5}
            stepLabels={['Goal', 'Bio', 'Measurement', 'Activity', 'Summary']}
          />

          <Text style={globalStyles.subtitle}>We'll build a plan around what matters most to you. You can always change this later.</Text>
        </Animated.View>

        {/* ── Goal cards ── */}
        <View style={styles.cards}>
          {GOAL_OPTIONS.map((goal, i) => (
            <SelectionCard
              key={goal.id}
              option={goal}
              selected={selectedGoal === goal.id}
              onPress={() => setSelectedGoal(goal.id)}
              animDelay={i * 80 + 80}
            />
          ))}
        </View>

        {/* ── Motivational hint ── */}
        {selectedGoal && (
          <View style={styles.goalHint}>
            <GoalHint goalId={selectedGoal} />
          </View>
        )}

        {/* ── CTA Button ── */}
        <Button
          rightIcon={selectedGoalData ? <FontAwesome name="long-arrow-right" color="#000" size={18} /> : null}
          label={selectedGoalData ? `Continue with ${selectedGoalData.title}` : 'Select a Goal to Continue'}
          onPress={() => handleContinue()}
          disabled={!selectedGoal}
        />

        {/* ── Fine print ── */}
        <Text style={styles.finePrint}>
          Your goal shapes your entire program. <Text style={styles.finePrintAccent}>No pressure</Text> — we'll continuously refine it
          together as you grow and evolve.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

GoalSelectionScreen.displayName = 'GoalSelectionScreen';
export default GoalSelectionScreen;

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

  cards: { marginBottom: spacing[5], gap: spacing.sm },
  goalHint: { marginBottom: spacing[5] },
  finePrint: { color: colors.content.tertiary, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: typography.height.xs }, // prettier-ignore
  finePrintAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
});
