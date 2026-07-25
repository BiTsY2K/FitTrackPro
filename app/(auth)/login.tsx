import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { AuthError } from '@/features/auth/components/AuthError';
import { PasswordField } from '@/features/auth/components/PasswordField';
import { SocialButtons } from '@/features/auth/components/SocialButtons';
import { useLogin } from '@/features/auth/hooks/useAuthActions';
import { loginSchema } from '@/features/auth/schema';
import { colors, spacing, typography } from '@/theme/tokens';

export default function Login() {
  const router = useRouter();
  const login = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErr, setFieldErr] = useState<{ email?: string; password?: string }>({});

  const submit = () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const f = parsed.error.flatten().fieldErrors;
      setFieldErr({ email: f.email?.[0], password: f.password?.[0] });
      return;
    }
    setFieldErr({});
    login.mutate(parsed.data, { onSuccess: () => router.replace('/(app)') });
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center', backgroundColor: colors.bg }}
    >
      <Text style={[typography.h1, { color: colors.text }]}>Welcome back</Text>
      <TextField
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        error={fieldErr.email}
      />
      <PasswordField label="Password" value={password} onChangeText={setPassword} error={fieldErr.password} />
      <AuthError message={login.error?.message} />
      <Button title="Log in" loading={login.isPending} onPress={submit} />
      <SocialButtons />
      <View style={{ alignItems: 'center', gap: spacing.xs }}>
        <Link href="/(auth)/forgot-password" style={{ color: colors.brand }}>
          Forgot password?
        </Link>
        <Link href="/(auth)/signup" style={{ color: colors.brand }}>
          Create an account
        </Link>
      </View>
    </ScrollView>
  );
}
