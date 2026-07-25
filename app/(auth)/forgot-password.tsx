import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { useResetPassword } from '@/features/auth/hooks/useAuthActions';
import { resetSchema } from '@/features/auth/schema';
import { colors, spacing, typography } from '@/theme/tokens';

export default function ForgotPassword() {
  const router = useRouter();
  const reset = useResetPassword();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string>();

  const submit = () => {
    const parsed = resetSchema.safeParse({ email });
    if (!parsed.success) {
      setErr(parsed.error.flatten().fieldErrors.email?.[0]);
      return;
    }
    setErr(undefined);
    reset.mutate(parsed.data.email, { onSuccess: () => setSent(true) });
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center', backgroundColor: colors.bg }}
    >
      <Text style={[typography.h1, { color: colors.text }]}>Reset password</Text>
      {sent ? (
        <>
          <Text style={[typography.body, { color: colors.textMuted }]}>
            If an account exists for that email, a reset link is on its way.
          </Text>
          <Button title="Back to login" onPress={() => router.replace('/(auth)/login')} />
        </>
      ) : (
        <>
          <TextField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" error={err} />
          <Button title="Send reset link" loading={reset.isPending} onPress={submit} />
        </>
      )}
    </ScrollView>
  );
}
