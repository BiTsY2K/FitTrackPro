import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { LOADING_STEPS } from '@/constants/onboarding';
import { colors, rounded, spacing, typography } from '@/themes';

export function LoadingView() {
  const [stepIdx, setStepIdx] = useState<number>(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeText = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    if (stepIdx >= LOADING_STEPS.length - 1) return;
    const t = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeText, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(fadeText, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      setStepIdx(s => Math.min(s + 1, LOADING_STEPS.length - 1));
    }, 650);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={loadingStyles.container}>
      {/* ── Pulsing ring ── */}
      <Animated.View style={[loadingStyles.ringOuter, { transform: [{ scale: pulseAnim }] }]}>
        <LinearGradient colors={[`${colors.accent.green}30`, `${colors.accent.green}10`]} style={loadingStyles.ringMiddOuterGradient}>
          <Animated.View style={loadingStyles.ringMiddInnerGradient}>
            <LinearGradient colors={[colors.accent.green, colors.accent.greenDimmed]} style={loadingStyles.ringInnerGradient}>
              <Text style={loadingStyles.stepIcon}>{LOADING_STEPS[stepIdx].icon}</Text>
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Text style={loadingStyles.title}>Building your plan</Text>
      <Animated.Text style={[loadingStyles.stepText, { opacity: fadeText }]}>{LOADING_STEPS[stepIdx].text}</Animated.Text>

      {/* ── Progress dots ── */}
      <View style={loadingStyles.dotsRow}>
        {LOADING_STEPS.map((_, i) => (
          <View key={i} style={[loadingStyles.dot, i <= stepIdx && loadingStyles.dotActive, i === stepIdx && loadingStyles.dotCurrent]} />
        ))}
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[20] },
  ringOuter: { width: 88, height: 88, borderWidth: 1.5, borderRadius: rounded.full, borderColor: `${colors.accent.green}60`,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing[5] }, // prettier-ignore
  ringMiddOuterGradient: { width: 84, height: 84, borderRadius: rounded.full, alignItems: 'center', justifyContent: 'center' },
  ringMiddInnerGradient: { width: 62, height: 62, borderRadius: rounded.full, backgroundColor: colors.surface.raised, 
    alignItems: 'center', justifyContent: 'center' }, // prettier-ignore

  ringInnerGradient: { width: 60, height: 60, borderRadius: rounded.full, overflow: 'hidden',
    alignItems: 'center', justifyContent: 'center' }, // prettier-ignore
  stepIcon: { color: colors.surface.page, fontSize: typography.size.xl3, fontWeight: '900' },
  title: { color: colors.content.primary, fontSize: typography.size.lg, fontWeight: typography.weight.extrabold, marginBottom: 8 },
  stepText: { color: colors.content.tertiary, fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20 },
  dotsRow: { flexDirection: 'row', gap: spacing['1.5'], marginTop: spacing.lg },
  dot: { width: 6, height: 6, borderRadius: rounded.full, backgroundColor: colors.border.default },
  dotActive: { backgroundColor: colors.brand.dim, width: 18 },
  dotCurrent: { backgroundColor: colors.accent.green },
});
