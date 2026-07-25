import { Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { signOut } from '@/features/auth/api/auth';
import { useAuthStore } from '@/features/auth/store';
import { colors, spacing, typography } from '@/theme/tokens';

export default function Home() {
  const user = useAuthStore(s => s.user);
  return (
    <View style={{ flex: 1, padding: spacing.lg, gap: spacing.md, backgroundColor: colors.bg }}>
      <Text style={[typography.h1, { color: colors.text }]}>NutriTrack</Text>
      <Text style={[typography.body, { color: colors.textMuted }]}>
        Signed in as {user?.email}. Week 3 adds onboarding & the dashboard.
      </Text>
      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </View>
  );
}
