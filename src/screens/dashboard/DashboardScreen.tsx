import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Alert, Animated, Pressable, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { SectionLabel } from '@/components/common/SectionLabel';
import { BorderRadius, COLORS, Colors, Spacing, Typography } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { DailyTotals, useFoodLog } from '@/hooks/useFoodLog';
import { useProfile } from '@/hooks/useProfile';
import { useWaterLog } from '@/hooks/useWaterLog';
import { BottomTabParamList, MainStackParamList } from '@/navigation/MainNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import { FoodLog, MealType } from '@/types/food.types';
import { DailyMacroTargets } from '@/types/onboarding.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const MEAL_CONFIG: Record<MealType, { label: string; icon: string; color: string }> = {
  breakfast: { label: 'Breakfast', icon: '☀️', color: Colors.warning },
  lunch: { label: 'Lunch', icon: '🌤️', color: Colors.primary[400] },
  dinner: { label: 'Dinner', icon: '🌙', color: Colors.info },
  snack: { label: 'Snack', icon: '🍎', color: Colors.success },
};

function CalorieHeroCard({ log, plan }: { log: DailyTotals; plan: DailyMacroTargets }) {
  const remaining = Math.max(0, plan.dailyCalorieTarget - log.calories);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
    ]).start();
  }, []);

  const calorieStats = [
    { label: 'Food Eaten', value: log.calories, color: COLORS.accent },
    { label: 'Remaining', value: remaining, color: COLORS.textMuted },
    { label: 'Base Goal', value: plan.dailyCalorieTarget, color: COLORS.textMuted },
  ];

  /* prettier-ignore */
  const macros = [
    { icon: '🥩', label: 'Protein', rawValue: log.protein, max: plan.dailyProteinGrams, unit: 'g', color: colors.accent.blue, bg: colors.accentGlow.blue },
    { icon: '🌾', label: 'Carbs', rawValue: log.carbs, max: plan.dailyCarbsGrams, unit: 'g', color: colors.accent.orange, bg: colors.accentGlow.orange },
    { icon: '🫒', label: 'Fat', rawValue: log.fat, max: plan.dailyFatGrams, unit: 'g', color: colors.accent.purple, bg: colors.accentGlow.purple },
  ];

  return (
    <Animated.View style={[calorieHeroCardStyles.card, { gap: spacing.md, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={calorieHeroCardStyles.row}>
        {/* Donut ring */}
        <Fragment>
          {/* prettier-ignore */}
          <MacroRingChart size={178} strokeWidth={10} calories={log.calories} calorieTarget={plan.dailyCalorieTarget} 
            proteinG={log.protein} carbsG={log.carbs} fatG={log.fat} />
        </Fragment>
      </View>

      <View style={[globalStyles.flex_1, { gap: spacing.md }]}>
        {/* Calorie stats */}
        <View style={calorieHeroCardStyles.statsRow}>
          {calorieStats.map((stat, i) => (
            <View key={`calorie_stat_${i}`} style={[calorieHeroCardStyles.statsItem]}>
              <Text style={[calorieHeroCardStyles.statsValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={calorieHeroCardStyles.statsUnit}>kcal</Text>
              <Text style={calorieHeroCardStyles.statsLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Macro stats bars */}
        <View style={[calorieHeroCardStyles.card, { padding: spacing.sm, paddingBottom: spacing[1] }]}>
          <SectionLabel icon="🎯">Daily Targets</SectionLabel>
          {macros.map((macro, i) => (
            <Fragment key={`macro_${macro.label}`}>
              {/* prettier-ignore */}
              <MacroTrackerBar icon={macro.icon} label={macro.label} value={macro.rawValue} maxValue={macro.max} 
                color={macro.color} bg={macro.bg} isLastMacroRow= {i < macros.length - 1} />
            </Fragment>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const calorieHeroCardStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm, gap: spacing.xs1 },
  statsItem: { flex: 1, alignItems: 'center' },

  statsValue: { fontWeight: typography.weight.black, lineHeight: 22 },
  statsUnit: { color: COLORS.textMuted, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold },
  statsLabel: { color: COLORS.textMuted, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
});

// ── COMPONENT: QuickActionRow ─────────────────────────────────────────────────────────────────────────────
interface QuickActionRowProps {
  onLogFood: () => void;
  onScan: () => void;
  onWater: () => void;
}
function QuickActionRow({ onLogFood, onScan, onWater }: QuickActionRowProps) {
  const actions = [
    { icon: '🍽️', label: 'Log Food', onPress: onLogFood, primary: true },
    { icon: '📷', label: 'Scan', onPress: onScan, primary: false },
    { icon: '💧', label: 'Water', onPress: onWater, primary: false },
  ];
  return (
    <View style={quickActionStyles.row}>
      {actions.map((a, i) =>
        /* prettier-ignore */
        <TouchableOpacity key={i} onPress={a.onPress} activeOpacity={0.8}
          style={[quickActionStyles.btn, a.primary && quickActionStyles.btnPrimary]}
        >
          <Text style={quickActionStyles.btnIcon}>{a.icon}</Text>
          <Text style={[quickActionStyles.btnLabel, a.primary && quickActionStyles.btnLabelPrimary]}>{a.label}</Text>
        </TouchableOpacity>,
      )}
    </View>
  );
}

const quickActionStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing['2.5'] },
  btn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 5,
  },
  btnPrimary: { flex: 2, backgroundColor: COLORS.accentGlow, borderColor: 'rgba(0,255,135,0.3)' },
  btnIcon: { fontSize: 20 },
  btnLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '700' },
  btnLabelPrimary: { color: COLORS.accent },
});

// ── COMPONENT: WaterTrackerCard ─────────────────────────────────────────────────────────────────────────────
function WaterTrackerCard({ waterMl, targetMl, onAdd }: { waterMl: number; targetMl: number; onAdd: (ml: number) => void }) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, waterMl / targetMl);

  useEffect(() => {
    Animated.spring(fillAnim, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
  }, [waterMl]);

  return (
    <View style={waterTrackerStyles.card}>
      {/* prettier-ignore */}
      <MacroTrackerBar icon={'💧'} label={'Water'} value={Number((waterMl / 1000).toFixed(2))} maxValue={Number((targetMl / 1000).toFixed(2))}
        unit='L' color={COLORS.teal} bg={'rgba(6,182,212,0.15)'} isLastMacroRow={false} />

      <View style={waterTrackerStyles.btns}>
        {[250, 500].map(ml => (
          <Fragment key={ml}>
            {/* prettier-ignore */}
            <TouchableOpacity onPress={() => onAdd(ml)}
              style={waterTrackerStyles.addBtn} activeOpacity={0.75}>
              <Text style={waterTrackerStyles.addBtnText}>+{ml}ml</Text>
            </TouchableOpacity>
          </Fragment>
        ))}
      </View>
    </View>
  );
}

const waterTrackerStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  btns: { flexDirection: 'row', gap: spacing['2.5'], flexShrink: 1 },
  addBtn: { flex: 1, paddingHorizontal: spacing.sm, paddingVertical: spacing.md, borderWidth: 1, borderRadius: rounded.lg, 
    backgroundColor: 'rgba(6,182,212,0.12)', borderColor: 'rgba(6,182,212,0.3)' }, // prettier-ignore
  addBtnText: { textAlign: 'center', color: COLORS.teal, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: MealAccordionItem
// ─────────────────────────────────────────────────────────────────────────────
interface MealAccordionItemProps {
  meal: {
    type: MealType;
    foodLogs: FoodLog[];
    label: string;
    icon: string;
    color: string;
    time: string;
    calories: number;
  };
  onAddFood: () => void;
  onDeleteFood: (logId: string) => void;
}

function MealAccordionItem({ meal, onAddFood, onDeleteFood }: MealAccordionItemProps) {
  const [expanded, setExpanded] = useState(false);
  const heightAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const toggle = () => {
    const toVal = expanded ? 0 : 1;
    setExpanded(!expanded);

    Animated.parallel([
      Animated.spring(heightAnim, { toValue: toVal, useNativeDriver: false, speed: 18, bounciness: 4 }),
      Animated.spring(rotateAnim, { toValue: toVal, useNativeDriver: true, speed: 20, bounciness: 6 }),
    ]).start();
  };

  const isEmpty = meal.foodLogs.length === 0;
  const maxHeight = (meal.foodLogs.length + 1) * 52 + 60;

  return (
    <View style={mealAccordionStyles.card}>
      <Pressable onPress={toggle} style={mealAccordionStyles.header}>
        <View style={[mealAccordionStyles.iconBox, isEmpty && mealAccordionStyles.mealIconEmpty]}>
          <Text style={mealAccordionStyles.icon}>{meal.icon}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={mealAccordionStyles.titleRow}>
            <Text style={mealAccordionStyles.mealLabel}>{meal.label}</Text>
            <Text style={[mealAccordionStyles.mealCal, isEmpty && { color: COLORS.textMuted }]}>
              {meal.calories > 0 ? `${meal?.calories} kcal` : '—'}
            </Text>
          </View>
          <Text style={mealAccordionStyles.mealSub}>
            {isEmpty
              ? 'Nothing logged yet'
              : `${meal.foodLogs.length} item${meal.foodLogs.length > 1 ? 's' : ''} · ${meal.time || `${new Date().getHours()}:${new Date().getMinutes()} AM`}`}
          </Text>
        </View>
        <Animated.Text
          style={[
            mealAccordionStyles.chevron,
            { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] }) }] },
          ]}
        >
          <Ionicons name="chevron-up-sharp" color={colors.content.tertiary} size={24} />
        </Animated.Text>
      </Pressable>

      <Animated.View style={{ maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, maxHeight] }), overflow: 'hidden' }}>
        <View style={mealAccordionStyles.body}>
          {meal.foodLogs.map((item, ii) => (
            <View key={item.id} style={[mealAccordionStyles.itemRow, ii < meal.foodLogs.length - 1 && mealAccordionStyles.itemBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={mealAccordionStyles.itemName}>{item.foodItem.name}</Text>
                <Text style={mealAccordionStyles.itemMacros}>
                  P: {item.foodItem.nutrition.proteinGrams}g · C: {item.foodItem.nutrition.carbsGrams}g · F:{' '}
                  {item.foodItem.nutrition.fatGrams}g
                </Text>
              </View>
              <View style={mealAccordionStyles.calBadge}>
                <Text style={mealAccordionStyles.calBadgeText}>{item.foodItem.nutrition.calories} kcal</Text>
              </View>
              {/* Delete log entry */}
              <Pressable
                style={mealAccordionStyles.deleteBtn}
                hitSlop={10}
                onPress={() =>
                  Alert.alert(
                    'Remove Food',
                    `Remove "${item.foodItem.name}" from ${meal.label}?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Remove', style: 'destructive', onPress: () => onDeleteFood(item.id) },
                    ],
                  )
                }
              >
                <Ionicons name="trash-outline" size={15} color={COLORS.error} />
              </Pressable>
            </View>
          ))}
          {/* Meal Add Button */}
          <TouchableOpacity onPress={onAddFood} style={mealAccordionStyles.addBtn} activeOpacity={0.8}>
            <Text style={mealAccordionStyles.addBtnText}>+ Add to {meal.label}</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
const mealAccordionStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  icon: { fontSize: typography.size.lg },
  iconBox: { width: 44, height: 44, borderWidth: 1, borderRadius: rounded.lg, alignItems: 'center', 
    justifyContent: 'center', flexShrink: 0 }, // prettier-ignore
  // mealIcon: {
  //   width: 40,
  //   height: 40,
  //   borderRadius: 12,
  //   backgroundColor: COLORS.accentGlow,
  //   borderWidth: 1,
  //   borderColor: 'rgba(0,255,135,0.2)',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   flexShrink: 0,
  // },
  mealIconEmpty: { backgroundColor: COLORS.glass, borderColor: COLORS.border },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealLabel: { color: COLORS.text, fontSize: 14, fontWeight: '800' },
  mealCal: { color: COLORS.accent, fontSize: 13, fontWeight: '800' },
  mealSub: { color: COLORS.textMuted, fontSize: 11, marginTop: 2 },
  chevron: { color: COLORS.textMuted, fontSize: 14 },
  body: { borderTopWidth: 1, borderTopColor: COLORS.border, padding: 14, paddingTop: 10 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 9 },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  itemName: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 2 },
  itemMacros: { color: COLORS.textMuted, fontSize: 11 },
  calBadge: {
    backgroundColor: COLORS.accentGlow,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  calBadgeText: { color: COLORS.accent, fontSize: 12, fontWeight: '800' },

  addBtn: { borderWidth: 1, borderRadius: rounded.lg, borderColor: colors.border.default, backgroundColor: colors.surface.glass,
    alignItems: 'center', marginTop: spacing.xs, paddingVertical: spacing.md }, // prettier-ignore
  addBtnText: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  deleteBtn: { padding: 6, marginLeft: 6, alignItems: 'center', justifyContent: 'center' },
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: MacroRingChart (SVG donut — from PlanSummaryScreen)
// ─────────────────────────────────────────────────────────────────────────────
interface MacroRingProps {
  size: number;
  strokeWidth: number;
  calories: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export function MacroRingChart({ size, strokeWidth, calories, calorieTarget, proteinG, carbsG, fatG }: MacroRingProps) {
  const R = (size - strokeWidth) / 2, CX = size / 2, CY = size / 2; // prettier-ignore
  const circumference = 2 * Math.PI * R;
  const GAP = 0;

  const totalKcal = proteinG * 4 + carbsG * 4 + fatG * 9 || 1;
  const segments = [
    { frac: (proteinG * 4) / totalKcal, color: colors.accent.blue },
    { frac: (carbsG * 4) / totalKcal, color: colors.accent.orange },
    { frac: (fatG * 9) / totalKcal, color: colors.accent.purple },
  ];

  let cumulativeOffset = 0;
  const calorieFraction = Math.min(1, calories / calorieTarget);
  const arcs = segments.map(seg => {
    const arcLen = seg.frac * (circumference - GAP * segments.length) * calorieFraction;
    const offset = -cumulativeOffset;
    cumulativeOffset += seg.frac * circumference * calorieFraction;
    return { ...seg, arcLen, dashOffset: offset };
  });

  return (
    <View style={[macroRingStyles.ringWrap, { width: size, height: size }]}>
      <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={CX} cy={CY} r={R} fill="none" stroke={colors.border.default} strokeWidth={strokeWidth} />

        {arcs.map((arc, i) => (
          <Fragment key={`arcs_${i}`}>
            {/* prettier-ignore */}
            <Circle key={`arcs_circle_${i}`} cx={CX} cy={CY} r={R} fill="none" stroke={arc.color} strokeWidth={strokeWidth}
              strokeDasharray={`${arc.arcLen} ${circumference}`} strokeDashoffset={arc.dashOffset} strokeLinecap="round"
            />
          </Fragment>
        ))}
      </Svg>

      {/* Centre overlay label */}
      <View style={[macroRingStyles.centreOverlay, { width: size, height: size }]}>
        <Text style={macroRingStyles.centreValue}>{calories}</Text>
        <Text style={macroRingStyles.centreUnit}>kcal/day</Text>
      </View>
    </View>
  );
}
const macroRingStyles = StyleSheet.create({
  ringWrap: { position: 'relative', width: 128, height: 128 },
  centreOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  centreValue: { color: colors.accent.green, fontSize: typography.size.xl2, fontWeight: typography.weight.black, 
    lineHeight: typography.height.base }, // prettier-ignore
  centreUnit: { color: colors.content.secondary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
});

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENT: MacroBar — mini labelled fill bar
// ─────────────────────────────────────────────────────────────────────────────
interface MacroBarProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  maxValue: number;
  unit?: string;
  color: string;
  bg: string;
  isLastMacroRow?: boolean;
  showValueBadge?: boolean;
}

function MacroTrackerBar({
  icon,
  label,
  value,
  unit = 'g',
  color,
  bg,
  maxValue,
  isLastMacroRow = false,
  showValueBadge = false,
}: MacroBarProps) {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, value / maxValue);

  useEffect(() => {
    Animated.spring(fillAnim, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
  }, [value]);

  return (
    <View style={[macrobarStyles.macroRow, isLastMacroRow && macrobarStyles.macroRowBorder]}>
      <View style={[macrobarStyles.iconBox, { backgroundColor: bg, borderColor: `${color}30` }]}>
        <Text style={macrobarStyles.icon}>{icon}</Text>
      </View>

      <View style={macrobarStyles.labelFillTrack}>
        <View style={macrobarStyles.labelRow}>
          <Text style={macrobarStyles.label}>{label}</Text>
          <View style={showValueBadge && [macrobarStyles.valueBadge, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
            <Text style={[macrobarStyles.value, { color: color }]}>{`${value}${unit} / ${maxValue}${unit}`}</Text>
            {/* <Text style={[macrobarStyles.valueUnit, { color: color }]}>{unit}</Text> */}
          </View>
        </View>

        <View style={macrobarStyles.track}>
          <Animated.View
            style={[
              macrobarStyles.fill,
              {
                backgroundColor: color,
                width: fillAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', `${Math.min(100, ((value || 0) / maxValue) * 100)}%`],
                }),
              },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const macrobarStyles = StyleSheet.create({
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 12 },
  macroRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.default },

  icon: { fontSize: typography.size.lg },
  iconBox: { width: 44, height: 44, borderWidth: 1, borderRadius: rounded.lg, alignItems: 'center', 
    justifyContent: 'center', flexShrink: 0 }, // prettier-ignore

  labelFillTrack: { flex: 1, marginTop: -spacing.xs1 },
  labelRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing['1.5'] },
  label: { flex: 1, color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },

  valueBadge: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['0.5'], borderWidth: 1, borderRadius: rounded.md,
    paddingHorizontal: spacing['2.5'], paddingVertical: spacing.xs1, flexShrink: 0 }, // prettier-ignore
  value: { fontSize: typography.size.sm, fontWeight: typography.weight.extrabold },
  valueUnit: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },

  track: { height: 6, borderRadius: rounded.full, backgroundColor: colors.border.default, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: rounded.full },
});


// ── DashboardScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = CompositeScreenProps<BottomTabScreenProps<BottomTabParamList, 'Dashboard'>, NativeStackScreenProps<MainStackParamList>>;

const DEFAULT_DAILY_MACRO_TARGETS: DailyMacroTargets = {
  dailyCalorieTarget: 2600,
  dailyProteinGrams: 90,
  dailyFatGrams: 85,
  dailyCarbsGrams: 290,
  dailyWaterMl: 3200, // 3.2 L expressed in ml — matches WaterTrackerCard's /1000 display logic
} as const;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();
  const { dailyTotals, logsByMeal, isLoading: logsLoading, refetch: refetchLogs, deleteFood } = useFoodLog(new Date(), profile);
  const { waterMl, addWater } = useWaterLog(new Date()); // Persisted daily water — AsyncStorage-backed

  const onRefresh = () => {
    refetchProfile();
    refetchLogs();
  };
  const isRefreshing = profileLoading || logsLoading;
  if (profileLoading || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dailyMacroTargets = profile.nutritionPlan?.dailyMacroTargets ?? DEFAULT_DAILY_MACRO_TARGETS;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 17 ? 'Good afternoon' : 'Good evening';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={globalStyles.safe}>
      <KeyboardAwareScrollView
        style={globalStyles.scroll}
        contentContainerStyle={globalStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={20}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={Colors.primary[400]} />}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name}>{profile.displayName || 'There'}</Text>
            <Text style={styles.dateLabel}>{today}</Text>
          </View>

          <View style={styles.headerRight}>
            {/* Streak badge alongside the user's name */}
            {(profile.currentStreak ?? 0) > 0 && (
              <View style={styles.streakBadge}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText} numberOfLines={1}>
                  {profile.currentStreak!}
                </Text>
              </View>
            )}

            <Pressable onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.avatar}>
                <Text style={styles.avatarText}>{`${profile.displayName && profile.displayName[0]}`}</Text>
              </LinearGradient>
              {/* <View style={styles.avatarSmall}> <Ionicons name="person" size={24} color={Colors.primary[400]} /> </View> */}
            </Pressable>
          </View>
        </View>

        {/* ── Calorie hero card ── */}
        <View style={globalStyles.marg_b_md}>
          <CalorieHeroCard log={dailyTotals} plan={dailyMacroTargets} />
        </View>

        {/* ── Quick actions ── */}
        <View style={globalStyles.marg_b_md}>
          <QuickActionRow
            onLogFood={() => navigation.navigate('FoodSearchScreen', { mealType: 'lunch' })}
            onScan={() => navigation.navigate('BarcodeScanner', { mealType: 'snack' })}
            onWater={() => addWater(250)}
          />
        </View>

        {/* ── Water ── */}
        <View style={globalStyles.marg_b_lg}>
          <WaterTrackerCard waterMl={waterMl} targetMl={dailyMacroTargets.dailyWaterMl} onAdd={addWater} />
        </View>

        {/* ── Meals ── */}
        <View style={globalStyles.marg_b_lg}>
          <SectionLabel icon="🍴">Today's Meals</SectionLabel>
          {(Object.keys(logsByMeal) as MealType[]).map(mealType =>
            /* prettier-ignore */
            <MealAccordionItem key={`meal_accordion_${mealType}`}
              onAddFood={() => navigation.navigate('FoodSearchScreen', { mealType })}
              onDeleteFood={(logId) => deleteFood(logId)}
              meal={{ type: mealType, foodLogs: logsByMeal[mealType], ...MEAL_CONFIG[mealType], time: '',
                calories: (logsByMeal[mealType] || []).reduce<number>((acc: number, log: FoodLog) => acc + log.totalCalories, 0),
              }}
            />,
          )}
        </View>

      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing.lg },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: Typography.fontSize.base, color: Colors.text.secondary },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 20 },
  greeting: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold, lineHeight: 15 },
  name: { color: colors.content.primary, fontSize: typography.size.xl2, fontWeight: typography.weight.black, lineHeight: 24 },
  dateLabel: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold, lineHeight: 15 },
  headerLeft: { flex: 1, flexShrink: 1, minWidth: 0 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing['2.5'] },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['0.5'],
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.accent.orange,
    backgroundColor: colors.accentGlow.orange,
    paddingHorizontal: spacing.sm,
    height: 40,
    maxWidth: 60,
  },

  streakIcon: { fontSize: typography.size.md },
  streakText: { color: colors.accent.orange, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold },

  avatar: { width: 40, height: 40, borderRadius: rounded.lg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.content.onBrand, fontSize: typography.size.xl, fontWeight: typography.weight.black, marginTop: -spacing['0.5'] }, // prettier-ignore

  // avatarSmall: { width: 40, height: 40, borderRadius: BorderRadius.full, backgroundColor: Colors.primary[100], alignItems: 'center', justifyContent: 'center' },


});
