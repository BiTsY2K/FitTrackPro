import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { useOnboarding } from '@/features/onboarding/store';
import { colors, spacing, typography } from '@/theme/tokens';

const TOTAL = 5;

export function StepShell({
  title,
  subtitle,
  canContinue,
  onContinue,
  isLast,
  loading,
  children,
}: {
  title: string;
  subtitle?: string;
  canContinue: boolean;
  onContinue: () => void;
  isLast?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}) {
  const { step, back } = useOnboarding();
  return (
    <View style={{ flex: 1, padding: spacing.lg, backgroundColor: colors.bg, gap: spacing.md }}>
      {/* progress */}
      <View
        accessibilityRole="progressbar"
        accessibilityValue={{ min: 1, max: TOTAL, now: step + 1 }}
        style={{ flexDirection: 'row', gap: 4 }}
      >
        {Array.from({ length: TOTAL }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: i <= step ? colors.brand : colors.border }} />
        ))}
      </View>
      <Text style={[typography.h1, { color: colors.text }]}>{title}</Text>
      {subtitle ? <Text style={[typography.body, { color: colors.textMuted }]}>{subtitle}</Text> : null}
      <View style={{ flex: 1, gap: spacing.sm }}>{children}</View>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        {step > 0 && <Button title="Back" variant="secondary" onPress={back} style={{ flex: 1 }} />}
        <Button title={isLast ? 'Start' : 'Continue'} loading={loading} disabled={!canContinue} onPress={onContinue} style={{ flex: 2 }} />
      </View>
    </View>
  );
}
