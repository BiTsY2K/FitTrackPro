import { OptionCard } from '@/components/OptionCard';
import { StepShell } from '@/components/StepShell';
import type { Goal } from '@/lib/nutrition/types';

import { useOnboarding } from '../store';

const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: 'lose', label: 'Lose weight', hint: 'Calorie deficit' },
  { value: 'maintain', label: 'Maintain', hint: 'Stay where you are' },
  { value: 'gain', label: 'Gain weight', hint: 'Calorie surplus' },
];

export function GoalStep() {
  const { draft, setDraft, next } = useOnboarding();
  return (
    <StepShell title="What's your goal?" canContinue={!!draft.goal} onContinue={next}>
      {GOALS.map(g => (
        <OptionCard
          key={g.value}
          label={g.label}
          hint={g.hint}
          selected={draft.goal === g.value}
          onPress={() => setDraft({ goal: g.value })}
        />
      ))}
    </StepShell>
  );
}
