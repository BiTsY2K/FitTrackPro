import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, FlatList, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { useRecentFoods } from '@/hooks/useRecentFoods';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { FoodItem, MealType } from '@/types/food.types';

// ── Screen ───────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'RecentFoods'>;

export const RecentFoodsScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mealType } = route.params as { mealType: MealType };
  const { recentFoods, isLoading, refetch } = useRecentFoods();

  const handleSelect = (food: FoodItem) => navigation.navigate('FoodDetail', { food, mealType });

  const renderItem = ({ item }: { item: FoodItem }) => <RecentFoodCard food={item} onPress={() => handleSelect(item)} />;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Recent Foods</Text>
        <View style={styles.headerSpacer} />
      </View>

      {isLoading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={Colors.primary[400]} />
          <Text style={styles.loadingText}>Loading recent foods...</Text>
        </View>
      ) : (
        <FlatList
          data={recentFoods}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View style={styles.centred}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>No recent foods</Text>
              <Text style={styles.emptyText}>Foods you log will appear here for quick re-logging.</Text>
              <Pressable style={styles.searchBtn} onPress={() => navigation.navigate('FoodSearch', { mealType })}>
                <Ionicons name="search" size={18} color={Colors.text.inverse} />
                <Text style={styles.searchBtnText}>Search Foods</Text>
              </Pressable>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

// ── RecentFoodCard ────────────────────────────────────────────────────────────

const RecentFoodCard: React.FC<{ food: FoodItem; onPress: () => void }> = ({ food, onPress }) => {
  const getTrustBadge = () => {
    if (food.trustScore >= 95) return { icon: 'shield-checkmark' as const, color: Colors.success, text: 'USDA' };
    if (food.trustScore >= 80) return { icon: 'checkmark-circle' as const, color: Colors.info, text: 'Verified' };
    return { icon: 'information-circle' as const, color: Colors.warning, text: 'Community' };
  };

  const badge = getTrustBadge();

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitle}>
          <Text style={styles.foodName} numberOfLines={1}>
            {food.name}
          </Text>
          {food.brand && (
            <Text style={styles.foodBrand} numberOfLines={1}>
              {food.brand}
            </Text>
          )}
        </View>

        <View style={[styles.badge, { backgroundColor: badge.color + '20' }]}>
          <Ionicons name={badge.icon} size={12} color={badge.color} />
          <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
        </View>
      </View>

      {/* Nutrition pills */}
      <View style={styles.pills}>
        <NutritionPill label="Cal" value={food.nutrition.calories} />
        <NutritionPill label="P" value={`${food.nutrition.proteinGrams}g`} />
        <NutritionPill label="C" value={`${food.nutrition.carbsGrams}g`} />
        <NutritionPill label="F" value={`${food.nutrition.fatGrams}g`} />
      </View>

      <Text style={styles.serving}>per {food.servingSize.description || `${food.servingSize.amount}${food.servingSize.unit}`}</Text>
    </Pressable>
  );
};

// ── NutritionPill ─────────────────────────────────────────────────────────────

const NutritionPill: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <View style={styles.pill}>
    <Text style={styles.pillLabel}>{label}</Text>
    <Text style={styles.pillValue}>{value}</Text>
  </View>
);

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background },

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
  headerSpacer: { width: 32 },

  list: { padding: Spacing.md },

  // ── Card ── //
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardPressed: { opacity: 0.7, transform: [{ scale: 0.98 }] },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardTitle: { flex: 1, marginRight: Spacing.sm },
  foodName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  foodBrand: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  pills: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xs },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  pillLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
  },
  pillValue: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  serving: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },

  // ── States ── //
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['2xl'],
    gap: Spacing.md,
  },
  loadingText: { fontSize: Typography.fontSize.sm, color: Colors.text.secondary },
  emptyIcon: { fontSize: 56 },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  emptyText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary[400],
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  searchBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
});
