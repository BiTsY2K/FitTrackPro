import * as Sentry from '@sentry/react-native';
import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

import { spacing, typography } from '@/themes';

interface Props {
  children?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorSubTitle}>We've been notified and are working on a fix.</Text>
          <Button title="Restart App" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}

export default Sentry.wrap(ErrorBoundary);

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg },
  errorTitle: { fontSize: typography.size.xl, fontWeight: 'bold', marginBottom: spacing['2.5'] },
  errorSubTitle: { textAlign: 'center', marginBottom: spacing['2.5'], color: '#666' },
});
