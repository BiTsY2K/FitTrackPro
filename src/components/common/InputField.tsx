import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useState } from 'react';
import { Platform, Pressable, TouchableWithoutFeedback } from 'react-native';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

import { colors, rounded, spacing, typography } from '@/themes';

interface InputFieldProps extends TextInputProps {
  inputRef: React.RefObject<TextInput | null>;
  placeholder: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;

  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  style?: ViewStyle;
}

const InputField: React.FC<InputFieldProps> = ({
  inputRef,
  placeholder,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  value,
  onChangeText,
  keyboardType = 'default',
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);

  const hasError = !!error;
  const showPasswordToggle = secureTextEntry;

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
        <View style={[styles.container, isFocused && styles.containerFocused, hasError && { borderColor: colors.feedback.error }]}>
          {!!leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

          <TextInput
            ref={inputRef}
            {...props}
            style={[styles.textInput, !!leftIcon && styles.inputWithicon, (!!rightIcon || showPasswordToggle) && styles.inputWithRightIcon]}
            placeholder={placeholder}
            placeholderTextColor={colors.content.tertiary}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry && !isPasswordVisible}
            keyboardType={keyboardType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="off"
          />

          {rightIcon && !showPasswordToggle && (
            <Pressable onPress={onRightIconPress} style={styles.rightIcon} hitSlop={8} accessibilityRole="button">
              <View style={styles.rightIcon}>{rightIcon}</View>
            </Pressable>
          )}

          {showPasswordToggle && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIcon}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Ionicons name={isPasswordVisible ? 'eye-outline' : 'eye-off-outline'} size={24} color={colors.content.tertiary} />
            </Pressable>
          )}
        </View>
      </TouchableWithoutFeedback>

      {(error || helperText) && (
        <Text
          style={[styles.helperText, hasError && styles.errorText]}
          accessibilityLabel={error || helperText}
          accessibilityLiveRegion="polite"
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: spacing['3.5'] },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs1,
    minHeight: 56,
  },
  containerFocused: {
    borderColor: colors.accent.green,
    backgroundColor: colors.accentGlow.greenSoft,
    ...Platform.select({
      ios: {
        shadowColor: colors.accent.green,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
  },

  textInput: {
    flex: 1,
    color: colors.content.primary,
    fontSize: typography.size.md,
    paddingVertical: spacing.sm,
  },

  inputWithicon: { marginLeft: spacing.xs },
  inputWithRightIcon: { marginRight: spacing.xs },
  leftIcon: { marginRight: spacing.xs },
  rightIcon: { marginLeft: spacing.xs },

  helperText: {
    fontSize: typography.size.xs,
    color: colors.content.tertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorText: { color: colors.feedback.error, fontSize: typography.size.xs, marginTop: 6, marginLeft: 4 },
});

export default InputField;
