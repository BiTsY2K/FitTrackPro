import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { BorderRadius, Colors, Spacing, Typography } from '@/constants/theme';
import { globalStyles } from '@/globalStyles';
import { MainStackParamList } from '@/navigation/MainNavigation';
import { FoodItem, MealType, NutritionInfo, ServingSize } from '@/types/food.types';
import { logger } from '@/utils/logger';

// ── Types ────────────────────────────────────────────────────────────────────

interface ManualFormState {
  name: string;
  brand: string;
  servingAmount: string;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  fiber: string;
  sugar: string;
}

const INITIAL_FORM: ManualFormState = {
  name: '',
  brand: '',
  servingAmount: '100',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  fiber: '',
  sugar: '',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const parseNum = (val: string): number => {
  const n = parseFloat(val);
  return isNaN(n) || n < 0 ? 0 : n;
};

// ── Screen ───────────────────────────────────────────────────────────────────
type Props = NativeStackScreenProps<MainStackParamList, 'ManualFoodEntry'>;

export const ManualFoodEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const { mealType } = route.params as { mealType: MealType };
  const [form, setForm] = useState<ManualFormState>(INITIAL_FORM);

  const set = (field: keyof ManualFormState) => (value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const validate = (): string | null => {
    if (!form.name.trim()) return 'Food name is required.';
    if (!form.calories || parseNum(form.calories) <= 0) return 'Calories must be greater than 0.';
    if (!form.servingAmount || parseNum(form.servingAmount) <= 0) return 'Serving size must be greater than 0.';
    return null;
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      Alert.alert('Missing Info', error);
      return;
    }

    const serving = parseNum(form.servingAmount);

    const servingSize: ServingSize = {
      amount: serving,
      unit: 'g',
      description: `${serving}g`,
      gramsPerServing: serving,
    };

    const nutrition: NutritionInfo = {
      calories: parseNum(form.calories),
      proteinGrams: parseNum(form.protein),
      carbsGrams: parseNum(form.carbs),
      fatGrams: parseNum(form.fat),
      fiberGrams: form.fiber ? parseNum(form.fiber) : undefined,
      sugarGrams: form.sugar ? parseNum(form.sugar) : undefined,
    };

    const food: FoodItem = {
      id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      servingSize,
      nutrition,
      source: 'User',
      trustScore: 70, // User-entered data
      isPublic: false,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    logger.info('Manual food entry created', { name: food.name, calories: food.nutrition.calories });

    // Navigate to FoodDetail — user can still adjust servings/meal before adding //
    navigation.navigate('FoodDetail', { food, mealType });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Text style={styles.headerTitle}>Add Custom Food</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView style={globalStyles.flex_1} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          {/* Food Identity */}
          <FormSection title="Food Details">
            <FormField
              label="Food Name *"
              value={form.name}
              onChangeText={set('name')}
              placeholder="e.g. Grilled Chicken Breast"
              autoCapitalize="words"
            />
            <FormField
              label="Brand (optional)"
              value={form.brand}
              onChangeText={set('brand')}
              placeholder="e.g. Tyson"
              autoCapitalize="words"
            />
          </FormSection>

          {/* Serving */}
          <FormSection title="Serving Size">
            <FormField
              label="Amount (g) *"
              value={form.servingAmount}
              onChangeText={set('servingAmount')}
              placeholder="100"
              keyboardType="decimal-pad"
              hint="Enter the weight in grams for one serving"
            />
          </FormSection>

          {/* Macros */}
          <FormSection title="Nutrition per Serving">
            <FormField
              label="Calories (kcal) *"
              value={form.calories}
              onChangeText={set('calories')}
              placeholder="0"
              keyboardType="decimal-pad"
              accent
            />

            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <FormField
                  label="Protein (g)"
                  value={form.protein}
                  onChangeText={set('protein')}
                  placeholder="0"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.macroField}>
                <FormField label="Carbs (g)" value={form.carbs} onChangeText={set('carbs')} placeholder="0" keyboardType="decimal-pad" />
              </View>
              <View style={styles.macroField}>
                <FormField label="Fat (g)" value={form.fat} onChangeText={set('fat')} placeholder="0" keyboardType="decimal-pad" />
              </View>
            </View>
          </FormSection>

          {/* Optional */}
          <FormSection title="Optional Nutrients">
            <View style={styles.macroRow}>
              <View style={styles.macroField}>
                <FormField label="Fiber (g)" value={form.fiber} onChangeText={set('fiber')} placeholder="0" keyboardType="decimal-pad" />
              </View>
              <View style={styles.macroField}>
                <FormField label="Sugar (g)" value={form.sugar} onChangeText={set('sugar')} placeholder="0" keyboardType="decimal-pad" />
              </View>
            </View>
          </FormSection>

          {/* Submit */}
          <Pressable style={({ pressed }) => [styles.submitBtn, pressed && styles.submitBtnPressed]} onPress={handleSubmit}>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.submitBtnText}>Review & Add to Log</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionCard}>{children}</View>
  </View>
);

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  hint?: string;
  keyboardType?: 'default' | 'decimal-pad' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  accent?: boolean;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  keyboardType = 'default',
  autoCapitalize = 'none',
  accent = false,
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      style={[fieldStyles.input, accent && fieldStyles.inputAccent]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={Colors.gray[400]}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={false}
    />
    {hint && <Text style={fieldStyles.hint}>{hint}</Text>}
  </View>
);

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.sm },
  label: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputAccent: {
    borderColor: Colors.primary[300],
    backgroundColor: Colors.primary[50],
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  hint: {
    marginTop: 4,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
});

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

  container: { padding: Spacing.md, paddingBottom: Spacing.xl },

  section: { marginBottom: Spacing.md },
  sectionTitle: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },

  macroRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  macroField: { flex: 1 },

  submitBtn: {
    backgroundColor: Colors.primary[400],
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  submitBtnPressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
  submitBtnText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
});
