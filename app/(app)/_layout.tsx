import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/store';

export default function AppLayout() {
  const { status, emailVerified, profileComplete } = useAuthStore();
  if (status !== 'authed') return <Redirect href={'/(auth)/login'} />;
  if (!emailVerified) return <Redirect href={'/(auth)/verify-email'} />;
  if (!profileComplete) return <Redirect href={'/(onboarding)'} />;
  return <Stack screenOptions={{ headerShown: false }} />;
}
