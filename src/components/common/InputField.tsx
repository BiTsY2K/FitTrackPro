import { COLORS, Spacing, Typography } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable } from 'react-native';
import { StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';

interface InputFieldProps extends TextInputProps {
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
      <View style={[styles.container, isFocused && styles.containerFocused]}>
        {icon && (
          <Ionicons
            name={icon}
            size={24}
            color={hasError ? COLORS.SEMANTIC.error : COLORS.textMuted}
            style={styles.icon}
          />
        )}

        <TextInput
          style={[
            styles.input,
            icon && styles.inputWithicon,
            (rightIcon || showPasswordToggle) && styles.inputWithRightIcon,
          ]}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
          {...props}
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  containerFocused: {
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  input: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    paddingVertical: 14,
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
  errorText: {
    color: COLORS.SEMANTIC.error,
  },
});

export default InputField;
