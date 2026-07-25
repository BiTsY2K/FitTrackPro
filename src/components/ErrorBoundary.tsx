import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { logger } from '@/lib/logger';
import { colors, spacing, typography } from '@/theme/tokens';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export class ErrorBoundary extends React.Component<Props, State> {
  override state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error('render_error', {
      error,
      componentStack: info.componentStack,
    });
  }

  reset = () => this.setState({ hasError: false });

  override render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View style={styles.wrapper}>
        <Text style={[typography.h2, { color: colors.text }]}>Something went wrong</Text>
        <Text style={[typography.body, styles.contents]}>The screen hit an unexpected error. It has been reported. You can try again.</Text>
        <Pressable accessibilityRole="button" onPress={this.reset} style={styles.button}>
          <Text style={styles.buttonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.bg },
  contents: { color: colors.textMuted, textAlign: 'center', marginVertical: spacing.md },
  button: { backgroundColor: '#0B5132', paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 12 },
  buttonText: { color: colors.brandOn, fontWeight: '700' },
});
