import './global.css';

import * as Sentry from '@sentry/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/contexts/AuthContext';
import RootNavigation from '@/navigation/RootNavigation';
import { colors } from '@/themes';

import { OnboardingProvider } from './contexts/OnboardingContext';

// Singleton QueryClient — created outside of components so it persists across re-renders //
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30 * 1000, // 30 seconds default
    },
  },
});

function AppContent() {
  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent={true} />

      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OnboardingProvider>
            <RootNavigation />
          </OnboardingProvider>
        </AuthProvider>
      </QueryClientProvider>
    </View>
  );
}

export const App = () => {
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppContent />
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.page,
  },
});

Sentry.init({
  dsn: 'https://528f094b43f274d9607fc0d1f66e0f6c@o4510936927764480.ingest.de.sentry.io/4510936952864848',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,
  enableLogs: true, // Enable Logs

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(App);
