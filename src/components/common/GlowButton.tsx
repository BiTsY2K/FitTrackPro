import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { COLORS } from '@/constants/theme';
import { colors, rounded, spacing, typography } from '@/themes';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;

  icon?: string;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
}

export function GlowButton({
  label,
  onPress,
  disabled = false,
  loading = false,
  loadingLabel = 'Please wait',
  icon,
  variant = 'primary',
  style,
}: GlowButtonProps) {
  const isPrimary = variant === 'primary';

  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[styles.base, isPrimary ? styles.primary : styles.ghost, (disabled || loading) && styles.disabled]}
      >
        {isPrimary && !disabled && !loading ? (
          <LinearGradient
            colors={[COLORS.accent, COLORS.accentDim]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.inner, styles.innerDisabled]}
          >
            <Text style={styles.labelPrimary}>{loading ? 'Please wait…' : label}</Text>
            {!loading && icon && <Text style={styles.iconPrimary}>{icon}</Text>}
          </LinearGradient>
        ) : (
          <View style={[styles.inner, styles.innerDisabled]}>
            <Text style={[styles.label, isPrimary && !disabled ? styles.labelPrimary : styles.labelTertiary]}>
              {loading ? loadingLabel : label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing[3] },
  base: { borderRadius: rounded.xl, overflow: 'hidden' },

  primary: {
    shadowColor: colors.accent.green,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  ghost: { borderWidth: 1, borderColor: colors.border.DEFAULT, backgroundColor: colors.surface.glass },
  disabled: { shadowOpacity: 0, elevation: 0 },
  inner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[4] + 1, gap: spacing[2] },
  innerDisabled: { backgroundColor: '#1E1E2A' },

  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
  labelPrimary: { color: COLORS.bg, fontSize: typography.size.md - 1, fontWeight: typography.weight.bold, letterSpacing: 0.4 },
  labelTertiary: { color: colors.content.tertiary },

  iconPrimary: { color: COLORS.bg, fontSize: 16, fontWeight: '800' },
});

export default GlowButton;
