import { OptionCard } from '@/components/OptionCard';
import { StepShell } from '@/components/StepShell';
import type { ActivityLevel } from '@/lib/nutrition/types';

import { useOnboarding } from '../store';

const LEVELS: { value: ActivityLevel; label: string; hint: string }[] = [
  { value: 'sedentary', label: 'Sedentary', hint: 'Little/no exercise' },
  { value: 'light', label: 'Lightly active', hint: '1–3 days/week' },
  { value: 'moderate', label: 'Moderately active', hint: '3–5 days/week' },
  { value: 'active', label: 'Very active', hint: '6–7 days/week' },
  { value: 'athlete', label: 'Athlete', hint: 'Physical job / 2x daily' },
];

export function ActivityStep() {
  const { draft, setDraft, next } = useOnboarding();
  return (
    <StepShell title="How active are you?" canContinue={!!draft.activityLevel} onContinue={next}>
      {LEVELS.map(l => (
        <OptionCard
          key={l.value}
          label={l.label}
          hint={l.hint}
          selected={draft.activityLevel === l.value}
          onPress={() => setDraft({ activityLevel: l.value })}
        />
      ))}
    </StepShell>
  );
}
