import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';
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
import { Gender } from '@/types/onboarding.types';

import { PROGRESS_STEPS_LABELS } from './GoalSelectionScreen';

export type GenderOption = {
  type: 'gender';
  id: Gender;
  title: string;
  description: string;
  iconEmoji: string;
  accentColor: string;
  accentGlow: string;
  tag: string | null;
  stat: string;
};

const GENDER_OPTIONS: GenderOption[] = [
  {
    type: 'gender',
    id: 'male',
    iconEmoji: '♂️',
    title: 'Male',
    description: 'Assigned male at birth',
    stat: 'Testosterone-based plan',
    accentColor: colors.accent.blue,
    accentGlow: colors.accentGlow.blueSoft, //'rgba(59,130,246,0.14)',
    tag: null,
  },
  {
    type: 'gender',
    id: 'female',
    iconEmoji: '♀️',
    title: 'Female',
    description: 'Assigned female at birth',
    stat: 'Hormone-aware program',
    accentColor: colors.accent.pink,
    accentGlow: colors.accentGlow.pinkSoft, // 'rgba(236,72,153,0.14)',
    tag: null,
  },
];

// ── COMPONENT: DatePickerField ── Styled date picker trigger + native DateTimePicker modal (iOS sheet / Android spinner) ───────────────────
interface DatePickerFieldProps {
  value: Date;
  onChange: (date: Date) => void;
  styleContainerView?: ViewStyle;
}

const DatePickerField: React.FC<DatePickerFieldProps> = React.memo(
  ({ value, onChange, styleContainerView }) => {
    const [show, setShow] = useState(false);
    const pressScale = useRef(new Animated.Value(1)).current;

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const formattedDate = `${value.getDate()} ${months[value.getMonth()]} ${value.getFullYear()}`;

    const onPressIn = () => Animated.spring(pressScale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
    const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

    const handleChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
      if (Platform.OS === 'android') setShow(false);
      if (selectedDate) onChange(selectedDate);
    };

    return (
      <>
        <Animated.View style={[{ transform: [{ scale: pressScale }] }, styleContainerView]}>
          <TouchableOpacity
            onPress={() => setShow(true)}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
            style={datePickerStyles.field}
          >
            <Text style={datePickerStyles.icon}>📅</Text>
            <View style={datePickerStyles.textBlock}>
              <Text style={datePickerStyles.fieldLabel}>Birth Date</Text>
              <View style={datePickerStyles.fieldValue}>
                <View style={datePickerStyles.valueGroup}>
                  <Text style={datePickerStyles.valueText}>{formattedDate}</Text>
                </View>
              </View>
            </View>

            <FontAwesome name="chevron-right" color={colors.content.tertiary} size={typography.size.lg} />
          </TouchableOpacity>
        </Animated.View>

        {/* ── iOS: Modal sheet wrapper ── */}
        {Platform.OS === 'ios' && show && (
          <Modal transparent animationType="slide">
            <TouchableOpacity style={datePickerStyles.modalOverlay} activeOpacity={1} onPress={() => setShow(false)} />
            <View style={datePickerStyles.pickerSheet}>
              {/* Sheet handle */}
              <View style={datePickerStyles.sheetHandle} />

              <View style={datePickerStyles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={datePickerStyles.sheetCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={datePickerStyles.sheetTitle}>Date of Birth</Text>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={datePickerStyles.sheetDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <DateTimePicker
                value={value}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={new Date()}
                minimumDate={new Date(1920, 0, 1)}
                textColor={colors.content.primary}
                themeVariant="dark"
                style={{ backgroundColor: COLORS.bgCard }}
              />
            </View>
          </Modal>
        )}

        {/* ── Android: inline ── */}
        {Platform.OS === 'android' && show && (
          <DateTimePicker
            value={value}
            mode="date"
            display="spinner"
            design="material"
            title="Date of Birth"
            onChange={handleChange}
            maximumDate={new Date()}
            minimumDate={new Date(1920, 0, 1)}
          />
        )}
      </>
    );
  },

  (prevProps, nextProps) => {
    return (
      prevProps.value.getTime() === nextProps.value.getTime() &&
      prevProps.onChange === nextProps.onChange &&
      prevProps.styleContainerView === nextProps.styleContainerView
    );
  },
);

DatePickerField.displayName = 'DatePickerField';
export { DatePickerField };

const datePickerStyles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3.5'],
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing['3.5'],
  },

  icon: { fontSize: typography.size.xl2 },
  textBlock: { flex: 1, flexShrink: 1, minWidth: 0 },
  fieldLabel: { color: colors.content.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  fieldValue: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2] },
  valueGroup: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['0.5'] },
  valueText: { color: colors.content.primary, fontSize: typography.size.lg, fontWeight: typography.weight.extrabold, letterSpacing: -0.3 },

  // ── iOS Modal sheet ── //
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
  pickerSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: spacing[10],
    borderWidth: 1,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.overlay,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border.default,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  sheetTitle: { color: colors.content.primary, fontSize: typography.size.md, fontWeight: typography.weight.bold },
  sheetCancel: { color: colors.content.tertiary, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  sheetDone: { color: colors.accent.green, fontSize: typography.size.md, fontWeight: typography.weight.extrabold },
});

