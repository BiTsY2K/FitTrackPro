import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthError } from '@/features/auth/components/AuthError';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { useSignup } from '@/features/auth/hooks/useAuthActions';
import { signupSchema } from '@/features/auth/schema';
import { colors, spacing, typography } from '@/theme/tokens';

export default function Signup() {
  const router = useRouter();
  const signup = useSignup();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errs, setErrs] = useState<Record<string, string>>({});

  const submit = () => {
    const parsed = signupSchema.safeParse({ email, password, confirm });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setErrs({ email: f.email?.[0] ?? '', password: f.password?.[0] ?? '', confirm: f.confirm?.[0] ?? '' });
      return;
    }
    setErrs({});
    signup.mutate(
      { email: parsed.data.email, password: parsed.data.password },
      {
        onSuccess: () => router.replace('/(auth)/verify-email'),
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center', backgroundColor: colors.bg }}
    >
      <Text style={[typography.h1, { color: colors.text }]}>Create account</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={errs.email}
      />
      <PasswordField label="Password" value={password} onChangeText={setPassword} error={errs.password} />
      <PasswordField label="Confirm password" value={confirm} onChangeText={setConfirm} error={errs.confirm} />
      <AuthError message={signup.error?.message} />
      <Button title="Sign up" loading={signup.isPending} onPress={submit} />
      <Link href="/(auth)/login" style={{ color: colors.brand, textAlign: 'center' }}>
        I already have an account
      </Link>
    </ScrollView>
  );
}
