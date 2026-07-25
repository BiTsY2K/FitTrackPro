import { StyleSheet, Text, View } from 'react-native';

import { env, isProd } from '@/config/env';
import { colors } from '@/theme/tokens';

export function EnvironmentBanner() {
  if (isProd) return null;
  return (
    <View accessibilityRole="text" style={styles.wrapper}>
      <Text style={styles.contents}>{env.APP_ENV.toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: colors.warning, paddingVertical: 2, alignItems: 'center' },
  contents: { color: '#fff', fontSize: 11, fontWeight: '700' },
});