// ── COMPONENT: AgeBadge ── Context-aware age validity indicator - adapts label & color to age range ───────────────────
interface AgeBadgeProps {
  age: number;
  valid: boolean;
}

const AgeBadge: React.FC<AgeBadgeProps> = React.memo(
  ({ age, valid }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(8)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 6 }),
      ]).start();
    }, [age]);

    const emoji = age < 18 ? '🧒' : age > 60 ? '🧓' : '🏋';
    const color = !valid ? colors.accent.red : age < 18 ? colors.accent.orange : age > 60 ? colors.accent.blue : colors.accent.green;
    const headline = !valid ? (age < 13 ? 'Must be 13 or older' : 'Maximum age is 100')
      : (age < 18 ? 'Junior athlete - adapted plan' : (age > 60 ? 'Senior program available' : 'Peak performance range')); // prettier-ignore
    const sub = valid ? 'Your plan will be age-optimised automatically' : 'Please enter a valid date of birth';

    return (
      <Animated.View
        style={[
          ageBadgeStyles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
            backgroundColor: `${color}10`,
            borderColor: `${color}30`,
          },
        ]}
      >
        {/* Icon */}
        <View style={[ageBadgeStyles.iconBox, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
          <Text style={ageBadgeStyles.icon}>{emoji}</Text>
        </View>

        {/* Content */}
        <View style={ageBadgeStyles.content}>
          <Text style={[ageBadgeStyles.title, { color }]}>{headline}</Text>
          <Text style={ageBadgeStyles.body}>{sub}</Text>
        </View>

        {/* Age Pill */}
        <View style={[ageBadgeStyles.agePill, { backgroundColor: `${color}20`, borderColor: `${color}40` }]}>
          <Text style={[ageBadgeStyles.ageNum, { color }]}>{age}</Text>
          <Text style={[ageBadgeStyles.ageUnit, { color }]}>yrs</Text>
        </View>
      </Animated.View>
    );
  },

  (prevProps, nextProps) => {
    return prevProps.age === nextProps.age && prevProps.valid === nextProps.valid;
  },
);

AgeBadge.displayName = 'AgeBadge';
export { AgeBadge };

const ageBadgeStyles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing['3.5'], borderWidth: 1, borderRadius: rounded.lg, 
    borderColor: 'transparent', backgroundColor: 'transparent', padding: spacing['3.5'] }, // prettier-ignore

  iconBox: { width: spacing[12], height: spacing[12], borderWidth: 1, borderRadius: rounded.lg, borderColor: 'transparent',
    backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, // prettier-ignore
  icon: { fontSize: typography.size.xl2 },

  content: { flex: 1, flexShrink: 1, minWidth: 0 },
  title: { color: colors.accent.green, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold, marginBottom: spacing.xs1 },
  body: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, lineHeight: typography.size.xs * 1.2, fontWeight: 500 },

  agePill: { borderWidth: 1, borderRadius: rounded.md, paddingHorizontal: spacing[3], paddingVertical: spacing[2], 
    flexDirection: 'row', alignItems: 'baseline', justifyContent: 'center', flexShrink: 0, minWidth: spacing[16]}, // prettier-ignore
  ageNum: { fontSize: typography.size.xl, fontWeight: typography.weight.black, marginRight: spacing[1] },
  ageUnit: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
});

