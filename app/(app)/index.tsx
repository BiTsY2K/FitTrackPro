import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { CalorieRing } from '@/features/dashboard/components/CalorieRing';
import { MacroBar } from '@/features/dashboard/components/MacroBar';
import { WeightCard } from '@/features/dashboard/components/WeightCard';
import { useProfile } from '@/features/profiles/hooks';
import { colors, spacing, typography } from '@/theme/tokens';

export default function Dashboard() {
  const { data: profile, isLoading } = useProfile();

  if (isLoading) return <ActivityIndicator style={{ flex: 1 }} color={colors.brand} />;
  if (!profile) return <Text style={{ padding: spacing.lg }}>No profile found.</Text>;

  const { plan } = profile;
  const consumed = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <ScrollView contentContainerStyle={{ flex: 1, padding: spacing.lg, gap: spacing.lg, backgroundColor: colors.bg }}>
      <Text style={[typography.h2, { color: colors.text }]}>Today</Text>
      <View style={{ alignItems: 'center' }}>
        <CalorieRing consumed={consumed.kcal} target={plan.calories} />
      </View>
      <Card style={{ gap: spacing.md }}>
        <MacroBar label="Protein" consumed={consumed.protein} target={plan.proteinG} />
        <MacroBar label="Carbs" consumed={consumed.carbs} target={plan.carbsG} />
        <MacroBar label="Fat" consumed={consumed.fat} target={plan.fatG} />
      </Card>
      <WeightCard />
      <Text style={[typography.caption, { color: colors.textMuted }]}>Fittrack Dashboard Welcomes You!</Text>
    </ScrollView>
  );
}
