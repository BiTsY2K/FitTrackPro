import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import { typography } from '@/themes';

export function ErrorView({ errors, onBack }: { errors: string[]; onBack: () => void }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={errorViewStyles.container}>
      <Animated.View style={[errorViewStyles.iconBox, { transform: [{ translateX: shakeAnim }] }]}>
        <Text style={{ fontSize: typography.size.xl5 }}>⚠️</Text>
      </Animated.View>
      <Text style={errorViewStyles.title}>Oops, something went wrong</Text>
      {errors.map((e, i) => (
        <View key={i} style={errorViewStyles.errorRow}>
          <View style={errorViewStyles.errorDot} />
          <Text style={errorViewStyles.errorText}>{e}</Text>
        </View>
      ))}
      <TouchableOpacity onPress={onBack} style={errorViewStyles.btn} activeOpacity={0.8}>
        <Text style={errorViewStyles.btnText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const errorViewStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconBox: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(255,76,106,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,76,106,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { color: COLORS.text, fontSize: 20, fontWeight: '800', marginBottom: 16, textAlign: 'center' },
  errorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  errorDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.error, marginTop: 5 },
  errorText: { color: COLORS.error, fontSize: 13, lineHeight: 20, flex: 1 },
  btn: {
    marginTop: 24,
    backgroundColor: COLORS.bgCard,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  btnText: { color: COLORS.textMuted, fontSize: 14, fontWeight: '700' },
});
