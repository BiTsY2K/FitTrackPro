import { useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { resendVerification, signOut } from '@/features/auth/api/auth';
import { useAuthStore } from '@/features/auth/store';
import { auth } from '@/lib/firebase';
import { colors, spacing, typography } from '@/theme/tokens';

export default function VerifyEmail() {
  const set = useAuthStore(s => s.set);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();

  const refresh = async () => {
    setBusy(true);
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) set({ emailVerified: true });
    else setNote('Not verified yet — check your inbox.');
    setBusy(false);
  };

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.lg, gap: spacing.md, flexGrow: 1, justifyContent: 'center', backgroundColor: colors.bg }}
    >
      <Text style={[typography.h1, { color: colors.text }]}>Verify your email</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>
        We sent a link to {auth.currentUser?.email}. Tap it, then come back and continue.
      </Text>
      {note ? <Text style={[typography.caption, { color: colors.warning }]}>{note}</Text> : null}
      <Button title="I've verified — continue" loading={busy} onPress={refresh} />
      <Button title="Resend email" variant="secondary" onPress={() => resendVerification()} />
      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </ScrollView>
  );
}
