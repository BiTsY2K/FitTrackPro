import { FontAwesome } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import Button from '@/components/common/Button';
import GradientText from '@/components/common/GradientText';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { DailyTargetsCard } from '@/components/onboarding/summary/DailyTargetCard';
import { ErrorView } from '@/components/onboarding/summary/ErrorView';
import { LoadingView } from '@/components/onboarding/summary/LoadingView';
import { MacroRingChart } from '@/components/onboarding/summary/MarcoRingChart';
import { ProfileSummaryCard } from '@/components/onboarding/summary/ProfileSummaryCard';
import { ScienceCard } from '@/components/onboarding/summary/ScienceCard';
import { SuccessHeader } from '@/components/onboarding/summary/SuccessHeader';
import { TimelineCard } from '@/components/onboarding/summary/TimeLineCard';
import { useAuth } from '@/contexts/AuthContext';
import { globalStyles } from '@/globalStyles';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigation';
import { RootStackParamList } from '@/navigation/RootNavigation';
import { CalorieCalculator } from '@/services/calculations/CalorieCalculator';
import { ValidationService } from '@/services/calculations/ValidationService';
import { db } from '@/services/firebase';
import { colors, rounded, spacing, typography } from '@/themes';
import { CalculatedNutritionPlan } from '@/types/calcorieCalculator.types';
import { OnboardingData } from '@/types/onboarding.types';

import { PROGRESS_STEPS_LABELS } from './GoalSelectionScreen';

// ── PlanSummaryScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Summary'>;

export const PlanSummaryScreen: React.FC<Props> = ({ navigation, route }) => {
  const headerHeight = useHeaderHeight();
  const { onboardingData } = route.params ?? {};
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const { user } = useAuth();

  const [plan, setPlan] = useState<CalculatedNutritionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const t = setTimeout(() => calculatePlan(), 3200);
    return () => clearTimeout(t);
  }, []);

  const calculatePlan = useCallback(() => {
    try {
      const validation = ValidationService.validateOnboardingData(onboardingData as OnboardingData);
      if (!validation.valid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }
      const calculatedPlan = CalorieCalculator.calculateNutritionPlan(onboardingData as OnboardingData);
      const planValidation = ValidationService.validateCalculatedPlan(calculatedPlan);
      if (!planValidation.valid && planValidation.warnings?.length > 0) {
        console.warn('Plan warnings:', planValidation.warnings);
      }
      setPlan(calculatedPlan);
      setLoading(false);
    } catch {
      setErrors(['Failed to calculate plan. Please try again.']);
      setLoading(false);
    }
  }, [onboardingData]);

  const handleSavePlan = async () => {
    if (!user || !plan) return;
    try {
      setSaving(true);
      await setDoc(
        doc(db, 'users', user.uid),
        {
          uid: user.uid,
          ...onboardingData,
          bmr: plan.bmr,
          tdee: plan.tdee,
          dailyCalorieTarget: plan.dailyCalorieTarget,
          dailyProteinGrams: plan.dailyProteinGrams,
          dailyFatGrams: plan.dailyFatGrams,
          dailyCarbsGrams: plan.dailyCarbsGrams,
          dailyWaterMl: plan.dailyWaterMl,
          estimatedWeeksToGoal: plan.estimatedWeeksToGoal,
          onboardingCompletedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true },
      );
      rootNavigation.navigate('Main');
    } catch {
      setErrors(['Failed to save your plan. Please try again.']);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ── //
  if (loading) {
    return (
      <SafeAreaView style={globalStyles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surface.page} />
        <LoadingView />
      </SafeAreaView>
    );
  }

  // ── Error state ── //
  if (errors.length > 0) {
    return (
      <SafeAreaView style={globalStyles.safe}>
        <StatusBar barStyle="light-content" backgroundColor={colors.surface.page} />
        <ErrorView errors={errors} onBack={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  // ── Success state ──
  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* Ambient glow — shifts with selected goal color */}
      <View style={globalStyles.glowAmbientBlobTR} />
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
        {/* ── Animated success header ── */}
        <SuccessHeader>
          <>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowIcon}>🎉</Text>
              <Text style={styles.eyebrowText}>Plan Ready</Text>
            </View>

            <Text style={[globalStyles.title, globalStyles.textAlignCenter]}>
              {'Your personalised\n'}
              <GradientText textStyle={globalStyles.titleAccent}>plan is ready</GradientText>
            </Text>

            <Text style={[globalStyles.subtitle, globalStyles.textAlignCenter]}>
              Based on science, tailored to you. Everything below is yours to keep.
            </Text>
          </>
        </SuccessHeader>

        {/* Progress bar */}
        <ProgressBar name="Onboarding" currentStep={5} totalSteps={5} stepLabels={PROGRESS_STEPS_LABELS} />

        {/* ── Profile recap chips ── */}
        <View style={globalStyles.marg_b_md}>
          <ProfileSummaryCard data={onboardingData} />
        </View>

        {/* ── Macro donut ring ── */}
        <View style={globalStyles.marg_b_md}>
          <MacroRingChart
            calories={plan?.dailyCalorieTarget ?? NaN}
            proteinG={plan?.dailyProteinGrams ?? NaN}
            carbsG={plan?.dailyCarbsGrams ?? NaN}
            fatG={plan?.dailyFatGrams ?? NaN}
          />
        </View>

        {/* ── Daily targets with fill bars ── */}
        <View style={globalStyles.marg_b_md}>
          <DailyTargetsCard plan={plan} />
        </View>

        {/* ── Science breakdown ── */}
        <View style={globalStyles.marg_b_md}>
          <ScienceCard bmr={plan?.bmr ?? NaN} tdee={plan?.tdee ?? NaN} target={plan?.dailyCalorieTarget ?? NaN} />
        </View>

        {/* ── Timeline (only if goal has a target weight) ── */}
        {plan?.estimatedWeeksToGoal && (
          <View style={globalStyles.marg_b_md}>
            <TimelineCard weeks={plan?.estimatedWeeksToGoal ?? NaN} />
          </View>
        )}

        {/* ── Primary CTA Button ── */}
        <Button
          rightIcon={<FontAwesome name="long-arrow-right" color="#000" size={18} />}
          label={!saving ? 'Start Tracking' : 'Setting Up...'}
          onPress={() => handleSavePlan()}
          loading={saving}
          disabled={saving}
        />

        {/* ── Secondary CTA ── */}
        <Button
          variant="outline"
          leftIcon={<FontAwesome name="long-arrow-left" color="#fff" size={18} />}
          label="Adjust Settings"
          onPress={() => navigation.navigate('GoalSelection')}
        />

        <Text style={styles.finePrint}>
          You can update your plan anytime in <Text style={styles.finePrintAccent}>Settings</Text>.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

PlanSummaryScreen.displayName = 'PlanSummaryScreen';
export default PlanSummaryScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  eyebrow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'center',
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

  finePrint: { color: colors.content.tertiary, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: typography.height.xs }, // prettier-ignore
  finePrintAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
});
