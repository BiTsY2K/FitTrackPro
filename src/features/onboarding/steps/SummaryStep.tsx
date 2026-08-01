import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { StepShell } from '@/components/StepShell';
import { Card } from '@/components/ui/Card';
import { buildPlan, estimateTimeline } from '@/lib/nutrition/engine';
import { colors, spacing, typography } from '@/theme/tokens';

import { useCompleteOnboarding } from '../hooks/useCompleteOnboarding';
import { useOnboarding } from '../store';

export function SummaryStep() {
  const router = useRouter();
  const { draft } = useOnboarding();
  const complete = useCompleteOnboarding();

  const pace = draft.goal === 'maintain' ? 0 : (draft.paceKgPerWeek ?? 0.5);
  const plan = buildPlan(
    { sex: draft.sex!, age: draft.age!, heightCm: draft.heightCm!, weightKg: draft.weightKg! },
    draft.goal!,
    draft.activityLevel!,
    pace,
  );
  const timeline = estimateTimeline(draft.weightKg!, draft.targetKg ?? null, draft.goal!, pace);

  const Row = ({ k, v }: { k: string; v: string }) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={[typography.body, { color: colors.textMuted }]}>{k}</Text>
      <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>{v}</Text>
    </View>
  );

  return (
    <StepShell
      title="Your plan"
      subtitle="Estimates you can adjust anytime."
      isLast
      canContinue
      loading={complete.isPending}
      onContinue={() => complete.mutate(draft as never, { onSuccess: () => router.replace('/(app)') })}
    >
      <Card style={{ gap: spacing.sm }}>
        <Row k="Daily calories" v={`${plan.calories} kcal`} />
        <Row k="Protein" v={`${plan.proteinG} g`} />
        <Row k="Carbs" v={`${plan.carbsG} g`} />
        <Row k="Fat" v={`${plan.fatG} g`} />
        <Row k="Maintenance (TDEE)" v={`${plan.tdee} kcal`} />
        {timeline.weeks ? <Row k="Estimated time" v={`~${timeline.weeks} weeks`} /> : null}
      </Card>
      <Text style={[typography.caption, { color: colors.textMuted }]}>Timelines are estimates and depend on consistency.</Text>
    </StepShell>
  );
}
