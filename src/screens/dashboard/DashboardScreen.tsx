import { Ionicons } from '@expo/vector-icons';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { BorderRadius, COLORS, Colors, Spacing, Typography } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useProfile } from '@/hooks/useProfile';
import { BottomTabParamList, MainStackParamList } from '@/navigation/MainNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import { FoodLog, MealType } from '@/types/food.types';

// ── Constants ─────────────────────────────────────────────────────────────────

const MEAL_CONFIG: { key: MealType; label: string; icon: string; color: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '☀️', color: Colors.warning },
  { key: 'lunch', label: 'Lunch', icon: '🌤️', color: Colors.primary[400] },
  { key: 'dinner', label: 'Dinner', icon: '🌙', color: Colors.info },
  { key: 'snack', label: 'Snack', icon: '🍎', color: Colors.success },
];

const RING_RADIUS = 85;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// ── DashboardScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = CompositeScreenProps<BottomTabScreenProps<BottomTabParamList, 'Dashboard'>, NativeStackScreenProps<MainStackParamList>>;

export const DashboardScreen: React.FC<Props> = ({ navigation }) => {
  const { profile, isLoading: profileLoading, refetch: refetchProfile } = useProfile();

  const { dailyTotals, logsByMeal, isLoading: logsLoading, refetch: refetchLogs } = useFoodLog(new Date(), profile);

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

  // ── Derived values ── //
  const caloriesRemaining = Math.max(0, profile.dailyCalorieTarget - dailyTotals.calories);
  const caloriesPercentage = Math.min(1, dailyTotals.calories / profile.dailyCalorieTarget);
  const strokeOffset = RING_CIRCUMFERENCE * (1 - caloriesPercentage);

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
        {/* Header */}
        {/* <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello!</Text>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{profile.displayName || 'There'}</Text>
              {(profile.currentStreak ?? 0) > 0 && <StreakBadge streak={profile.currentStreak!} />}
            </View>
          </View>
          <Pressable onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatarSmall}>
              <Ionicons name="person" size={24} color={Colors.primary[400]} />
            </View>
          </Pressable>
        </View> */}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{greeting} 👋</Text>
            <Text style={styles.name}>{profile.displayName || 'There'}</Text>
            <Text style={styles.dateLabel}>{today}</Text>
          </View>

          <View style={styles.headerRight}>
            {
              <View style={styles.streakBadge}>
                <Text style={styles.streakIcon}>🔥</Text>
                <Text style={styles.streakText}>{10}</Text>
              </View>
            }

            <Pressable onPress={() => navigation.navigate('Profile')}>
              <LinearGradient colors={[COLORS.accent, COLORS.purple]} style={styles.avatar}>
                <Text style={styles.avatarText}>{`${profile.displayName && profile.displayName[0]}`}</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* Calorie Ring */}
        <View style={styles.calorieCard}>
          <View style={styles.calorieRing}>
            <Svg width={200} height={200}>
              {/* Track */}
              <Circle cx={100} cy={100} r={RING_RADIUS} stroke={Colors.gray[200]} strokeWidth={12} fill="none" />
              {/* Progress */}
              <Circle
                cx={100}
                cy={100}
                r={RING_RADIUS}
                stroke={caloriesPercentage >= 1 ? Colors.error : Colors.primary[400]}
                strokeWidth={12}
                fill="none"
                strokeDasharray={RING_CIRCUMFERENCE}
                strokeDashoffset={strokeOffset}
                strokeLinecap="round"
                rotation="-90"
                origin="100, 100"
              />
            </Svg>
            <View style={styles.calorieCenter}>
              <Text style={styles.caloriesRemaining}>{caloriesRemaining}</Text>
              <Text style={styles.caloriesLabel}>kcal left</Text>
              <Text style={styles.caloriesSubtext}>
                {dailyTotals.calories} / {profile.dailyCalorieTarget}
              </Text>
            </View>
          </View>

          <View style={styles.calorieBreakdown}>
            <View style={styles.breakdownItem}>
              <Ionicons name="flame-outline" size={16} color={Colors.primary[400]} />
              <Text style={styles.breakdownText}>Goal: {profile.dailyCalorieTarget} kcal</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Ionicons name="restaurant-outline" size={16} color={Colors.success} />
              <Text style={styles.breakdownText}>Eaten: {dailyTotals.calories} kcal</Text>
            </View>
          </View>
        </View>

        {/* Macro Progress */}
        <View style={styles.macrosCard}>
          <Text style={styles.cardTitle}>Macros</Text>

          <MacroBar
            icon="nutrition"
            label="Protein"
            consumed={dailyTotals.protein}
            target={profile.dailyProteinGrams}
            unit="g"
            color={Colors.error}
          />
          <MacroBar
            icon="leaf"
            label="Carbs"
            consumed={dailyTotals.carbs}
            target={profile.dailyCarbsGrams}
            unit="g"
            color={Colors.warning}
          />
          <MacroBar icon="water" label="Fat" consumed={dailyTotals.fat} target={profile.dailyFatGrams} unit="g" color={Colors.info} />
        </View>

        {/* Meal Sections */}
        {MEAL_CONFIG.map(meal => (
          <MealSection
            key={meal.key}
            meal={meal}
            logs={logsByMeal[meal.key] || []}
            onAddPress={() => navigation.navigate('FoodSearchScreen', { mealType: meal.key })}
          />
        ))}

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionChip} onPress={() => navigation.navigate('FoodSearchScreen', { mealType: 'snack' })}>
            <Ionicons name="add-circle" size={20} color={Colors.primary[400]} />
            <Text style={styles.actionChipText}>Log Food</Text>
          </Pressable>

          <Pressable style={styles.actionChip} onPress={() => Alert.alert('Coming Soon', 'Exercise logging arrives in Phase 2!')}>
            <Ionicons name="fitness" size={20} color={Colors.success} />
            <Text style={styles.actionChipText}>Log Exercise</Text>
          </Pressable>

          <Pressable style={styles.actionChip} onPress={() => Alert.alert('Coming Soon', 'Water tracking arrives in Phase 2!')}>
            <Ionicons name="water" size={20} color={Colors.info} />
            <Text style={styles.actionChipText}>Log Water</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Macro progress bar row */
