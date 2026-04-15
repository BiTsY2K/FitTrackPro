import { FontAwesome } from '@expo/vector-icons';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import Button from '@/components/common/Button';
import GradientText from '@/components/common/GradientText';
import { SectionLabel } from '@/components/common/SectionLabel';
import { BMIIndicator } from '@/components/onboarding/measurement/BMIIndicator';
import { ImperialDisplay } from '@/components/onboarding/measurement/ImperialDisplay';
import { UnitToggle } from '@/components/onboarding/measurement/UnitToggle';
import { WeightDeltaCard } from '@/components/onboarding/measurement/WeightDeltaCard';
import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { OnboardingStackParamList } from '@/navigation/OnboardingNavigation';
import { colors, rounded, spacing, typography } from '@/themes';

import { PROGRESS_STEPS_LABELS } from './GoalSelectionScreen';

const SkeletonPicker = React.memo(() => (
  <View style={skeletonStyles.wrapper}>
    <View style={skeletonStyles.header} />
    <View style={skeletonStyles.drum} />
    <View style={skeletonStyles.btns} />
  </View>
));

const PickerSkeletons = React.memo(({ needsTarget }: { needsTarget: boolean }) => (
  <>
    <SkeletonPicker />
    <SkeletonPicker />
    <View style={skeletonStyles.bmiCard} />
    {needsTarget && <SkeletonPicker />}
  </>
));

PickerSkeletons.displayName = 'PickerSkeletons';
SkeletonPicker.displayName = 'SkeletonPicker';

const DRUM_H = 220;
const skeletonStyles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  header: { height: 28, borderRadius: 8, backgroundColor: COLORS.bgCard, marginBottom: 10 },
  drum: { height: DRUM_H, borderRadius: 18, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border },
  btns: { height: 46, borderRadius: 14, backgroundColor: COLORS.bgCard, borderWidth: 1, borderColor: COLORS.border, marginTop: 8 },
  bmiCard: { height: 96, borderRadius: 16, backgroundColor: COLORS.bgCard2, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16 },
});

// ── MeasurementsScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<OnboardingStackParamList, 'Measurements'>;

