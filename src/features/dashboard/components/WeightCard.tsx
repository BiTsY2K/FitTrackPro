import { useState } from 'react';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { useAddWeight, useWeights } from '@/features/weight/hooks';
import { colors, spacing, typography } from '@/theme/tokens';

export function WeightCard() {
  const { data } = useWeights();
  const add = useAddWeight();
  const [value, setValue] = useState('');
  const latest = data?.[0];

  return (
    <Card style={{ gap: spacing.sm }}>
      <Text style={[typography.body, { color: colors.text, fontWeight: '700' }]}>Weight</Text>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{latest ? `Latest: ${latest.kg} kg` : 'No entries yet'}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
        <View style={{ flex: 1 }}>
          <TextField label="Log weight (kg)" keyboardType="decimal-pad" value={value} onChangeText={setValue} />
        </View>
        <Button
          title="Add"
          loading={add.isPending}
          disabled={!value}
          onPress={() => add.mutate(Number(value), { onSuccess: () => setValue('') })}
          style={{ width: 96 }}
        />
      </View>
    </Card>
  );
}