const MacroBar: React.FC<{
  icon: string;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  color: string;
}> = ({ icon, label, consumed, target, unit, color }) => {
  const percent = Math.min(1, target > 0 ? consumed / target : 0);

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Ionicons name={icon as any} size={18} color={color} />
        <Text style={styles.macroLabel}>{label}</Text>
      </View>
      <View style={styles.macroBar}>
        <View style={[styles.macroBarFill, { width: `${percent * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroValue}>
        {consumed}
        {unit} / {target}
        {unit}
      </Text>
    </View>
  );
};

/** Per-meal section with logged items and an add button */
const MealSection: React.FC<{
  meal: { key: MealType; label: string; icon: string; color: string };
  logs: FoodLog[];
  onAddPress: () => void;
}> = ({ meal, logs, onAddPress }) => {
  const mealCalories = logs.reduce((sum, l) => sum + l.totalCalories, 0);

  return (
    <View style={styles.mealCard}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealIcon}>{meal.icon}</Text>
        <Text style={styles.mealLabel}>{meal.label}</Text>
        {mealCalories > 0 && <Text style={[styles.mealCalories, { color: meal.color }]}>{mealCalories} kcal</Text>}
        <Pressable style={styles.mealAddBtn} onPress={onAddPress} hitSlop={8}>
          <Ionicons name="add" size={20} color={Colors.primary[400]} />
        </Pressable>
      </View>

      {logs.length > 0 ? (
        logs.map(log => (
          <View key={log.id} style={styles.logItem}>
            <View style={styles.logItemInfo}>
              <Text style={styles.logItemName} numberOfLines={1}>
                {log.foodItem.name}
              </Text>
              <Text style={styles.logItemMeta}>
                {log.servingsConsumed} serving{log.servingsConsumed !== 1 ? 's' : ''}
                {log.foodItem.brand ? ` · ${log.foodItem.brand}` : ''}
              </Text>
            </View>
            <Text style={styles.logItemCal}>{log.totalCalories}</Text>
          </View>
        ))
      ) : (
        <Pressable style={styles.emptyMeal} onPress={onAddPress}>
          <Ionicons name="add-circle-outline" size={16} color={Colors.gray[400]} />
          <Text style={styles.emptyMealText}>Add {meal.label.toLowerCase()}</Text>
        </Pressable>
      )}
    </View>
  );
};

/** Streak badge shown alongside the user's name */
const StreakBadge: React.FC<{ streak: number }> = ({ streak }) => (
  <View style={styles.streakBadge}>
    <Text style={styles.streakIcon}>🔥</Text>
    <Text style={styles.streakText}>{streak}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
  },

  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, marginBottom: 20 },
  greeting: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold, lineHeight: 15 },
  name: { color: colors.content.primary, fontSize: typography.size.xl2, fontWeight: typography.weight.black, lineHeight: 24 },
  dateLabel: { color: colors.content.tertiary, fontSize: typography.size.xs - 1, fontWeight: typography.weight.semibold, lineHeight: 15 },
  headerLeft: { flex: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing['2.5'] },

  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[1],
    backgroundColor: 'rgba(255,107,53,0.15)',
    borderRadius: rounded.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,107,53,0.3)',
  },

  streakNum: { color: COLORS.orange, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold },
  avatar: { width: 40, height: 40, borderRadius: rounded.lg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.content.onBrand, fontSize: typography.size.xl, fontWeight: typography.weight.black, marginTop: -spacing['0.5'] }, // prettier-ignore

  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Streak badge ── //
  // streakBadge: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   backgroundColor: Colors.warning + '20',
  //   borderRadius: BorderRadius.full,
  //   paddingHorizontal: Spacing.sm,
  //   paddingVertical: 2,
  // },
  streakIcon: { fontSize: 12 },
  streakText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning,
    marginLeft: 2,
  },

  // ── Calorie ring card ── //
  calorieCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  calorieRing: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  calorieCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesRemaining: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  caloriesLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  caloriesSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  calorieBreakdown: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  breakdownText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },

  // ── Macros card ── //
  macrosCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  macroRow: { marginBottom: Spacing.md },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  macroLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  macroBar: {
    height: 8,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.xs,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  macroValue: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },

  // ── Meal sections ── //
  mealCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  mealIcon: { fontSize: 16, marginRight: Spacing.xs },
  mealLabel: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  mealCalories: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginRight: Spacing.sm,
  },
  mealAddBtn: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  logItemInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  logItemName: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  logItemMeta: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  logItemCal: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  emptyMeal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  emptyMealText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray[400],
  },

  // ── Quick actions row ── //
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionChipText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
});
