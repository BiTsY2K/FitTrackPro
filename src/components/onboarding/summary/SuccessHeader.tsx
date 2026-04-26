import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

import { globalStyles } from '@/globalStyles';
import { colors, rounded, spacing } from '@/themes';

export function SuccessHeader({ children }: { children: React.ReactNode }) {
  const ringScale = useRef(new Animated.Value(0)).current;
  const checkScale = useRef(new Animated.Value(0)).current;
  const contentFade = useRef(new Animated.Value(0)).current;
  const contentSlide = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(ringScale, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 10 }),
      Animated.spring(checkScale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 14 }),
    ]).start();
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 500, delay: 300, useNativeDriver: true }),
      Animated.spring(contentSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6, delay: 300 }),
    ]).start();
  }, []);

  return (
    <View style={successStyle.container}>
      {/* ── Check Animated Ring ── */}
      <Animated.View style={[successStyle.ringOuter, { transform: [{ scale: ringScale }] }]}>
        <LinearGradient colors={[`${colors.accent.green}30`, `${colors.accent.green}10`]} style={successStyle.ringGradient}>
          <Animated.View style={[successStyle.checkCircle, { transform: [{ scale: checkScale }] }]}>
            <LinearGradient colors={[colors.accent.green, colors.accent.greenDimmed]} style={successStyle.checkGradient}>
              <Text style={successStyle.checkMark}>✓</Text>
            </LinearGradient>
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      {/* ── Text content ── */}
      <Animated.View
        style={[globalStyles.header, globalStyles.alignItemsCenter, { opacity: contentFade, transform: [{ translateY: contentSlide }] }]}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const successStyle = StyleSheet.create({
  container: { alignItems: 'center', marginBottom: 28 },
  ringOuter: {
    width: 88,
    height: 88,
    borderWidth: 1.5,
    borderRadius: rounded.full,
    borderColor: `${colors.accent.green}60`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
  },
  ringGradient: { width: 84, height: 84, borderRadius: rounded.full, alignItems: 'center', justifyContent: 'center' },
  checkCircle: { width: 60, height: 60, borderRadius: rounded.full, overflow: 'hidden' },
  checkGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: colors.surface.page, fontSize: 30, fontWeight: '900' },
});
