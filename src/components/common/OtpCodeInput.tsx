import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, TextInput, View } from 'react-native';

import { COLORS } from '@/constants/theme';

interface OtpCodeInputProps {
  value: string;
  onChange: (v: string) => void;
  onSubmitEditing?: () => void;
  verified: boolean;
  hasError: boolean;
}

export default function OtpCodeInput({ value, onChange, onSubmitEditing, verified, hasError }: OtpCodeInputProps) {
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const cellScales = useRef(Array.from({ length: 6 }, () => new Animated.Value(1))).current;

  const digits = value.split('').concat(Array(6).fill('')).slice(0, 6);

  const animateCell = (index: number) => {
    Animated.sequence([
      Animated.spring(cellScales[index], { toValue: 1.1, useNativeDriver: true, speed: 40, bounciness: 10 }),
      Animated.spring(cellScales[index], { toValue: 1, useNativeDriver: true, speed: 30 }),
    ]).start();
  };

  const handleChange = (text: string, index: number) => {
    if (verified) return;

    const cleaned = text.replace(/\D/g, '').slice(-1);
    const arr = digits.map((d, i) => (i === index ? cleaned : d));
    if (cleaned) animateCell(index);
    onChange(arr.join(''));

    if (cleaned && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      const arr = digits.map((d, i) => (i === index - 1 ? '' : d));
      onChange(arr.join(''));
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isMounted = useRef(false);

  useEffect(() => {
    const shouldFocus = !isMounted.current || hasError;
    if (!shouldFocus) return;

    isMounted.current = true;
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, [hasError]);

  return (
    <View style={style.row}>
      {digits.map((d, i) => {
        const isFilled = !!d || verified;
        return (
          <Animated.View key={i} style={[style.cellWrap, { transform: [{ scale: cellScales[i] }] }]}>
            {/* Glow behind filled */}
            {isFilled && <View style={[style.cellGlow, hasError && { backgroundColor: 'rgba(255,76,106,0.12)' }]} />}
            <TextInput
              ref={ref => {
                inputRefs.current[i] = ref;
              }}
              value={verified ? '✓' : d}
              onChangeText={t => handleChange(t, i)}
              onKeyPress={e => handleKeyPress(e, i)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoComplete="one-time-code"
              editable={!verified}
              onSubmitEditing={onSubmitEditing}
              style={[style.cell, isFilled && style.cellFilled, hasError && style.cellError, verified && style.cellVerified]}
            />
          </Animated.View>
        );
      })}
    </View>
  );
}

const style = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 28,
  },
  cellWrap: {
    flex: 1,
    position: 'relative',
  },
  cellGlow: {
    position: 'absolute',
    inset: -3,
    borderRadius: 17,
    backgroundColor: 'rgba(0,255,135,0.1)',
    // Note: blur not supported natively — use @react-native-community/blur for true blur
  },
  cell: {
    aspectRatio: 0.85,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textMuted,
    backgroundColor: COLORS.glass,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
  },
  cellFilled: {
    color: COLORS.accent,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0,255,135,0.06)',
    ...Platform.select({
      ios: {
        elevation: 4,
      },
    }),
    shadowColor: COLORS.accent,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  cellError: {
    borderColor: COLORS.error,
    color: COLORS.error,
  },
  cellVerified: {
    color: COLORS.accent,
    borderColor: COLORS.accent,
    backgroundColor: 'rgba(0,255,135,0.1)',
    fontSize: 18,
  },
});
