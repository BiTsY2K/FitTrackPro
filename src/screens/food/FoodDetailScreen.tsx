import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useProfile } from '@/hooks/useProfile';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { FoodItem, MealType } from '@/types/food.types';

const MEAL_OPTIONS: { key: MealType; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { key: 'lunch', label: 'Lunch', icon: '🌤️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
];

// ── Screen ───────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'FoodDetail'>;
type RouteParams = { food: FoodItem; mealType: MealType };

export const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { food, mealType: initialMealType } = route.params as RouteParams;

  // Profile needed so streak update fires on add //
  const { profile } = useProfile();

  const [servings, setServings] = useState(1);
  const [servingsText, setServingsText] = useState('1');
  const [mealType, setMealType] = useState<MealType>(initialMealType);

  const { addFood, isAdding } = useFoodLog(new Date(), profile);

  // ── Computed nutrition (scaled by servings) ── //
  const scaled = {
    calories: Math.round(food.nutrition.calories * servings),
    protein: Math.round(food.nutrition.proteinGrams * servings * 10) / 10,
    carbs: Math.round(food.nutrition.carbsGrams * servings * 10) / 10,
    fat: Math.round(food.nutrition.fatGrams * servings * 10) / 10,
    fiber: food.nutrition.fiberGrams != null ? Math.round(food.nutrition.fiberGrams * servings * 10) / 10 : null,
    sugar: food.nutrition.sugarGrams != null ? Math.round(food.nutrition.sugarGrams * servings * 10) / 10 : null,
    sodium: food.nutrition.sodiumMg != null ? Math.round(food.nutrition.sodiumMg * servings) : null,
  };

  // ── Trust badge ── //
  const getTrustBadge = () => {
    if (food.trustScore >= 95) return { icon: 'shield-checkmark', color: Colors.success, text: 'USDA Verified' };
    if (food.trustScore >= 80) return { icon: 'checkmark-circle', color: Colors.info, text: 'Brand Verified' };
    return { icon: 'information-circle', color: Colors.warning, text: 'Community' };
  };
  const badge = getTrustBadge();

  // ── Serving handlers ── //
  const adjustServings = (delta: number) => {
    const next = Math.max(0.25, parseFloat((servings + delta).toFixed(2)));
    setServings(next);
    setServingsText(String(next));
  };

  const handleServingsChange = (text: string) => {
    setServingsText(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed > 0) setServings(parsed);
  };

  const handleServingsBlur = () => {
    const parsed = parseFloat(servingsText);
    if (isNaN(parsed) || parsed <= 0) {
      setServings(1);
      setServingsText('1');
    } else {
      setServings(parsed);
      setServingsText(String(parsed));
    }
  };

  // ── Add to log ── //
  const handleAddToLog = async () => {
    try {
      await addFood({ foodItem: food, servings, mealType });
      navigation.navigate('Tabs'); // Return to tab navigator
    } catch {
      Alert.alert('Error', 'Failed to add food. Please try again.');
    }
  };

  const selectedMealLabel = MEAL_OPTIONS.find(m => m.key === mealType)?.label ?? 'Meal';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Food Details
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Food Identity */}
        <View style={styles.identityCard}>
          <View style={styles.identityTop}>
            <View style={styles.identityText}>
              <Text style={styles.foodName}>{food.name}</Text>
              {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
            </View>
            <View style={[styles.trustBadge, { backgroundColor: badge.color + '20' }]}>
              <Ionicons name={badge.icon as keyof typeof Ionicons.glyphMap} size={14} color={badge.color} />
              <Text style={[styles.trustBadgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          </View>

          <Text style={styles.servingBaseLabel}>
            per {food.servingSize.description || `${food.servingSize.amount}${food.servingSize.unit}`}
          </Text>
        </View>

        {/* Serving Size Control */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Serving Size</Text>
          <View style={styles.servingControl}>
            <Pressable style={styles.servingBtn} onPress={() => adjustServings(-0.5)} hitSlop={8}>
              <Ionicons name="remove" size={22} color={Colors.primary[400]} />
            </Pressable>

            <View style={styles.servingInputWrapper}>
              <TextInput
                style={styles.servingInput}
                value={servingsText}
                onChangeText={handleServingsChange}
                onBlur={handleServingsBlur}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <Text style={styles.servingUnit}>servings</Text>
            </View>

            <Pressable style={styles.servingBtn} onPress={() => adjustServings(0.5)} hitSlop={8}>
              <Ionicons name="add" size={22} color={Colors.primary[400]} />
            </Pressable>
          </View>

          {/* Quick serving presets */}
          <View style={styles.presets}>
            {[0.5, 1, 1.5, 2].map(preset => (
              <Pressable
                key={preset}
                style={[styles.preset, servings === preset && styles.presetActive]}
                onPress={() => {
                  setServings(preset);
                  setServingsText(String(preset));
                }}
              >
                <Text style={[styles.presetText, servings === preset && styles.presetTextActive]}>{preset}x</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Meal Type Selector */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Meal</Text>
          <View style={styles.mealOptions}>
            {MEAL_OPTIONS.map(option => (
              <Pressable
                key={option.key}
                style={[styles.mealOption, mealType === option.key && styles.mealOptionActive]}
                onPress={() => setMealType(option.key)}
              >
                <Text style={styles.mealOptionIcon}>{option.icon}</Text>
                <Text style={[styles.mealOptionText, mealType === option.key && styles.mealOptionTextActive]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Calories — prominent display */}
        <View style={styles.calorieCard}>
          <Text style={styles.calorieValue}>{scaled.calories}</Text>
          <Text style={styles.calorieUnit}>kcal</Text>
        </View>

        {/* Full nutrition breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Nutrition</Text>

          <MacroRow label="Protein" value={scaled.protein} unit="g" color={Colors.error} />
          <MacroRow label="Carbohydrates" value={scaled.carbs} unit="g" color={Colors.warning} />
          <MacroRow label="Fat" value={scaled.fat} unit="g" color={Colors.info} />

          {scaled.fiber != null && <MacroRow label="Fiber" value={scaled.fiber} unit="g" color={Colors.success} dimmed />}
          {scaled.sugar != null && <MacroRow label="Sugar" value={scaled.sugar} unit="g" color={Colors.warning} dimmed />}
          {scaled.sodium != null && <MacroRow label="Sodium" value={scaled.sodium} unit="mg" color={Colors.gray[400]} dimmed />}
        </View>

        {/* CTA */}
        <Pressable
          style={({ pressed }) => [styles.addButton, pressed && styles.addButtonPressed, isAdding && styles.addButtonLoading]}
          onPress={handleAddToLog}
          disabled={isAdding}
        >
          {isAdding ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="add-circle" size={22} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add to {selectedMealLabel}</Text>
            </>
          )}
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const MacroRow: React.FC<{
  label: string;
  value: number;
  unit: string;
  color: string;
  dimmed?: boolean;
}> = ({ label, value, unit, color, dimmed = false }) => (
  <View style={macroStyles.row}>
    <View style={[macroStyles.dot, { backgroundColor: dimmed ? Colors.gray[300] : color }]} />
    <Text style={[macroStyles.label, dimmed && macroStyles.labelDimmed]}>{label}</Text>
    <Text style={[macroStyles.value, dimmed && macroStyles.valueDimmed]}>
      {value}
      {unit}
    </Text>
  </View>
);

const macroStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
  },
  labelDimmed: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  value: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  valueDimmed: {
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.regular,
    fontSize: Typography.fontSize.sm,
  },
});

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: { padding: Spacing.xs },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  headerSpacer: { width: 32 }, // mirrors backButton to keep title centered

  container: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // ── Identity ── //
  identityCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  identityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  identityText: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  foodName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  foodBrand: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  servingBaseLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  trustBadgeText: {
    marginLeft: 4,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },

  // ── Shared card ── //
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },

  // ── Serving control ── //
  servingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  servingBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.primary[200],
  },
  servingInputWrapper: { alignItems: 'center' },
  servingInput: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    minWidth: 80,
  },
  servingUnit: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  presets: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  preset: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
  },
  presetActive: {
    backgroundColor: Colors.primary[100],
    borderWidth: 1,
    borderColor: Colors.primary[300],
  },
  presetText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  presetTextActive: {
    color: Colors.primary[500],
    fontWeight: Typography.fontWeight.semibold,
  },

  // ── Meal selector ── //
  mealOptions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  mealOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[100],
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealOptionActive: {
    backgroundColor: Colors.primary[50],
    borderColor: Colors.primary[300],
  },
  mealOptionIcon: { fontSize: 18, marginBottom: 4 },
  mealOptionText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  mealOptionTextActive: {
    color: Colors.primary[600],
    fontWeight: Typography.fontWeight.semibold,
  },

  // ── Calorie display ── //
  calorieCard: {
    backgroundColor: Colors.primary[400],
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  calorieValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
  },
  calorieUnit: {
    fontSize: Typography.fontSize.lg,
    color: 'rgba(255,255,255,0.8)',
    alignSelf: 'flex-end',
    marginBottom: 4,
  },

  // ── Add button ── //
  addButton: {
    backgroundColor: Colors.primary[400],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addButtonLoading: { opacity: 0.7 },
  addButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

// ── FoodDetailScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
// type FDProps = NativeStackScreenProps<MainStackParamList, 'FoodDetail'>;

// export const FoodDetailScreen: React.FC<FDProps> = ({ navigation, route }) => {
//   const { food, mealType = 'lunch' } = route.params;
//   const plan = DEFAULT_PLAN;
//   const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

//   const [qty, setQty] = useState(1);
//   const [unit, setUnit] = useState<'serving' | '100g' | 'oz'>('serving');
//   const [added, setAdded] = useState(false);

//   const headerFade = useRef(new Animated.Value(0)).current;
//   const addScale = useRef(new Animated.Value(1)).current;
//   const addedScale = useRef(new Animated.Value(0)).current;

//   useEffect(() => {
//     Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
//   }, []);

//   const cal = Math.round(food.nutrition.calories * qty);
//   const p = Math.round(food.nutrition.proteinGrams * qty * 10) / 10;
//   const c = Math.round(food.nutrition.carbsGrams * qty * 10) / 10;
//   const f = Math.round(food.nutrition.fatGrams * qty * 10) / 10;

//   const handleAdd = () => {
//     Animated.sequence([
//       Animated.spring(addScale, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
//       Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
//     ]).start();
//     setAdded(true);
//     Animated.spring(addedScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();
//     setTimeout(() => navigation.goBack(), 1200);
//   };

//   const adjustQty = (delta: number) => {
//     setQty(q => Math.max(0.5, parseFloat((q + delta).toFixed(1))));
//   };

//   const macros = [
//     { icon: '🥩', label: 'Protein', rawValue: p, max: plan.dailyProteinGrams, color: colors.accent.blue },
//     { icon: '🌾', label: 'Carbs', rawValue: c, max: plan.dailyCarbsGrams, color: colors.accent.orange },
//     { icon: '🫒', label: 'Fat', rawValue: f, max: plan.dailyFatGrams, color: colors.accent.purple },
//   ];

//   const nutrients = [
//     { label: 'Calories', value: cal, unit: 'kcal', color: colors.accent.green, daily: plan.dailyCalorieTarget },
//     { label: 'Protein', value: p, unit: 'g', color: colors.accent.blue, daily: plan.dailyProteinGrams },
//     { label: 'Carbs', value: c, unit: 'g', color: colors.accent.orange, daily: plan.dailyCarbsGrams },
//     { label: 'Fat', value: f, unit: 'g', color: colors.accent.purple, daily: plan.dailyFatGrams },
//   ];

//   return (
//     <SafeAreaView style={globalStyles.safe}>
//       <Animated.View style={[fdS.navHeader, { opacity: headerFade }]}>
//         {/* Header */}
//         <View style={fdS.navRow}>
//           <TouchableOpacity style={globalStyles.backBtn} onPress={() => navigation.goBack()}>
//             <View style={globalStyles.backCircle}>
//               <Text style={globalStyles.backArrow}>←</Text>
//               <Text style={globalStyles.backText}>Back</Text>
//             </View>
//           </TouchableOpacity>

//           <View style={[globalStyles.flex_1, globalStyles.alignItemsStart]}>
//             <Text style={fdS.navSub}>
//               Adding to <Text style={fdS.navMeal}>{mealLabel}</Text>
//             </Text>
//           </View>

//           <TouchableOpacity style={fdS.favouriteBtn}>
//             <MaterialCommunityIcons name="heart" color={colors.content.tertiary} size={24} />
//           </TouchableOpacity>
//         </View>

//         <View style={fdS.titleRow}>
//           <View style={fdS.titleRowContent}>
//             <Text style={fdS.foodName} numberOfLines={2}>
//               {food.name}
//             </Text>
//             {food.brand && <Text style={fdS.foodBrand}>{food.brand}</Text>}
//           </View>
//           <TrustBadge score={food.trustScore} />
//         </View>
//       </Animated.View>

//       <KeyboardAwareScrollView
//         style={globalStyles.scroll}
//         contentContainerStyle={globalStyles.content}
//         showsVerticalScrollIndicator={false}
//         keyboardShouldPersistTaps="handled"
//         enableOnAndroid={true}
//         enableAutomaticScroll={true}
//         extraScrollHeight={20}
//         extraHeight={20}
//       >
//         {/* ── Calorie hero ── */}
//         <View style={fdS.heroCard}>
//           {/* prettier-ignore */}
//           <MacroRingChart size={178} strokeWidth={10} calories={cal} calorieTarget={plan.dailyCalorieTarget}
//             proteinG={p} carbsG={c} fatG={f} />

//           <View style={fdS.nutritionalValueContainer}>
//             <SectionLabel children="Nutritional Value" styleContainerView={fdS.nutritionalValue} />
//             {macros.map((macro, i) => (
//               <Fragment key={`macro_${macro.label}`}>
//                 {/* prettier-ignore */}
//                 <MacroTrackerBar icon={macro.icon} label={macro.label} value={macro.rawValue} maxValue={macro.max}
//                   color={macro.color} isLastMacroRow= {i < macros.length - 1} />
//               </Fragment>
//             ))}
//           </View>
//         </View>

//         {/* ── Serving size ── */}
//         <SectionLabel icon="🥄">Serving Size</SectionLabel>
//         <View style={fdS.servingCard}>
//           <Text style={fdS.servingBase}>
//             1 serving = {food.servingSize?.description || `${food.servingSize?.amount}${food.servingSize?.unit}`}
//           </Text>
//           {/* Qty stepper */}
//           <View style={fdS.stepperRow}>
//             <Text style={fdS.stepperLabel}>Quantity</Text>
//             <View style={fdS.stepper}>
//               <TouchableOpacity onPress={() => adjustQty(-0.5)} style={fdS.stepperBtn} activeOpacity={0.8}>
//                 <Text style={fdS.stepperBtnText}>−</Text>
//               </TouchableOpacity>
//               <Text style={fdS.stepperVal}>{qty}</Text>
//               <TouchableOpacity onPress={() => adjustQty(0.5)} style={fdS.stepperBtn} activeOpacity={0.8}>
//                 <Text style={fdS.stepperBtnText}>+</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//           {/* Unit pills */}
//           <View style={fdS.unitRow}>
//             {(['serving', '100g', 'oz'] as const).map(u => (
//               <TouchableOpacity
//                 key={u}
//                 onPress={() => setUnit(u)}
//                 style={[fdS.unitPill, unit === u && fdS.unitPillActive]}
//                 activeOpacity={0.8}
//               >
//                 <Text style={[fdS.unitPillText, unit === u && fdS.unitPillTextActive]}>{u}</Text>
//               </TouchableOpacity>
//             ))}
//           </View>
//         </View>

//         {/* ── Full nutrition table ── */}
//         <SectionLabel icon="🔬">Full Nutrition</SectionLabel>
//         <View style={fdS.nutriTable}>
//           {nutrients.map((n, i) => (
//             <View key={i} style={[fdS.nutriRow, i < nutrients.length - 1 && fdS.nutriBorder]}>
//               <View style={{ flex: 1 }}>
//                 <Text style={fdS.nutriLabel}>{n.label}</Text>
//                 <View style={fdS.nutriTrack}>
//                   <View
//                     style={[
//                       fdS.nutriFill,
//                       {
//                         width: `${Math.min(100, (n.value / n.daily) * 100)}%`,
//                         backgroundColor: n.color,
//                       },
//                     ]}
//                   />
//                 </View>
//               </View>
//               <View style={fdS.nutriValWrap}>
//                 <Text style={[fdS.nutriVal, { color: n.color }]}>{n.value}</Text>
//                 <Text style={[fdS.nutriUnit, { color: n.color }]}>{n.unit}</Text>
//               </View>
//             </View>
//           ))}
//         </View>

//         {/* Footnote */}
//         <View style={fdS.footnote}>
//           <Text style={{ fontSize: 14 }}>💡</Text>
//           <Text style={fdS.footnoteText}>
//             Values based on{' '}
//             <Text style={{ color: COLORS.text, fontWeight: '700' }}>
//               {qty} serving{qty > 1 ? 's' : ''}
//             </Text>
//             . Bars show % of your daily target.
//           </Text>
//         </View>

//         <View style={{ height: 100 }} />
//       </KeyboardAwareScrollView>

//       {/* ── Sticky CTA ── */}
//       <View style={fdS.ctaWrap}>
//         {added ? (
//           <Animated.View style={[fdS.addedBanner, { transform: [{ scale: addedScale }] }]}>
//             <Text style={fdS.addedText}>✓ Added to {mealLabel}!</Text>
//           </Animated.View>
//         ) : (
//           <Animated.View style={{ transform: [{ scale: addScale }] }}>
//             <TouchableOpacity onPress={handleAdd} activeOpacity={1} style={fdS.addBtn}>
//               <LinearGradient
//                 colors={[COLORS.accent, COLORS.accentDim]}
//                 start={{ x: 0, y: 0 }}
//                 end={{ x: 1, y: 0 }}
//                 style={fdS.addBtnGradient}
//               >
//                 <Text style={fdS.addBtnText}>
//                   Add {qty > 1 ? `×${qty} ` : ''}to {mealLabel}
//                 </Text>
//                 <Text style={fdS.addBtnIcon}>+</Text>
//               </LinearGradient>
//             </TouchableOpacity>
//           </Animated.View>
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const fdS = StyleSheet.create({
//   navHeader: {
//     borderBottomWidth: 1,
//     borderBottomColor: colors.border.default,
//     paddingHorizontal: globalStyles.content.paddingHorizontal,
//     paddingBottom: spacing.sm,
//     paddingTop: globalStyles.content.paddingTop,
//     overflow: 'hidden',
//     position: 'relative',
//   },

//   navRow: { ...globalStyles.navRow, columnGap: spacing.lg, marginBottom: spacing.sm },
//   navSub: { color: colors.content.secondary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
//   navMeal: { color: colors.accent.green, fontSize: 18, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },

//   favouriteBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 36,
//     height: 36,
//     borderWidth: 1,
//     borderRadius: rounded.lg,
//     borderColor: colors.border.default,
//     backgroundColor: colors.surface.glass,
//   },
//   titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
//   titleRowContent: { flex: 1, marginRight: spacing.xs },

//   foodName: {
//     color: colors.content.secondary,
//     fontSize: typography.size.xl,
//     fontWeight: typography.weight.black,
//     letterSpacing: -0.4,
//     marginBottom: spacing[1],
//   },
//   foodBrand: { color: colors.content.tertiary, fontSize: typography.size.xs },
//   heroCard: {
//     borderWidth: 1,
//     borderRadius: rounded.xl,
//     borderColor: colors.border.default,
//     backgroundColor: colors.surface.raised,
//     padding: 16,
//     marginBottom: 16,
//   },

//   nutritionalValueContainer: { marginTop: 16, marginBottom: 0 },
//   nutritionalValue: { marginBottom: 0 },

//   servingCard: {
//     backgroundColor: COLORS.bgCard,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 16,
//     marginBottom: 16,
//   },
//   servingBase: { color: COLORS.textMuted, fontSize: 11, marginBottom: 12 },
//   stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
//   stepperLabel: { color: COLORS.text, fontSize: 13, fontWeight: '700' },
//   stepper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: COLORS.bg,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     overflow: 'hidden',
//   },
//   stepperBtn: { paddingHorizontal: 16, paddingVertical: 9 },
//   stepperBtnText: { color: COLORS.text, fontSize: 18, fontWeight: '700' },
//   stepperVal: { color: COLORS.accent, fontSize: 16, fontWeight: '900', minWidth: 32, textAlign: 'center' },
//   unitRow: { flexDirection: 'row', gap: 8 },
//   unitPill: {
//     flex: 1,
//     paddingVertical: 9,
//     borderRadius: 10,
//     backgroundColor: COLORS.glass,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     alignItems: 'center',
//   },
//   unitPillActive: { backgroundColor: COLORS.accentGlow, borderColor: 'rgba(0,255,135,0.3)' },
//   unitPillText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
//   unitPillTextActive: { color: COLORS.accent, fontWeight: '800' },
//   nutriTable: {
//     backgroundColor: COLORS.bgCard,
//     borderRadius: 18,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     paddingHorizontal: 16,
//     marginBottom: 14,
//   },
//   nutriRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
//   nutriBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
//   nutriLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 5 },
//   nutriTrack: { height: 3, borderRadius: 2, backgroundColor: COLORS.border, overflow: 'hidden' },
//   nutriFill: { height: '100%', borderRadius: 2 },
//   nutriValWrap: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 2, flexShrink: 0, minWidth: '20%' },
//   nutriVal: { fontSize: 18, fontWeight: '900' },
//   nutriUnit: { fontSize: 10, fontWeight: '700' },
//   footnote: {
//     flexDirection: 'row',
//     alignItems: 'flex-start',
//     gap: 10,
//     backgroundColor: COLORS.bgCard2,
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: COLORS.border,
//     padding: 12,
//     marginBottom: 16,
//   },
//   footnoteText: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17, flex: 1 },
//   ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
//   addBtn: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     shadowColor: COLORS.accent,
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.4,
//     shadowRadius: 20,
//     elevation: 12,
//   },
//   addBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 8 },
//   addBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
//   addBtnIcon: { color: COLORS.bg, fontSize: 20, fontWeight: '900' },
//   addedBanner: {
//     paddingVertical: 16,
//     borderRadius: 16,
//     alignItems: 'center',
//     backgroundColor: COLORS.accentGlow,
//     borderWidth: 1,
//     borderColor: 'rgba(0,255,135,0.3)',
//   },
//   addedText: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
// });
