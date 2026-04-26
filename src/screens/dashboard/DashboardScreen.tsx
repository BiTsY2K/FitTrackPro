import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
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
  breakfast: { label: 'Breakfast', icon: '☀️', color: colors.accent.orange },
  lunch: { label: 'Lunch', icon: '🌤️', color: colors.accent.yellow },
  dinner: { label: 'Dinner', icon: '🌙', color: colors.accent.blue },
  snack: { label: 'Snack', icon: '🍎', color: colors.accent.green },
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
    { label: 'Food Eaten', value: log.calories, color: colors.accent.green },
    { label: 'Remaining', value: remaining, color: colors.content.secondary },
    { label: 'Base Goal', value: plan.dailyCalorieTarget, color: colors.content.secondary },
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
          <SectionLabel icon="🎯" children="Daily Targets" />
          {macros.map((macro, i) => (
            <Fragment key={`macro_${macro.label}`}>
              {/* prettier-ignore */}
              <MacroTrackerBar icon={macro.icon} label={macro.label} value={macro.rawValue} maxValue={macro.max} 
                color={macro.color} isLastMacroRow= {i < macros.length - 1} />
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
  statsUnit: { color: colors.content.secondary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold },
  statsLabel: { color: colors.content.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
});

// ── COMPONENT: QuickActionRow ─────────────────────────────────────────────────────────────────────────────

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  primary?: boolean;
}

const QuickActionButton = React.memo(({ icon, label, onPress, primary = false }: QuickActionButtonProps) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View
      style={[
        quickActionStyles.btnWrapper,
        primary && quickActionStyles.btnPrimaryWrapper,
        {
          transform: [{ scale: pressScale }],
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={[quickActionStyles.btn, primary && quickActionStyles.btnPrimary]}>
          <Text style={[quickActionStyles.btnIcon, primary && quickActionStyles.btnIconPrimary]}>{icon}</Text>
          <Text style={[quickActionStyles.btnLabel, primary && quickActionStyles.btnLabelPrimary]}>{label}</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

QuickActionButton.displayName = 'QuickActionButton';
export { QuickActionButton };

interface QuickActionRowProps {
  onLogFood: () => void;
  onScan: () => void;
  onWater: () => void;
}

const QuickActionRow = React.memo(({ onLogFood, onScan, onWater }: QuickActionRowProps) => {
  return (
    <View style={quickActionStyles.row}>
      <QuickActionButton icon={<Ionicons name="fast-food" size={24} />} label="Log Food" onPress={onLogFood} primary />
      <QuickActionButton icon={<Ionicons name="camera" size={24} />} label="Scan" onPress={onScan} />
      <QuickActionButton icon={<Ionicons name="water" size={24} />} label="Water" onPress={onWater} />
    </View>
  );
});

QuickActionRow.displayName = 'QuickActionRow';
export { QuickActionRow };

const quickActionStyles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing['2.5'] },
  btnWrapper: {
    flex: 1,
    minWidth: 0,
    borderWidth: 2,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    overflow: 'hidden',
  },
  btnPrimaryWrapper: { flex: 2, backgroundColor: `${colors.accent.green}14`, borderColor: `${colors.accent.green}60` },
  btn: { flex: 1, alignItems: 'center', paddingVertical: spacing.sm, overflow: 'hidden' },
  btnPrimary: {
    backgroundColor: colors.accentGlow.greenSoft,
    borderColor: colors.accent.green,
    shadowColor: colors.accent.green,
    elevation: 58,
  },
  btnIcon: { color: colors.content.secondary, fontSize: typography.size.xl2 },
  btnLabel: { color: colors.content.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  btnIconPrimary: { color: colors.accent.green },
  btnLabelPrimary: { color: colors.accent.green },
});

// ── COMPONENT: WaterTrackerCard ─────────────────────────────────────────────────────────────────────────────
const AddWaterButton = React.memo(({ ml, onAdd }: { ml: number; onAdd: (ml: number) => void }) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();
  return (
    <Animated.View key={ml} style={[waterTrackerStyles.addBtnWrapper, { transform: [{ scale: pressScale }] }]}>
      <TouchableOpacity activeOpacity={1} onPress={() => onAdd(ml)} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View style={waterTrackerStyles.addBtn}>
          <Text style={waterTrackerStyles.addBtnText}>+ {ml}ml</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
});

AddWaterButton.displayName = 'AddWaterButton';
export { AddWaterButton };

interface WaterTrackerCardProps {
  waterMl: number;
  targetMl: number;
  onAdd: (ml: number) => void;
}

const WaterTrackerCard = React.memo(({ waterMl, targetMl, onAdd }: WaterTrackerCardProps) => {
  const fillAnim = useRef(new Animated.Value(0)).current;
  const pct = Math.min(1, waterMl / targetMl);

  useEffect(() => {
    Animated.spring(fillAnim, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
  }, [waterMl]);

  return (
    <View style={waterTrackerStyles.card}>
      {/* prettier-ignore */}
      <MacroTrackerBar icon={<Ionicons name="water" color={colors.accent.teal} size={24} />} label={'Water'} value={Number((waterMl / 1000).toFixed(2))} 
        maxValue={Number((targetMl / 1000).toFixed(2))} unit='L' color={colors.accent.teal} isLastMacroRow={false} />

      <View style={waterTrackerStyles.btnsContainer}>
        {[250, 500].map(ml => (
          <AddWaterButton key={ml} ml={ml} onAdd={() => onAdd(ml)} />
        ))}
      </View>
    </View>
  );
});

WaterTrackerCard.displayName = 'WaterTrackerCard';
export { WaterTrackerCard };

const waterTrackerStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
  },

  addBtnWrapper: {
    flex: 1,
    minWidth: 0,
    borderWidth: 2,
    borderRadius: rounded.lg,
    backgroundColor: `${colors.accent.teal}14`,
    borderColor: `${colors.accent.teal}60`,
    overflow: 'hidden',
  },
  addBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.accentGlow.tealSoft,
    borderColor: colors.accent.teal,
    shadowColor: colors.accent.teal,
    elevation: 52,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    overflow: 'hidden',
  },

  btnsContainer: { flexDirection: 'row', gap: spacing['2.5'], flexShrink: 1 },

  addBtnText: { textAlign: 'center', color: colors.accent.teal, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
});

// ── COMPONENT: MealAccordionItem ─────────────────────────────────────────────────────────────────────────────
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

const MealAccordionItem = React.memo(({ meal, onAddFood, onDeleteFood }: MealAccordionItemProps) => {
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
        <View style={[mealAccordionStyles.iconBox, { backgroundColor: colors.surface.glass, borderColor: colors.border.default }]}>
          <Text style={mealAccordionStyles.icon}>{meal.icon}</Text>
        </View>

        <View style={globalStyles.flex_1}>
          <View style={mealAccordionStyles.titleRow}>
            <Text style={mealAccordionStyles.mealLabel}>{meal.label}</Text>
            <Text style={[mealAccordionStyles.mealCal, isEmpty && { color: colors.content.secondary }]}>
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
            { transform: [{ rotate: rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] }) }] },
          ]}
        >
          <Ionicons name="chevron-down-sharp" color={colors.content.tertiary} size={18} />
        </Animated.Text>
      </Pressable>

      <Animated.View style={{ maxHeight: heightAnim.interpolate({ inputRange: [0, 1], outputRange: [0, maxHeight] }) }}>
        <View style={mealAccordionStyles.body}>
          {meal.foodLogs.map((item, i) => (
            <View key={item.id} style={[mealAccordionStyles.itemRow, i < meal.foodLogs.length - 1 && mealAccordionStyles.itemBorder]}>
              <View style={mealAccordionStyles.itemWrapper}>
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
                  Alert.alert('Remove Food', `Remove "${item.foodItem.name}" from ${meal.label}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => onDeleteFood(item.id) },
                  ])
                }
              >
                <MaterialCommunityIcons name="delete" color={colors.accent.red} size={24} />
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
});

MealAccordionItem.displayName = 'MealAccordionItem';
export { MealAccordionItem };

const mealAccordionStyles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    marginBottom: spacing['2.5'],
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm },
  icon: { fontSize: typography.size.lg },
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderRadius: rounded.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mealLabel: { color: colors.content.secondary, fontSize: typography.size.md, fontWeight: typography.weight.extrabold },
  mealCal: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.extrabold },
  mealSub: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, marginTop: spacing['0.5'] },
  chevron: { color: colors.content.tertiary, fontSize: typography.size.xs },

  body: { borderTopWidth: 1, borderTopColor: colors.border.default, padding: spacing.sm, paddingTop: spacing['2.5'], overflow: 'hidden' },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  itemWrapper: { ...globalStyles.flex_1 },
  itemName: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  itemMacros: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, marginTop: spacing['0.5'] },
  calBadge: {
    borderWidth: 1,
    borderRadius: rounded.md,
    borderColor: colors.accentGlow.green,
    backgroundColor: colors.accentGlow.greenSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs1,
  },
  calBadgeText: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.extrabold },

  addBtn: { borderWidth: 1, borderRadius: rounded.lg, borderColor: colors.border.default, backgroundColor: colors.surface.glass,
    alignItems: 'center', marginTop: spacing.xs, paddingVertical: spacing.md }, // prettier-ignore
  addBtnText: { color: colors.accent.green, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  deleteBtn: { padding: spacing['1.5'], marginLeft: spacing['1.5'], alignItems: 'center', justifyContent: 'center' },
});

// ── COMPONENT: MacroRingChart ─────────────────────────────────────────────────────────────────────────────
interface MacroRingProps {
  size: number;
  strokeWidth: number;
  calories: number;
  calorieTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const MacroRingChart = React.memo<MacroRingProps>(({ size, strokeWidth, calories, calorieTarget, proteinG, carbsG, fatG }) => {
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
        <Text style={macroRingStyles.centreValue}>{calories} kcal</Text>
        <Text style={macroRingStyles.centreLabel}>Calorie</Text>
      </View>
    </View>
  );
});

MacroRingChart.displayName = 'MacroRingChart';
export { MacroRingChart };

const macroRingStyles = StyleSheet.create({
  ringWrap: { position: 'relative', width: 128, height: 128 },
  centreOverlay: { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  centreValue: { color: colors.accent.green, fontSize: typography.size.xl2, fontWeight: typography.weight.black, 
    lineHeight: typography.height.base }, // prettier-ignore
  centreLabel: { color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.bold },
});

// ── COMPONENT: MacroTrackerBar ─────────────────────────────────────────────────────────────────────────────
interface MacroBarProps {
  icon?: React.ReactNode;
  label: string;
  value: number;
  maxValue: number;
  unit?: string;
  color: string;
  isLastMacroRow?: boolean;
  showValueBadge?: boolean;
}

const MacroTrackerBar = React.memo<MacroBarProps>(
  ({ icon, label, value, unit = 'g', color, maxValue, isLastMacroRow = false, showValueBadge = false }) => {
    const fillAnim = useRef(new Animated.Value(0)).current;
    const pct = Math.min(1, value / maxValue);

    useEffect(() => {
      Animated.spring(fillAnim, { toValue: pct, useNativeDriver: false, speed: 10, bounciness: 4 }).start();
    }, [value]);

    return (
      <View style={[macrobarStyles.macroRow, isLastMacroRow && macrobarStyles.macroRowBorder]}>
        {icon && (
          <View style={[macrobarStyles.iconBox, { backgroundColor: `${color}46`, borderColor: `${color}60` }]}>
            <Text style={macrobarStyles.icon}>{icon}</Text>
          </View>
        )}

        <View style={macrobarStyles.labelFillTrack}>
          <View style={macrobarStyles.labelRow}>
            <Text style={macrobarStyles.label}>{label}</Text>
            <View style={showValueBadge && [macrobarStyles.valueBadge, { backgroundColor: `${color}12`, borderColor: `${color}30` }]}>
              <Text style={[macrobarStyles.value, { color: color }]}>{`${value.toFixed(1)}${unit} / ${maxValue}${unit}`}</Text>
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
  },
);

MacroTrackerBar.displayName = 'MacroTrackerBar';
export { MacroTrackerBar };

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
  dailyWaterMl: 3200,
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
      <SafeAreaView style={globalStyles.safe}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your plan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dailyMacroTargets = profile.nutritionPlan?.dailyMacroTargets ?? DEFAULT_DAILY_MACRO_TARGETS;

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 16 ? 'Good afternoon' : 'Good evening';
  const mealType = now.getHours() < 12 ? 'breakfast' : now.getHours() < 16 ? 'lunch' : now.getHours() < 20 ? 'dinner' : 'snack';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <SafeAreaView style={globalStyles.safe}>
      {/* ── Header ── */}
      <View style={[styles.header]}>
        <View style={styles.headerLeft}>
          <Text style={styles.dateLabel}>
            {today} | <Text style={styles.greeting}>{greeting}</Text>
          </Text>

          <Text style={styles.name}>{profile.displayName || 'There'}</Text>
        </View>

        <View style={styles.headerRight}>
          {/* Streak Badge */}
          {(profile.currentStreak ?? 0) > 0 && (
            <View style={styles.streakBadge}>
              <MaterialCommunityIcons name="fire" color={colors.accent.orange} size={20} />
              <Text style={styles.streakText} numberOfLines={1}>
                {profile.currentStreak!}
              </Text>
            </View>
          )}

          <Pressable onPress={() => navigation.navigate('Profile')}>
            <LinearGradient colors={[colors.accent.green, colors.accent.purple]} style={styles.avatar}>
              <Text style={styles.avatarText}>{`${profile.displayName && profile.displayName[0]}`}</Text>
            </LinearGradient>
          </Pressable>
        </View>
      </View>

      <KeyboardAwareScrollView
        style={globalStyles.scroll}
        contentContainerStyle={globalStyles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={20}
        extraHeight={20}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} tintColor={colors.accent.green} />}
      >
        {/* ── Calorie hero card ── */}
        <View style={globalStyles.marg_b_md}>
          <CalorieHeroCard log={dailyTotals} plan={dailyMacroTargets} />
        </View>

        {/* ── Quick actions ── */}
        <View style={globalStyles.marg_b_md}>
          <QuickActionRow
            onLogFood={() => navigation.navigate('FoodSearch', { mealType: mealType })}
            onScan={() => navigation.navigate('BarcodeScanner', { mealType: mealType })}
            onWater={() => addWater(250)}
          />
        </View>

        {/* ── Water ── */}
        <View style={globalStyles.marg_b_lg}>
          <WaterTrackerCard waterMl={waterMl} targetMl={dailyMacroTargets.dailyWaterMl} onAdd={addWater} />
        </View>

        {/* ── Meals ── */}
        <View style={globalStyles.marg_b_lg}>
          <SectionLabel icon={<Ionicons name="restaurant" size={16} />}>Today's Meals</SectionLabel>
          {(Object.keys(logsByMeal) as MealType[]).map(mealType =>
            /* prettier-ignore */
            <MealAccordionItem key={`meal_accordion_${mealType}`}
              onAddFood={() => navigation.navigate('FoodSearch', { mealType })}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: typography.size.md, color: colors.content.secondary },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...globalStyles.content,
    paddingBottom: spacing.sm,
  },
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
    maxWidth: 100,
  },

  streakText: { color: colors.accent.orange, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold },

  avatar: { width: 40, height: 40, borderRadius: rounded.lg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.content.onBrand, fontSize: typography.size.xl, fontWeight: typography.weight.black, marginTop: -spacing['0.5'] }, // prettier-ignore
});
