import React, { useEffect, useRef } from 'react';
import { Animated,StyleSheet, Text, View } from 'react-native';

import { BorderRadius,Colors, Spacing, Typography } from '@/constants/theme';
import { validatePasswordStrength } from '@/utils/security';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  if (!password) return null;

  const validation = validatePasswordStrength(password);
  const { strength, errors } = validation;

  const strengthConfig = {
    fair: { color: Colors.error, width: '10%', label: 'Fair' },
    weak: { color: Colors.warning, width: '33%', label: 'Weak' },
    medium: { color: Colors.success, width: '66%', label: 'Medium' },
    strong: { color: Colors.success, width: '100%', label: 'Strong' },
  };

  const config = strengthConfig[strength];
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const percentage =
      strength === 'fair' ? 10 : strength === 'weak' ? 33 : strength === 'medium' ? 66 : 100;

    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 300,
      useNativeDriver: false, // width requires false
    }).start();
  }, [strength]);

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              backgroundColor: config.color,
              width: animatedWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />

        <View
          style={[styles.bar, { width: Number(config.width), backgroundColor: config.color }]}
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={[styles.strengthLabel, { color: config.color }]}>{config.label}</Text>

        {errors.length > 0 && (
          <View style={styles.errorsContainer}>
            {errors.map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {`○ ${error}`}
              </Text>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  barContainer: {
    height: 4,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  textContainer: {
    marginTop: Spacing.xs,
  },
  strengthLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  errorsContainer: {
    marginTop: Spacing.xs,
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
});
