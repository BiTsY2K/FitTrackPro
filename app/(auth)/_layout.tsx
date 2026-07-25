import { Redirect, Stack } from 'expo-router';

import { useAuthStore } from '@/features/auth/store';

export default function AuthLayout() {
  const { status, emailVerified } = useAuthStore();
  // Fully authenticated users don't belong on the auth screens — send them into the app.
  if (status === 'authed' && emailVerified) return <Redirect href={'/(app)'} />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
