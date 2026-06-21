import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { ActivityIndicator, Animated, FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SectionLabel } from '@/components/common/SectionLabel';
import { COLORS } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { useFoodSearch } from '@/hooks/useFoodSearch';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { colors, rounded, spacing, typography } from '@/themes';
import { FoodItem } from '@/types/food.types';

// ── COMPONENT: TrustBadge ─────────────────────────────────────────────────────────────────────────────
const TrustBadge = React.memo(function TrustBadge({ score }: { score: number }) {
  /* prettier-ignore */
  const { icon, label, color } =
    score >= 95 ? { icon: <MaterialCommunityIcons name="shield" color={colors.accent.green} size={11} />, label: 'USDA', color: colors.accent.green }
      : score >= 80 ? { icon: '✓', label: 'Verified', color: colors.accent.blue }
        : { icon: '👥', label: 'Community', color: colors.accent.orange };

  return (
    <View style={[trustBadgeStyles.badge, { backgroundColor: `${color}46`, borderColor: `${color}40` }]}>
      <Text style={[trustBadgeStyles.icon, { color }]}>{icon}</Text>
      <Text style={[trustBadgeStyles.text, { color }]}>{label}</Text>
    </View>
  );
});

TrustBadge.displayName = 'TrustBadge';
export { TrustBadge };

const trustBadgeStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs1,
    borderRadius: rounded.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing[1],
  },
  icon: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
  text: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
});

// ── COMPONENT: FoodResultCard ─────────────────────────────────────────────────────────────────────────────
const FoodResultCard = React.memo(function FoodResultCard({ food, onPress }: { food: FoodItem; onPress: () => void }) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const pills = [
    { label: 'Cal', value: food.nutrition.calories, unit: 'kcal', color: colors.accent.green },
    { label: 'P', value: `${food.nutrition.proteinGrams}g`, color: colors.accent.blue },
    { label: 'C', value: `${food.nutrition.carbsGrams}g`, color: colors.accent.orange },
    { label: 'F', value: `${food.nutrition.fatGrams}g`, color: colors.accent.purple },
  ];

  return (
    <Animated.View style={[globalStyles.marg_b_sm, { transform: [{ scale: pressScale }] }]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={foodResultCardStyles.card}>
        <View style={foodResultCardStyles.headerRow}>
          <View style={foodResultCardStyles.headerRowContent}>
            <Text style={foodResultCardStyles.name} numberOfLines={2}>
              {food.name}
            </Text>
            {food.brand && (
              <Text style={foodResultCardStyles.brand} numberOfLines={1}>
                {food.brand}
              </Text>
            )}
          </View>
          <TrustBadge score={food.trustScore} />
        </View>

        <View style={foodResultCardStyles.pillsRow}>
          {pills.map((nutrient, i) => (
            <View
              key={i}
              style={[foodResultCardStyles.pill, { backgroundColor: `${nutrient.color}46`, borderColor: `${nutrient.color}40` }]}
            >
              <Text style={[foodResultCardStyles.pillLabel, { color: nutrient.color }]}>{nutrient.label}:</Text>
              <Text style={[foodResultCardStyles.pillValue, { color: nutrient.color }]}>{nutrient.value}</Text>
            </View>
          ))}
        </View>
        <Text style={foodResultCardStyles.serving}>
          per {food.servingSize.description || `${food.servingSize.amount}${food.servingSize.unit}`}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const foodResultCardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface.raised,
    borderRadius: rounded.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: spacing.md,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs1 },
  headerRowContent: { flex: 1, marginRight: spacing.xs },
  name: {
    color: colors.content.secondary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing['0.5'],
  },
  brand: { color: COLORS.textMuted, fontSize: spacing.xs - 1 },
  pillsRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs1, marginBottom: spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs1,
    borderRadius: rounded.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing[1],
  },
  pillLabel: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
  pillValue: { fontSize: typography.size.xs - 1, fontWeight: typography.weight.bold },
  serving: { color: colors.content.tertiary, fontSize: typography.size.xs - 1 },
});

// ── FoodSearchScreen: Main Screen ─────────────────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'FoodSearch'>;

