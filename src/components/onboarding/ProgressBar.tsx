import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/constants/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  name?: string;
  stepLabels?: string[];
}

export function ProgressBar({ currentStep, totalSteps, name, stepLabels }: ProgressBarProps) {
  const progress = Math.round((currentStep / totalSteps) * 100);

  const shimmerAnim = useRef(new Animated.Value(-1)).current;
  const shimmerTranslate = shimmerAnim.interpolate({ inputRange: [-1, 1], outputRange: [-80, 80] });
  useEffect(() => Animated.loop(Animated.timing(shimmerAnim, { toValue: 1, duration: 2000, useNativeDriver: true })).start(), []);

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <Text style={styles.stepLabel}>
          {name}: Step {currentStep} of {totalSteps}
        </Text>
        <Text style={styles.progressLabel}>{progress}% Complete</Text>
      </View>

      {/* Segmented bars */}
      <View style={styles.barsRow}>
        {Array.from({ length: totalSteps }).map((_, i) => {
          const done = i < currentStep;
          const active = i === currentStep - 1;
          return (
            <View key={i} style={[styles.bar, done ? styles.barDone : styles.barInactive, active && styles.barActive]}>
              {/* Shimmer on active segment */}
              {active && <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerTranslate }] }]} />}
            </View>
          );
        })}
      </View>

      {/* Step label pills */}
      {stepLabels && (
        <View style={styles.labelsRow}>
          {stepLabels.slice(0, totalSteps).map((label, i) => (
            <Text
              key={i}
              numberOfLines={1}
              style={[
                styles.barLabel,
                { width: `${100 / totalSteps}%` },
                i < currentStep - 1 ? styles.barLabelDone : i === currentStep - 1 ? styles.barLabelActive : styles.barLabelInactive,
              ]}
            >
              {label}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 28 },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    color: COLORS.accent,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  progressLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },

  barsRow: {
    flexDirection: 'row',
    marginBottom: 6,
    gap: 4,
  },
  bar: {
    flex: 1,
    height: 5,
    borderRadius: 10,
    overflow: 'hidden',
  },
  barInactive: { backgroundColor: COLORS.border },
  barDone: { backgroundColor: COLORS.accentDim },
  barActive: { flexGrow: 2, backgroundColor: COLORS.accent },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },

  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barLabel: { flex: 1, fontSize: 11, fontWeight: '700', marginLeft: 3 },
  barLabelInactive: { color: COLORS.textMuted },
  barLabelDone: { color: COLORS.accentDim },
  barLabelActive: { flexGrow: 2, color: COLORS.accent },
});
