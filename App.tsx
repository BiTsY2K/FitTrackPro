import { AuthProvider } from '@/contexts/AuthContext';
import RootNavigation from '@/navigation/RootNavigation';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { COLORS } from '@/constants/theme';

function AppContent() {
  return (
    <View style={styles.container}>
      <AuthProvider>
        <RootNavigation />
      </AuthProvider>
      <StatusBar style="light" translucent={true} />
    </View>
  );
}

Sentry.init({
  dsn: 'https://528f094b43f274d9607fc0d1f66e0f6c@o4510936927764480.ingest.de.sentry.io/4510936952864848',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

export default Sentry.wrap(function App() {
  useEffect(() => {}, []);

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <AppContent />
      {/**
       * To make sure everything is set up correctly, put the following code snippet into your application.
       * The snippet will create a button that, when tapped, sends a test event to Sentry.
       *
       * After that check your project issues: https://bits-development.sentry.io/issues/?project=4510936952864848
       * <Button title="Try!" onPress={() => { Sentry.captureException(new Error('First error')); }} />
       **/}
    </SafeAreaProvider>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
});
