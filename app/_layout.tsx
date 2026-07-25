import '@/lib/firebase'; // side-effect: initialize Firebase + App Check + emulators

import * as Sentry from '@sentry/react-native';
import { SplashScreen, Stack, useNavigationContainerRef } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EnvironmentBanner } from '@/components/EnvironmentBanner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuthListener } from '@/features/auth/hooks/useAuthListener';
import { useAuthStore } from '@/features/auth/store';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { initializeSentry, navigationIntegration } from '@/lib/sentry';
import { QueryProvider } from '@/providers/QueryProvider';

const sentryEnabled = initializeSentry();
void SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const ref = useNavigationContainerRef();
  const status = useAuthStore(s => s.status);
  useAuthListener();

  useEffect(() => {
    if (ref) navigationIntegration.registerNavigationContainer(ref);
    logEvent(AnalyticsEvent.AppOpen, { app: 'FitTrack Pro' });
  }, [ref]);

  useEffect(() => {
    if (status !== 'loading') void SplashScreen.hideAsync();
  }, [status]);

  if (status === 'loading') return null; // splash stays up

  return (
    <QueryProvider>
      <ErrorBoundary>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          <EnvironmentBanner />
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaView>
      </ErrorBoundary>
    </QueryProvider>
  );
}

export default sentryEnabled ? Sentry.wrap(RootLayout) : RootLayout;
