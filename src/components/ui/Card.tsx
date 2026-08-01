import { View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/theme/tokens';

export function Card({ style, ...rest }: ViewProps) {
  return (
    <View
      style={[
        { backgroundColor: colors.bg, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
        style,
      ]}
      {...rest}
    />
  );
}