export const MeasurementsScreen: React.FC<Props> = ({ navigation, route }) => {
  const headerHeight = useHeaderHeight();
  const { onboardingData } = route.params ?? {};

  const needsTargetWeight = onboardingData?.goal !== 'maintain_weight';

  const [metric, setMetric] = useState<boolean>(false);
  const [currentHeightCm, setCurrentHeightCm] = useState<number>(170);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(78);
  const [targetWeightKg, setTargetWeightKg] = useState<number>(70);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(headerSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Imperial conversions (read-only display)
  const { ftTotal, inRem, currentLbs, targetLbs } = useMemo(() => {
    const ftTotal = Math.floor(currentHeightCm / 30.48);
    const inRem = Math.round((currentHeightCm % 30.48) / 2.54);
    const currentLbs = Math.round(currentWeightKg * 2.205);
    const targetLbs = Math.round(targetWeightKg * 2.205);
    return { ftTotal, inRem, currentLbs, targetLbs };
  }, [currentHeightCm, currentWeightKg, targetWeightKg]);

  const handleContinue = useCallback(() => {
    navigation.navigate('Activity', {
      onboardingData: {
        ...onboardingData,
        currentHeightCm,
        currentWeightKg,
        ...(needsTargetWeight && { targetWeightKg }),
      },
    });
  }, [navigation, onboardingData, currentHeightCm, currentWeightKg, targetWeightKg, needsTargetWeight]);

  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* Ambient glow - shifts with gender selection */}
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
        {/* ── Header ── */}
        <Animated.View style={[globalStyles.header, { opacity: headerFade, transform: [{ translateY: headerSlide }] }]}>
          <View style={styles.eyebrow}>
            <Text style={styles.eyebrowIcon}>📏</Text>
            <Text style={styles.eyebrowText}>Body Metrics</Text>
          </View>

          <Text style={globalStyles.title}>
            {'Your body \n'}
            <GradientText textStyle={[globalStyles.titleAccent]}>measurements.</GradientText>
          </Text>

          {/* ── Progress Bar ── */}
          <ProgressBar name="Onboarding" currentStep={3} totalSteps={5} stepLabels={PROGRESS_STEPS_LABELS} />

          <Text style={globalStyles.subtitle}>
            Drag the wheels or tap +/- to adjust.
            {'\n'}We use these to calculate your daily calorie needs.
          </Text>
        </Animated.View>

        {/* ── Unit Toggle ── */}
        <UnitToggle metric={metric} onToggle={setMetric} />

        <View style={styles.measurement}>
          {!metric && <SectionLabel icon="🧍">Body Metric</SectionLabel>}

          {/* ── Body Height Section ── */}
          <View style={globalStyles.marg_b_md}>
            <View style={metric ? null : globalStyles.displayNone}>
              {/* prettier-ignore */}
              <NumberPicker label="Height" value={currentHeightCm} onChange={setCurrentHeightCm} min={120} max={220} 
                step={1} unit="cm" accentColor={colors.accent.blue} icon="📏" />
            </View>
            <View style={metric ? globalStyles.displayNone : null}>
              <ImperialDisplay
                label="Height"
                icon="📏"
                primaryValue={ftTotal}
                primaryUnit="ft"
                secondaryValue={inRem}
                secondaryUnit="in"
                onPress={() => setMetric(true)}
              />
            </View>
          </View>

          {/* ── Body Weight Section ── */}
          <View style={globalStyles.marg_b_md}>
            {/* <SectionLabel icon="⚖️">Current Weight</SectionLabel> */}
            <View style={metric ? null : globalStyles.displayNone}>
              {/* prettier-ignore */}
              <NumberPicker label="Current Weight" value={currentWeightKg} onChange={setCurrentWeightKg} min={30} max={250} 
                  step={0.5} unit="kg" accentColor={colors.accent.green} icon="⚖️​️​" />
            </View>
            <View style={metric ? globalStyles.displayNone : null}>
              <ImperialDisplay
                label="Current Weight"
                icon="⚖️"
                primaryValue={currentLbs}
                primaryUnit="lbs"
                onPress={() => setMetric(true)}
              />
            </View>
          </View>

          {/* ── BMI ── */}
          <BMIIndicator heightCm={currentHeightCm} weightKg={currentWeightKg} />
        </View>

        {/* ── Target Weight ── */}
        {needsTargetWeight && (
          <>
            {!metric && <SectionLabel icon="🎯">Your Goal</SectionLabel>}

            <View style={globalStyles.marg_b_md}>
              <View style={metric ? null : globalStyles.displayNone}>
                {/* prettier-ignore */}
                <NumberPicker label="Target Weight" value={targetWeightKg} onChange={setTargetWeightKg} min={30} max={250} 
                step={0.5} unit="kg" accentColor={colors.accent.purple} icon="🎯" />
              </View>
              <View style={metric ? globalStyles.displayNone : null}>
                <ImperialDisplay
                  label="Target Weight"
                  icon="🎯"
                  primaryValue={targetLbs}
                  primaryUnit="lbs"
                  onPress={() => setMetric(true)}
                />
              </View>
            </View>

            <WeightDeltaCard currentKg={currentWeightKg} targetKg={targetWeightKg} metric={metric} />
          </>
        )}

        {/* ── CTA Button ── */}
        <Button
          rightIcon={<FontAwesome name="long-arrow-right" color="#000" size={18} />}
          label={'Continue to Activity Level'}
          onPress={() => handleContinue()}
        />

        <Text style={styles.finePrint}>
          You can update measurements anytime in <Text style={styles.finePrintAccent}>Settings</Text>.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

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

  measurement: { flexDirection: 'column', marginBottom: spacing[5] },
  finePrint: { color: colors.content.tertiary, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: typography.height.xs }, // prettier-ignore
  finePrintAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
});

export default MeasurementsScreen;
