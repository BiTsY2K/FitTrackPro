import { OptionCard } from '@/components/OptionCard';
import { StepShell } from '@/components/StepShell';
import { TextField } from '@/components/ui/TextField';

import { targetSchema } from '../schema';
import { useOnboarding } from '../store';

const PACES = [
  { value: 0.25, label: 'Relaxed', hint: '0.25 kg/week' },
  { value: 0.5, label: 'Steady', hint: '0.5 kg/week' },
  { value: 0.75, label: 'Aggressive', hint: '0.75 kg/week' },
];

export function TargetStep() {
  const { draft, setDraft, next } = useOnboarding();
  const valid = targetSchema.safeParse({ targetKg: draft.targetKg, paceKgPerWeek: draft.paceKgPerWeek }).success;
  return (
    <StepShell title="Your target" canContinue={valid} onContinue={next}>
      <TextField
        label="Target weight (kg)"
        keyboardType="decimal-pad"
        value={draft.targetKg?.toString() ?? ''}
        onChangeText={t => setDraft({ targetKg: t === '' ? undefined : Number(t) })}
      />
      {PACES.map(p => (
        <OptionCard
          key={p.value}
          label={p.label}
          hint={p.hint}
          selected={draft.paceKgPerWeek === p.value}
          onPress={() => setDraft({ paceKgPerWeek: p.value })}
        />
      ))}
    </StepShell>
  );
}
