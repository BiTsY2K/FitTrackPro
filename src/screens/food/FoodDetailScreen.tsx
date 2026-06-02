import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '@/components/common/SectionLabel';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { useFoodLog } from '@/hooks/useFoodLog';
import { useProfile } from '@/hooks/useProfile';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { colors, rounded, spacing, typography } from '@/themes';

import { MacroRingChart, MacroTrackerBar } from '../dashboard/DashboardScreen';
import { TrustBadge } from './FoodSearchScreen';

// ── FoodDetailScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'FoodDetail'>;

export const FoodDetailScreen: React.FC<Props> = ({ navigation, route }) => {
  const { food, mealType = 'lunch' } = route.params;

  //  Profile needed so streak update fires on add //
  const { profile } = useProfile();
  const { addFood } = useFoodLog(new Date(), profile);
  const plan = profile?.nutritionPlan?.dailyMacroTargets;
  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);

  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<'serving' | '100g' | 'oz'>('serving');
  const [added, setAdded] = useState(false);

  const headerFade = useRef(new Animated.Value(0)).current;
  const addScale = useRef(new Animated.Value(1)).current;
  const addedScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const cal = Math.round(food.nutrition.calories * qty);
  const p = Math.round(food.nutrition.proteinGrams * qty * 10) / 10;
  const c = Math.round(food.nutrition.carbsGrams * qty * 10) / 10;
  const f = Math.round(food.nutrition.fatGrams * qty * 10) / 10;

  const handleAdd = () => {
    Animated.sequence([
      Animated.spring(addScale, { toValue: 0.95, useNativeDriver: true, speed: 50 }),
      Animated.spring(addScale, { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
    
    // Add the food item to the daily log
    addFood({ foodItem: food, servings: qty, mealType }).catch(error => {
      console.error('Failed to add food log:', error);
    });

    setAdded(true);
    Animated.spring(addedScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 12 }).start();
    setTimeout(() => navigation.goBack(), 1200);
  };

  const adjustQty = (delta: number) => {
    setQty(q => Math.max(0.5, parseFloat((q + delta).toFixed(1))));
  };

  const macros = [
    { icon: '🥩', label: 'Protein', rawValue: p, max: plan?.dailyProteinGrams, color: colors.accent.blue },
    { icon: '🌾', label: 'Carbs', rawValue: c, max: plan?.dailyCarbsGrams, color: colors.accent.orange },
    { icon: '🫒', label: 'Fat', rawValue: f, max: plan?.dailyFatGrams, color: colors.accent.purple },
  ];

  const nutrients = [
    { label: 'Calories', value: cal, unit: 'kcal', color: colors.accent.green, daily: plan?.dailyCalorieTarget },
    { label: 'Protein', value: p, unit: 'g', color: colors.accent.blue, daily: plan?.dailyProteinGrams },
    { label: 'Carbs', value: c, unit: 'g', color: colors.accent.orange, daily: plan?.dailyCarbsGrams },
    { label: 'Fat', value: f, unit: 'g', color: colors.accent.purple, daily: plan?.dailyFatGrams },
  ];

  return (
    <SafeAreaView style={globalStyles.safe}>
      <Animated.View style={[fdS.navHeader, { opacity: headerFade }]}>
        {/* Header */}
        <View style={fdS.navRow}>
          <TouchableOpacity style={globalStyles.backBtn} onPress={() => navigation.goBack()}>
            <View style={globalStyles.backCircle}>
              <Text style={globalStyles.backArrow}>←</Text>
              <Text style={globalStyles.backText}>Back</Text>
            </View>
          </TouchableOpacity>

          <View style={[globalStyles.flex_1, globalStyles.alignItemsStart]}>
            <Text style={fdS.navSub}>
              Adding to <Text style={fdS.navMeal}>{mealLabel}</Text>
            </Text>
          </View>

          <TouchableOpacity style={fdS.favouriteBtn}>
            <MaterialCommunityIcons name="heart" color={colors.content.tertiary} size={24} />
          </TouchableOpacity>
        </View>

        <View style={fdS.titleRow}>
          <View style={fdS.titleRowContent}>
            <Text style={fdS.foodName} numberOfLines={2}>
              {food.name}
            </Text>
            {food.brand && <Text style={fdS.foodBrand}>{food.brand}</Text>}
          </View>
          <TrustBadge score={food.trustScore} />
        </View>
      </Animated.View>

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
        {/* ── Calorie hero ── */}
        <View style={fdS.heroCard}>
          {/* prettier-ignore */}
          <MacroRingChart size={178} strokeWidth={10} calories={cal} calorieTarget={plan?.dailyCalorieTarget || NaN}
            proteinG={p} carbsG={c} fatG={f} />

          <View style={fdS.nutritionalValueContainer}>
            <SectionLabel children="Nutritional Value" styleContainerView={fdS.nutritionalValue} />
            {macros.map((macro, i) => (
              <Fragment key={`macro_${macro.label}`}>
                {/* prettier-ignore */}
                <MacroTrackerBar icon={macro.icon} label={macro.label} value={macro.rawValue} maxValue={macro.max || NaN}
                  color={macro.color} isLastMacroRow= {i < macros.length - 1} />
              </Fragment>
            ))}
          </View>
        </View>

        {/* ── Serving size ── */}
        <SectionLabel icon="🥄">Serving Size</SectionLabel>
        <View style={fdS.servingCard}>
          {/* Qty stepper */}
          <View style={fdS.stepperRow}>
            <View>
              <Text style={fdS.stepperLabel}>Quantity</Text>
              <Text style={fdS.servingBase}>
                1 serving = {food.servingSize?.description || `${food.servingSize?.amount}${food.servingSize?.unit}`}
              </Text>
            </View>
            <View style={fdS.stepper}>
              <TouchableOpacity onPress={() => adjustQty(-0.5)} style={fdS.stepperButton} activeOpacity={0.8}>
                <Text style={fdS.stepperButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={fdS.stepperValue}>{qty}</Text>
              <TouchableOpacity onPress={() => adjustQty(0.5)} style={fdS.stepperButton} activeOpacity={0.8}>
                <Text style={fdS.stepperButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          {/* Unit pills */}
          <View style={fdS.unitRow}>
            {(['serving', '100g', 'oz'] as const).map(u => (
              <TouchableOpacity
                key={u}
                onPress={() => setUnit(u)}
                style={[fdS.unitPill, unit === u && fdS.unitPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[fdS.unitPillText, unit === u && fdS.unitPillTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Full nutrition table ── */}
        <SectionLabel icon="🔬">Full Nutrition</SectionLabel>
        <View style={fdS.nutriTable}>
          {nutrients.map((n, i) => (
            <View key={i} style={[fdS.nutriRow, i < nutrients.length - 1 && fdS.nutriBorder]}>
              <View style={{ flex: 1 }}>
                <Text style={fdS.nutriLabel}>{n.label}</Text>
                <View style={fdS.nutriTrack}>
                  <View
                    style={[
                      fdS.nutriFill,
                      {
                        width: `${Math.min(100, (n.value / (n?.daily || NaN)) * 100)}%`,
                        backgroundColor: n.color,
                      },
                    ]}
                  />
                </View>
              </View>
              <View style={fdS.nutriValWrap}>
                <Text style={[fdS.nutriVal, { color: n.color }]}>{n.value}</Text>
                <Text style={[fdS.nutriUnit, { color: n.color }]}>{n.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Footnote */}
        <View style={fdS.footnote}>
          <Text style={{ fontSize: 14 }}>💡</Text>
          <Text style={fdS.footnoteText}>
            Values based on{' '}
            <Text style={{ color: COLORS.text, fontWeight: '700' }}>
              {qty} serving{qty > 1 ? 's' : ''}
            </Text>
            . Bars show % of your daily target.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </KeyboardAwareScrollView>

      {/* ── Sticky CTA ── */}
      <View style={fdS.ctaWrap}>
        {added ? (
          <Animated.View style={[fdS.addedBanner, { transform: [{ scale: addedScale }] }]}>
            <Text style={fdS.addedText}>✓ Added to {mealLabel}!</Text>
          </Animated.View>
        ) : (
          <Animated.View style={{ transform: [{ scale: addScale }] }}>
            <TouchableOpacity onPress={handleAdd} activeOpacity={1} style={fdS.addBtn}>
              <LinearGradient
                colors={[COLORS.accent, COLORS.accentDim]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={fdS.addBtnGradient}
              >
                <Text style={fdS.addBtnText}>
                  Add {qty > 1 ? `x${qty} ` : ''}to {mealLabel}
                </Text>
                <Text style={fdS.addBtnIcon}>+</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};

const fdS = StyleSheet.create({
  navHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
    paddingHorizontal: globalStyles.content.paddingHorizontal,
    paddingBottom: spacing.sm,
    paddingTop: globalStyles.content.paddingTop,
    overflow: 'hidden',
    position: 'relative',
  },

  navRow: { ...globalStyles.navRow, columnGap: spacing.lg, marginBottom: spacing.sm },
  navSub: { color: colors.content.secondary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  navMeal: { color: colors.accent.green, fontSize: 18, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },

  favouriteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  titleRowContent: { flex: 1, marginRight: spacing.xs },

  foodName: {
    color: colors.content.secondary,
    fontSize: typography.size.xl,
    fontWeight: typography.weight.black,
    letterSpacing: -0.4,
    marginBottom: spacing[1],
  },
  foodBrand: { color: colors.content.tertiary, fontSize: typography.size.xs },
  heroCard: {
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: 16,
    marginBottom: 16,
  },

  nutritionalValueContainer: { marginTop: 16, marginBottom: 0 },
  nutritionalValue: { marginBottom: 0 },

  servingCard: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
  },
  servingBase: { color: colors.content.tertiary, fontSize: typography.size.xs },
  stepperRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  stepperLabel: { color: colors.content.secondary, fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  stepper: {
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.page,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  stepperButton: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
  stepperButtonText: { color: colors.content.primary, fontSize: typography.size.xl2, fontWeight: typography.weight.black },
  stepperValue: { color: colors.accent.green, fontSize: typography.size.lg, fontWeight: typography.weight.black, 
    minWidth: 32, textAlign: 'center' }, // prettier-ignore

  unitRow: { flexDirection: 'row', gap: spacing['2.5'] },
  unitPill: {
    flex: 1,
    borderWidth: 1,
    borderRadius: rounded.md,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingVertical: spacing['2.5'],
    alignItems: 'center',
  },
  unitPillActive: { backgroundColor: COLORS.accentGlow, borderColor: 'rgba(0,255,135,0.3)' },
  unitPillText: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },
  unitPillTextActive: { color: COLORS.accent, fontWeight: '800' },
  nutriTable: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  nutriRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 14 },
  nutriBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  nutriLabel: { color: COLORS.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 5 },
  nutriTrack: { height: 3, borderRadius: 2, backgroundColor: COLORS.border, overflow: 'hidden' },
  nutriFill: { height: '100%', borderRadius: 2 },
  nutriValWrap: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'flex-end', gap: 2, flexShrink: 0, minWidth: '20%' },
  nutriVal: { fontSize: 18, fontWeight: '900' },
  nutriUnit: { fontSize: 10, fontWeight: '700' },
  footnote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: COLORS.bgCard2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    marginBottom: 16,
  },
  footnoteText: { color: COLORS.textMuted, fontSize: 11, lineHeight: 17, flex: 1 },
  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12 },
  addBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  addBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 17, gap: 8 },
  addBtnText: { color: COLORS.bg, fontSize: 15, fontWeight: '800', letterSpacing: 0.3 },
  addBtnIcon: { color: COLORS.bg, fontSize: 20, fontWeight: '900' },
  addedBanner: {
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: COLORS.accentGlow,
    borderWidth: 1,
    borderColor: 'rgba(0,255,135,0.3)',
  },
  addedText: { color: COLORS.accent, fontSize: 15, fontWeight: '800' },
});
