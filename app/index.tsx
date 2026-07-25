import { Redirect } from 'expo-router';

import { useAuthStore } from '@/features/auth/store';

// Root entry (`/`). The root layout keeps the splash up while status is
// 'loading', so by the time this renders we know where to send the user.
// The (app) and (auth) layouts handle the finer-grained redirects
// (email verification, onboarding) from there.
export default function Index() {
  const status = useAuthStore(s => s.status);
  if (status === 'authed') return <Redirect href={'/(app)'} />;
  return <Redirect href={'/(auth)/login'} />;
}
