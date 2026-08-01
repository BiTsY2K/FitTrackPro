import { View } from 'react-native';

import { OptionCard } from '@/components/OptionCard';
import { StepShell } from '@/components/StepShell';
import { TextField } from '@/components/ui/TextField';
import { spacing } from '@/theme/tokens';

import { statsSchema } from '../schema';
import { useOnboarding } from '../store';

export function StatsStep() {
  const { draft, setDraft, next } = useOnboarding();
  const num = (t: string) => (t === '' ? undefined : Number(t));
  const valid = statsSchema.safeParse({ sex: draft.sex, age: draft.age, heightCm: draft.heightCm, weightKg: draft.weightKg }).success;

  return (
    <StepShell title="About you" subtitle="Used to calculate your energy needs." canContinue={valid} onContinue={next}>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1 }}>
          <OptionCard label="Male" selected={draft.sex === 'male'} onPress={() => setDraft({ sex: 'male' })} />
        </View>
        <View style={{ flex: 1 }}>
          <OptionCard label="Female" selected={draft.sex === 'female'} onPress={() => setDraft({ sex: 'female' })} />
        </View>
      </View>
      <TextField label="Age" keyboardType="number-pad" value={draft.age?.toString() ?? ''} onChangeText={t => setDraft({ age: num(t) })} />
      <TextField
        label="Height (cm)"
        keyboardType="decimal-pad"
        value={draft.heightCm?.toString() ?? ''}
        onChangeText={t => setDraft({ heightCm: num(t) })}
      />
      <TextField
        label="Weight (kg)"
        keyboardType="decimal-pad"
        value={draft.weightKg?.toString() ?? ''}
        onChangeText={t => setDraft({ weightKg: num(t) })}
      />
    </StepShell>
  );
}
