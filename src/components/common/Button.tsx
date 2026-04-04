import { LinearGradient } from 'expo-linear-gradient';
import React, { ReactNode, useRef } from 'react';
import { ActivityIndicator, Animated, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';

import { colors, rounded, spacing, typography } from '@/themes';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

function getVariantStyles(variant: ButtonVariant, disabled: boolean) {
  const variants = {
    primary: {
      container: {
        backgroundColor: disabled ? colors.surface.disabled : colors.accent.green,
        borderWidth: 0,
        shadowColor: disabled ? 'transparent' : colors.accent.green,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: disabled ? 0 : 0.3,
        shadowRadius: 12,
        elevation: disabled ? 0 : 8,
      },
      text: {
        color: disabled ? colors.content.disabled : colors.content.inverse,
        fontWeight: typography.weight.bold as TextStyle['fontWeight'],
      },
      gradientColors: [colors.accent.green, colors.accent.greenDimmed],
      loaderColor: colors.content.inverse,
    },
    secondary: {
      container: {
        backgroundColor: disabled ? colors.surface.disabled : colors.accent.greenDimmed,
        borderWidth: 0,
      },
      text: {
        color: disabled ? colors.content.disabled : colors.content.primary,
        fontWeight: typography.weight.semibold as TextStyle['fontWeight'],
      },
      loaderColor: colors.content.primary,
    },
    outline: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: disabled ? colors.border.default : colors.border.brand,
      },
      text: {
        color: disabled ? colors.content.disabled : colors.content.primary,
        fontWeight: typography.weight.semibold as TextStyle['fontWeight'],
      },
      loaderColor: colors.content.primary,
    },
    ghost: {
      container: {
        backgroundColor: 'transparent',
        borderWidth: 0,
      },
      text: {
        color: disabled ? colors.content.disabled : colors.content.secondary,
        fontWeight: typography.weight.medium as TextStyle['fontWeight'],
      },
      loaderColor: colors.content.secondary,
    },
    danger: {
      container: {
        backgroundColor: disabled ? colors.surface.disabled : colors.feedback.error,
        borderWidth: 0,
        shadowColor: disabled ? 'transparent' : colors.feedback.error,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: disabled ? 0 : 0.3,
        shadowRadius: 12,
        elevation: disabled ? 0 : 8,
      },
      text: {
        color: disabled ? colors.content.disabled : '#FFFFFF',
        fontWeight: typography.weight.bold as TextStyle['fontWeight'],
      },
      loaderColor: '#FFFFFF',
    },
    success: {
      container: {
        backgroundColor: disabled ? colors.surface.disabled : colors.feedback.success,
        borderWidth: 0,
      },
      text: {
        color: disabled ? colors.content.disabled : '#FFFFFF',
        fontWeight: typography.weight.bold as TextStyle['fontWeight'],
      },
      loaderColor: '#FFFFFF',
    },
  };

  return variants[variant];
}

function getSizeStyles(size: ButtonSize) {
  const sizes = {
    sm: {
      container: { paddingVertical: spacing[2], paddingHorizontal: spacing[3], minHeight: 36 },
      text: { fontSize: typography.size.xs, lineHeight: typography.size.xs * 1.4 },
    },
    md: {
      container: { paddingVertical: spacing[3], paddingHorizontal: spacing[4], minHeight: 48 },
      text: { fontSize: typography.size.sm, lineHeight: typography.size.sm * 1.4 },
    },
    lg: {
      container: { paddingVertical: spacing[4], paddingHorizontal: spacing[5], minHeight: 56 },
      text: { fontSize: typography.size.md, lineHeight: typography.size.md * 1.4 },
    },
  };

  return sizes[size];
}

interface ButtonProps {
  label?: string;
  children?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;

  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;

  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;

  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;

  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = (
  /* prettier-ignore */
  { label, children, leftIcon, rightIcon, onPress, disabled = false, loading = false,
      variant = 'primary', size = 'lg', fullWidth = false, style, textStyle, accessibilityLabel, accessibilityHint, testID,
  },
) => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  const isDisabled = disabled || loading;
  const variantStyles = getVariantStyles(variant, isDisabled);
  const sizeStyles = getSizeStyles(size);

  const renderContent = () => {
    const displayText = children || label || '';

    return (
      <View style={styles.contentContainer}>
        {!loading && leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        {loading && <ActivityIndicator size="small" color={variantStyles.loaderColor} style={styles.loader} />}
        <Text style={[styles.baseText, sizeStyles.text, variantStyles.text, textStyle]} numberOfLines={1}>
          {loading ? 'Loading...' : displayText}
        </Text>
        {!loading && rightIcon && <View style={styles.iconContainer}>{rightIcon}</View>}
      </View>
    );
  };

  const shouldUseGradient = variant === 'primary' && !isDisabled; // Primary variant uses gradient

  return (
    <Animated.View style={[styles.container, fullWidth && styles.fullWidth, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel={accessibilityLabel || (typeof label === 'string' ? label : undefined)}
        accessibilityHint={accessibilityHint}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        testID={testID}
        style={[styles.touchable, sizeStyles.container, variantStyles.container, isDisabled && styles.disabled]}
      >
        {shouldUseGradient ? (
          <LinearGradient colors={[colors.accent.green, 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            {renderContent()}
          </LinearGradient>
        ) : (
          renderContent()
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: spacing[3] },
  fullWidth: { width: '100%' },
  touchable: { borderRadius: rounded.xl, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  disabled: { opacity: 0.6 },
  gradient: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  contentContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing[2] },
  baseText: { textAlign: 'center', letterSpacing: 0.3 },
  iconContainer: { justifyContent: 'center', alignItems: 'center' },
  loader: { marginRight: spacing[1] },
});

// ═══════════════════════════════════════════════════════════════
// Export
// ═══════════════════════════════════════════════════════════════

export default Button;
