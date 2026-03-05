import { COLORS, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, TouchableWithoutFeedback } from 'react-native';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputFieldProps extends TextInputProps {
  inputRef: React.RefObject<TextInput | null>;
  placeholder: string;
  error?: string;
  helperText?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
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
  icon,
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
        <View
          style={[
            styles.container,
            isFocused && styles.containerFocused,
            hasError && { borderColor: COLORS.SEMANTIC.error },
          ]}
        >
          {icon && <Ionicons name={icon} size={24} color={COLORS.textMuted} style={styles.icon} />}

          <TextInput
            ref={inputRef}
            {...props}
            style={[
              styles.textInput,
              icon && styles.inputWithicon,
              (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
            ]}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
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
            <Pressable
              onPress={onRightIconPress}
              style={styles.rightIcon}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Ionicons name={rightIcon} size={24} color={COLORS.textMuted} />
            </Pressable>
          )}

          {showPasswordToggle && (
            <Pressable
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              style={styles.rightIcon}
              hitSlop={8}
              accessibilityRole="button"
            >
              <Ionicons
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color={COLORS.textMuted}
              />
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
  wrapper: {
    marginBottom: 14,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: COLORS.glass,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
  },
  containerFocused: {
    borderColor: COLORS.accent,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: { backgroundColor: `${COLORS.accent}14` },
      default: { backgroundColor: `${COLORS.accent}14` },
    }),
  },

  input: {},
  textInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 15,
  },

  inputWithicon: { marginLeft: Spacing.xs },
  inputWithRightIcon: { marginRight: Spacing.xs },
  icon: { marginRight: Spacing.xs },
  rightIcon: { marginLeft: Spacing.xs },

  helperText: {
    fontSize: Typography.fontSize.xs,
    color: COLORS.textMuted,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  errorBorder: {
    borderColor: COLORS.SEMANTIC.error,
  },
  errorText: {
    color: COLORS.SEMANTIC.error,
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
});

export default InputField;