export const FoodSearchScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mealType = 'lunch' } = route.params || {};

  const inputRef = useRef<TextInput>(null);
  const headerFade = useRef(new Animated.Value(0)).current;

  const { query, setQuery, results, isLoading, recentSearches, clearRecentSearches } = useFoodSearch();

  useEffect(() => {
    Animated.timing(headerFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    const t = setTimeout(() => inputRef.current?.focus(), 120);
    return () => clearTimeout(t);
  }, []);

  const handleFoodSelect = useCallback(
    (food: FoodItem) => {
      navigation.navigate('FoodDetail', { food, mealType });
    },
    [mealType],
  );

  const mealLabel = mealType.charAt(0).toUpperCase() + mealType.slice(1);
  const showRecent = query.length === 0 && recentSearches.length > 0;
  const showResults = query.length >= 2 && !isLoading;
  const showEmpty = showResults && results.length === 0;
  const showBrowse = !isLoading && !showResults;

  const CATEGORIES = ['🥩 Protein', '🌾 Carbs', '🥑 Fats', '🥛 Dairy', '🍎 Fruit', '🥦 Veggies', '🍫 Snacks'];

  const ListHeader = useMemo(
    () => (
      <View>
        {/* Activity indicator */}
        {isLoading && (
          <View style={foodSearchStyles.loadingWrap}>
            <ActivityIndicator color={colors.accent.green} size="large" />
            <Text style={foodSearchStyles.loadingText}>Searching...</Text>
          </View>
        )}

        {/* Browse by category items */}
        {showBrowse && (
          <View style={foodSearchStyles.section}>
            <SectionLabel icon={<MaterialCommunityIcons name="lightbulb-on" size={18} />} children="Browse by Category" />
            <View style={foodSearchStyles.categoryWraps}>
              {CATEGORIES.map((cat, i) => (
                <TouchableOpacity
                  key={`cat_${i}`}
                  onPress={() => setQuery(cat.split(' ')[1])}
                  style={foodSearchStyles.categoryChip}
                  activeOpacity={0.8}
                >
                  <Text style={foodSearchStyles.categoryText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Recent search items */}
        {showRecent && (
          <View style={foodSearchStyles.section}>
            <View style={foodSearchStyles.sectionHeaderRow}>
              <SectionLabel icon={<MaterialCommunityIcons name="history" size={18} />} children="Recent Searches" />
              <TouchableOpacity onPress={clearRecentSearches} activeOpacity={0.8}>
                <View style={foodSearchStyles.badge}>
                  <Text style={[foodSearchStyles.badgeText, { color: colors.accent.green }]}>Clear All</Text>
                </View>
              </TouchableOpacity>
            </View>

            {recentSearches.map((s: string, i: number) => (
              <View
                key={`recent_${i}`}
                style={[foodSearchStyles.recentRow, i < recentSearches.length - 1 && foodSearchStyles.recentBorder]}
              >
                <TouchableOpacity onPress={() => setQuery(s)} style={foodSearchStyles.recentRowWrapper} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="history" color={colors.content.secondary} size={24} />
                  <Text style={foodSearchStyles.recentText}>{s}</Text>
                  <MaterialCommunityIcons name="arrow-top-left" color={colors.content.secondary} size={24} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Results count label */}
        {showResults && !showEmpty && (
          <SectionLabel
            icon={<MaterialCommunityIcons name="format-list-text" size={18} />}
            children={`${results.length} result${results.length !== 1 ? 's' : ''} for "${query}"`}
          />
        )}
      </View>
    ),
    [isLoading, showRecent, recentSearches, showBrowse, showResults, showEmpty, results.length, query],
  );

  /** Empty state shown when a query returned zero results */
  const ListEmpty = useMemo(
    () =>
      showEmpty ? (
        <View style={foodSearchStyles.emptyWrap}>
          <View style={[foodSearchStyles.emptyIconContainer, globalStyles.marg_b_md]}>
            <Text style={foodSearchStyles.emptyIcon}>🔍</Text>
          </View>
          <Text style={foodSearchStyles.emptyTitle}>No results found</Text>
          <Text style={foodSearchStyles.emptySub}>Try a different search, or add it manually.</Text>
          <TouchableOpacity
            style={foodSearchStyles.emptyBtn}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ManualFoodEntry', { mealType })}
          >
            <Text style={foodSearchStyles.emptyBtnText}>+ Add Custom Food</Text>
          </TouchableOpacity>
        </View>
      ) : null,
    [showEmpty],
  );

  return (
    <SafeAreaView style={globalStyles.safe}>
      {/* ── Sticky Nav Header ── */}
      <Animated.View style={[foodSearchStyles.navHeader, { opacity: headerFade }]}>
        {/* Header */}
        <View style={foodSearchStyles.navRow}>
          <TouchableOpacity style={globalStyles.backBtn} activeOpacity={0.8} onPress={() => navigation.goBack()}>
            <View style={globalStyles.backCircle}>
              <Text style={globalStyles.backArrow}>←</Text>
              <Text style={globalStyles.backText}>Back</Text>
            </View>
          </TouchableOpacity>

          <View style={[globalStyles.flex_1, globalStyles.alignItemsStart]}>
            <Text style={foodSearchStyles.navSub}>
              Adding to <Text style={foodSearchStyles.navMeal}>{mealLabel}</Text>
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={foodSearchStyles.searchBox}>
          <MaterialCommunityIcons name="magnify" color={colors.content.tertiary} size={24} />
          {/* prettier-ignore */}
          <TextInput ref={inputRef} style={foodSearchStyles.searchInput} placeholder="Search foods, brands..." placeholderTextColor={colors.content.tertiary}
            value={query} onChangeText={setQuery} autoCapitalize="none" autoCorrect={false} returnKeyType="search" />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={foodSearchStyles.buttonClose} activeOpacity={0.8}>
              <MaterialCommunityIcons name="close" color={colors.content.tertiary} size={20} />
            </TouchableOpacity>
          )}
        </View>

        {/* Action Buttons  */}
        <View style={foodSearchStyles.quickActionRow}>
          {[
            {
              icon: <MaterialCommunityIcons name="barcode-scan" color={colors.content.secondary} size={24} />,
              label: 'Scan Barcode',
              color: colors.accent.purple,
              onPress: () => navigation.navigate('BarcodeScanner', { mealType: mealType }),
            },
            {
              icon: <MaterialCommunityIcons name="pencil-plus" color={colors.content.secondary} size={24} />,
              label: 'Add Custom',
              color: colors.accent.teal,
              onPress: () => navigation.navigate('ManualFoodEntry', { mealType: mealType }),
            },
            {
              icon: <MaterialCommunityIcons name="history" color={colors.content.secondary} size={24} />,
              label: 'Recent Foods',
              color: colors.accent.orange,
              onPress: () => navigation.navigate('RecentFoods', { mealType: mealType }),
            },
          ].map((qa, i) => (
            <TouchableOpacity
              key={`qa_${i}`}
              style={[foodSearchStyles.quickActionBtn, { backgroundColor: `${qa.color}12`, borderColor: `${qa.color}30` }]}
              activeOpacity={0.8}
              onPress={qa.onPress}
            >
              {qa.icon}
              <Text style={[foodSearchStyles.quickActionBtnLabel, { color: qa.color }]}>{qa.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      <FlatList<FoodItem>
        data={showResults && !showEmpty ? results : []}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <FoodResultCard food={item} onPress={() => handleFoodSelect(item)} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={foodSearchStyles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews={Platform.OS === 'android'}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
      />
    </SafeAreaView>
  );
};

FoodSearchScreen.displayName = 'FoodSearchScreen';
export default FoodSearchScreen;

// ── Styles ─────────────────────────────────────────────────────────────────────────────
const foodSearchStyles = StyleSheet.create({
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

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: rounded.lg,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.page,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs1,
    marginBottom: spacing.sm,
  },
  searchInput: { flex: 1, color: colors.content.secondary, fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  buttonClose: { padding: 4, borderRadius: rounded.xs },

  quickActionRow: { flexDirection: 'row', gap: spacing.sm },
  quickActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderRadius: rounded.lg,
    borderWidth: 1,
    gap: spacing['0.5'],
  },
  quickActionBtnLabel: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },

  section: { ...globalStyles.marg_b_lg },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing[2],
  },
  badge: {
    borderWidth: 1,
    borderRadius: rounded.md,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing.xs1,
    marginTop: -spacing[1],
  },
  badgeText: { fontSize: typography.size.sm - 1, fontWeight: typography.weight.extrabold },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  loadingText: { color: COLORS.textMuted, fontSize: typography.size.sm },

  listContent: { ...globalStyles.content },

  recentRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recentRowWrapper: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs, gap: spacing.sm },
  recentBorder: { borderBottomWidth: 1, borderBottomColor: colors.border.default },
  recentText: { flex: 1, color: colors.content.secondary, fontSize: typography.size.sm },

  categoryWraps: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing['1.5'] },
  categoryChip: {
    borderWidth: 1,
    borderRadius: rounded.full,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  categoryText: { color: colors.content.secondary, fontSize: typography.size.xs, fontWeight: typography.weight.semibold },

  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing[8] },
  emptyIconContainer: {
    width: 72,
    height: 72,
    borderWidth: 1,
    borderRadius: rounded.xl2,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: { fontSize: typography.size.xl4 },
  emptyTitle: {
    color: colors.content.primary,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    marginBottom: spacing.xs,
  },
  emptySub: { color: colors.content.tertiary, fontSize: 12, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  emptyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: rounded.lg,
    // borderColor: colors.accentGlow.green,
    backgroundColor: colors.accentGlow.green,
    borderWidth: 1,
  },
  emptyBtnText: { color: colors.accent.green, fontSize: typography.size.sm, fontWeight: typography.weight.extrabold },
});
