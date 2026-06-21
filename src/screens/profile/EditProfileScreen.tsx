import { doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/common/Button';
import { NumberPicker } from '@/components/onboarding/NumberPicker';
import { Colors, Spacing, Typography } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { CalorieCalculator } from '@/services/calculations/CalorieCalculator';
import { db } from '@/services/firebase';

export const EditProfileScreen: React.FC = ({ navigation, route }: any) => {
  const { user } = useAuth();
  const { profile } = route.params;

  const [currentWeightKg, setCurrentWeightKg] = useState(profile.currentWeightKg);
  const [targetWeightKg, setTargetWeightKg] = useState(profile.targetWeightKg || profile.currentWeightKg);
  const [workoutFrequency, setWorkoutFrequency] = useState(profile.workoutFrequencyPerWeek);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Recalculate plan with new data
      const updatedData = {
        ...profile,
        currentWeightKg,
        targetWeightKg: profile.goal !== 'maintain_weight' ? targetWeightKg : undefined,
        workoutFrequencyPerWeek: workoutFrequency,
      };

      const newPlan = CalorieCalculator.calculateNutritionPlan(updatedData);

      // Save updated profile
      await updateDoc(doc(db, 'users', user.uid), {
        currentWeightKg,
        targetWeightKg: profile.goal !== 'maintain_weight' ? targetWeightKg : null,
        workoutFrequencyPerWeek: workoutFrequency,

        // Updated calculations
        bmr: newPlan.bmr,
        tdee: newPlan.tdee,
        dailyCalorieTarget: newPlan.dailyCalorieTarget,
        dailyProteinGrams: newPlan.dailyProteinGrams,
        dailyFatGrams: newPlan.dailyFatGrams,
        dailyCarbsGrams: newPlan.dailyCarbsGrams,
        dailyWaterMl: newPlan.dailyWaterMl,
        estimatedWeeksToGoal: newPlan.estimatedWeeksToGoal,

        updatedAt: serverTimestamp(),
      });

      navigation.goBack();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    currentWeightKg !== profile.currentWeightKg ||
    targetWeightKg !== profile.targetWeightKg ||
    workoutFrequency !== profile.workoutFrequencyPerWeek;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Update Your Profile</Text>
        <Text style={styles.subtitle}>We'll recalculate your plan based on the changes</Text>

        <NumberPicker
          label="Current Weight"
          value={currentWeightKg}
          min={30}
          max={300}
          step={0.5}
          unit="kg"
          onChange={setCurrentWeightKg}
        />

        {profile.goal !== 'maintain_weight' && (
          <NumberPicker label="Target Weight" value={targetWeightKg} min={30} max={300} step={0.5} unit="kg" onChange={setTargetWeightKg} />
        )}

        <NumberPicker
          label="Workout Days Per Week"
          value={workoutFrequency}
          min={0}
          max={7}
          step={1}
          unit="days"
          onChange={setWorkoutFrequency}
        />

        <Button label="Save Changes" onPress={handleSave} loading={saving} disabled={!hasChanges || saving} fullWidth />

        <Button label="Cancel" onPress={() => navigation.goBack()} variant="ghost" fullWidth style={styles.cancelButton} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flexGrow: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.text.secondary,
    marginBottom: Spacing.xl,
  },
  cancelButton: {
    marginTop: Spacing.md,
  },
});
