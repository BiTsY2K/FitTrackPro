import { useState } from 'react';
import { Text, TextInput, type TextInputProps,View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme/tokens';

interface Props extends TextInputProps {
  label: string;
  error?: string;
}

export function TextField({ label, error, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: spacing.xs }}>
      <Text style={[typography.caption, { color: colors.textMuted }]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        accessibilityState={{ disabled: rest.editable === false }}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          minHeight: 48,
          borderWidth: 1,
          borderColor: error ? colors.danger : focused ? colors.brand : colors.border,
          borderRadius: radius.md,
          paddingHorizontal: spacing.md,
          color: colors.text,
          ...typography.body,
        }}
        {...rest}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={[typography.caption, { color: colors.danger }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
