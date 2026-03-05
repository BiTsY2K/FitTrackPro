import { COLORS } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface GlowButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

export default function GlowButton({ label, onPress, variant = 'primary', style, disabled = false, loading = false }: GlowButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const isPrimary = variant === 'primary';

  return (
    <Animated.View style={[{ transform: [{ scale }], marginBottom: 12 }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={() => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 50 }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start()}
        disabled={disabled || loading}
        activeOpacity={1}
        style={[styles.base, isPrimary ? styles.primary : styles.ghost, (disabled || loading) && styles.disabled]}
      >
        {isPrimary && !disabled && !loading ? (
          <LinearGradient colors={[COLORS.accent, COLORS.accentDim]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.gradient}>
            <Text style={styles.labelPrimary}>{label}</Text>
          </LinearGradient>
        ) : (
          <View style={styles.gradient}>
            <Text style={[styles.label, isPrimary && !disabled ? styles.labelPrimary : styles.labelMuted]}>
              {loading ? 'Verifying…' : label}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, overflow: 'hidden' },
  primary: {
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  ghost: {
    backgroundColor: COLORS.glass,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  gradient: {
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A3A',
  },

  label: { fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
  labelPrimary: { color: COLORS.bg, fontSize: 15, fontWeight: '700', letterSpacing: 0.4 },
  labelMuted: { color: COLORS.textMuted },

  btn: {
    borderRadius: 16,
    backgroundColor: COLORS.accent,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 12,
      },
    }),
  },
});
