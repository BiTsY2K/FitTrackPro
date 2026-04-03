import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { GlowButton } from '@/components/common/GlowButton';
import GradientText from '@/components/common/GradientText';
import { SelectionCard } from '@/components/common/SelectionCard';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigation';
import { colors } from '@/themes';
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
    accentGlow: 'rgba(255,107,53,0.12)',
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
    accentGlow: COLORS.accentGlow,
    tag: 'Trending',
    stat: '+1.5kg muscle / mo',
  },
  {
    type: 'goal',
    id: 'maintain_weight',
    title: 'Maintain Weight',
    description: "Stay consistent, keep performance high & protect what you've built.",
    iconEmoji: '⚖️',
    accentColor: colors.accent.blue,
    accentGlow: 'rgba(59,130,246,0.12)',
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
    accentGlow: 'rgba(124,58,237,0.14)',
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
    gap: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    marginBottom: 16,
    minHeight: 52,
  },
  emoji: { fontSize: 20 },
  text: { flex: 1, color: COLORS.textMuted, fontSize: 12, lineHeight: 18 },
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
        {selectedGoal && <GoalHint goalId={selectedGoal} />}

        {/* ── CTA Button ── */}
        <GlowButton
          icon={selectedGoalData ? '→' : ''}
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
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginBottom: 14,
  },
  eyebrowIcon: { fontSize: 12 },
  eyebrowText: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  // Cards
  cards: { marginBottom: 4 },

  // Fine print
  finePrint: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 17,
  },
  finePrintAccent: {
    color: COLORS.accent,
    fontWeight: '700',
  },
});