// ── COMPONENT: CaloriePreview ── estimated macro targets, updates live as user fills in profile ───────────────────
interface CaloriePreviewProps {
  gender: Gender | null;
  age: number | null;
  styleContainerView?: ViewStyle;
}

const CaloriePreview: React.FC<CaloriePreviewProps> = React.memo(
  ({ gender, age, styleContainerView }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      if (gender && age) {
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      } else {
        Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      }
    }, [gender, age]);

    if (!gender || !age) return <Animated.View style={{ opacity: fadeAnim }} />;

    const bmr = gender === 'male' ? Math.round(10 * 75 + 6.25 * 175 - 5 * age + 5) : Math.round(10 * 60 + 6.25 * 162 - 5 * age - 161);
    const tdee = Math.round(bmr * 1.55);
    const protein = Math.round((tdee * 0.3) / 4);
    const carbs = Math.round((tdee * 0.4) / 4);

    const macros = [
      { label: 'Calories', value: tdee, unit: 'kcal', color: colors.accent.green },
      { label: 'Protein', value: protein, unit: 'g', color: colors.accent.blue },
      { label: 'Carbs', value: carbs, unit: 'g', color: colors.accent.orange },
    ];

    return (
      <Animated.View style={[caloriePreviewStyles.card, { opacity: fadeAnim }, styleContainerView]}>
        <View style={caloriePreviewStyles.headerRow}>
          <SectionLabel icon="⚡" styleContainerView={caloriePreviewStyles.sectionLabel}>
            ESTIMATED DAILY TARGETS
          </SectionLabel>
          <View style={caloriePreviewStyles.liveBadge}>
            <View style={caloriePreviewStyles.liveDot} />
            <Text style={caloriePreviewStyles.liveText}>Live</Text>
          </View>
        </View>
        <View style={caloriePreviewStyles.macrosRow}>
          {macros.map((m, i) => (
            <View key={i} style={caloriePreviewStyles.macroChip}>
              <Text style={[caloriePreviewStyles.macroValue, { color: m.color }]}>{m.value}</Text>
              <Text style={caloriePreviewStyles.macroUnit}>{m.unit}</Text>
              <Text style={caloriePreviewStyles.macroLabel}>{m.label}</Text>
            </View>
          ))}
        </View>
        <Text style={caloriePreviewStyles.note}>Estimates based on avg body composition.{'\n'} Finalised after measurements step.</Text>
      </Animated.View>
    );
  },

  (prevProps, nextProps) => {
    return (
      prevProps.gender === nextProps.gender &&
      prevProps.age === nextProps.age &&
      prevProps.styleContainerView === nextProps.styleContainerView
    );
  },
);

CaloriePreview.displayName = 'CaloriePreview';
export { CaloriePreview };

const caloriePreviewStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    backgroundColor: colors.surface.overlay,
    borderColor: colors.border.default,
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

// ── BioDataScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<OnboardingStackParamList, 'BioData'>;

