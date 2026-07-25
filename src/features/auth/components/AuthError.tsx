import { Text } from 'react-native';

import { colors, spacing, typography } from '@/theme/tokens';

export function AuthError({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <Text accessibilityLiveRegion="assertive" style={[typography.caption, { color: colors.danger, marginVertical: spacing.xs }]}>
      {message}
    </Text>
  );
}