export const BioDataScreen: React.FC<Props> = ({ navigation, route }) => {
  const headerHeight = useHeaderHeight();
  const { onboardingData } = route.params ?? {};

  const [gender, setGender] = useState<Gender | null>('male');
  const [birthDate, setBirthDate] = useState(new Date(2000, 0, 1));
  const [headerMounted, setHeaderMounted] = useState<boolean>(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    if (headerMounted) {
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

  // Accurate age calculation (handles birthday not yet passed this year) //
  const today = new Date();
  const rawAge = today.getFullYear() - birthDate.getFullYear();
  const birthdayPassed =
    today.getMonth() > birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());
  const age = birthdayPassed ? rawAge : rawAge - 1;
  const ageValid = age >= 13 && age <= 100;
  const isValid = gender !== null && ageValid;

  const selectedGenderData = GENDER_OPTIONS.find(g => g.id === gender) ?? null;

  const handleContinue = () => {
    if (!isValid) return;
    navigation.navigate('Measurements', {
      onboardingData: {
        ...onboardingData,
        gender,
        birthDate: birthDate,
        // birthDate: birthDate.toISOString(),
        age,
      },
    });
  };

  return (
    <View style={[globalStyles.safe, { paddingTop: headerHeight }]}>
      {/* ── Ambient glow - shifts with gender selection ── */}
      <View style={[globalStyles.glowAmbientBlobTR, selectedGenderData && { backgroundColor: `${selectedGenderData.accentColor}14` }]} />
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
            <Text style={styles.eyebrowIcon}>👤</Text>
            <Text style={styles.eyebrowText}>Your Profile</Text>
          </View>

          <Text style={globalStyles.title}>
            {'Tell us \n'}
            <GradientText textStyle={[globalStyles.titleAccent]}>about you.</GradientText>
          </Text>

          {/* ── Progress Bar ── */}
          <ProgressBar name="Onboarding" currentStep={2} totalSteps={5} stepLabels={PROGRESS_STEPS_LABELS} />

          <Text style={globalStyles.subtitle}>We use this to personalise your macros, training volume & recovery windows.</Text>
        </Animated.View>

        {/* ── Gender ── */}
        <SectionLabel icon="⚧️">Biological Sex</SectionLabel>
        <View style={styles.genders}>
          {GENDER_OPTIONS.map((opt, i) => (
            <SelectionCard
              key={opt.id}
              option={opt}
              selected={gender === opt.id}
              onPress={() => setGender(prev => (prev === opt.id ? null : opt.id))}
              animDelay={i * 80 + 80}
              variant="VERTICAL"
            />
          ))}
        </View>

        <View style={globalStyles.marg_b_md}>
          {/* ── Date of Birth ── */}
          <SectionLabel icon="🎂">Date of Birth</SectionLabel>
          <DatePickerField value={birthDate} onChange={setBirthDate} styleContainerView={globalStyles.marg_b_sm} />

          {/* ── Age Badge ── */}
          <AgeBadge age={age} valid={ageValid} />
        </View>

        {/* ── Live Calorie Preview ── */}
        <CaloriePreview gender={gender} age={ageValid ? age : null} styleContainerView={globalStyles.marg_b_md} />

        {/* ── Privacy Card ── */}
        <View style={[privacyCardStyles.card, globalStyles.marg_b_md]}>
          <View style={privacyCardStyles.iconBox}>
            <Text style={privacyCardStyles.icon}>🔒</Text>
          </View>
          <View style={privacyCardStyles.content}>
            <Text style={privacyCardStyles.title}>Your data stays private</Text>
            <Text style={privacyCardStyles.body}>
              Age & gender are used only to calculate accurate calorie targets. Never sold or shared.
            </Text>
          </View>
        </View>

        {/* ── CTA Button ── */}
        <Button
          rightIcon={isValid ? <FontAwesome name="long-arrow-right" color="#000" size={18} /> : null}
          label={isValid ? 'Continue to Measurements' : 'Complete Your Profile'}
          onPress={() => handleContinue()}
          disabled={!isValid}
        />

        <Text style={styles.finePrint}>
          You can update this anytime in <Text style={styles.finePrintAccent}>Settings</Text>.
        </Text>
      </KeyboardAwareScrollView>
    </View>
  );
};

BioDataScreen.displayName = 'BioDataScreen';
export default BioDataScreen;

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

  genders: { flexDirection: 'row', marginBottom: spacing[5], gap: spacing.sm },
  finePrint: { color: colors.content.tertiary, fontSize: typography.size.xs, textAlign: 'center',
    marginTop: spacing.sm, lineHeight: typography.height.xs }, // prettier-ignore
  finePrintAccent: { color: colors.accent.green, fontWeight: typography.weight.bold },
});

const privacyCardStyles = StyleSheet.create({
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
