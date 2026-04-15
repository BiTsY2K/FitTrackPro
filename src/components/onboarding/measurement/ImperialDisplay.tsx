import { useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

import { colors, rounded, spacing, typography } from '@/themes';

interface ImperialDisplayProp {
  label: string;
  icon: string;
  primaryValue: string | number;
  primaryUnit: string;
  secondaryValue?: string | number;
  secondaryUnit?: string;
  styleContainerView?: ViewStyle;
  onPress?: () => void;
}

const ImperialDisplay: React.FC<ImperialDisplayProp> = ({
  label,
  icon,
  primaryValue,
  primaryUnit,
  secondaryValue,
  secondaryUnit,
  styleContainerView,
  onPress,
}) => {
  const pressScale = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.98, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[{ transform: [{ scale: pressScale }] }, styleContainerView]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={1} style={impStyles.field}>
        <Text style={impStyles.icon}>{icon}</Text>
        <View style={[impStyles.textBlock]}>
          <Text style={impStyles.fieldLabel}>{label}</Text>
          <View style={impStyles.fieldValue}>
            <View style={impStyles.valueGroup}>
              <Text style={impStyles.valueText}>{primaryValue}</Text>
              <Text style={impStyles.valueUnit}>{primaryUnit}</Text>
            </View>

            {secondaryValue !== undefined && (
              <View style={impStyles.valueGroup}>
                <Text style={impStyles.valueText}>{secondaryValue}</Text>
                <Text style={impStyles.valueUnit}>{secondaryUnit}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={impStyles.readOnlyBadge}>
          <Text style={impStyles.readOnlyText}>Switch to Metric to edit</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

ImperialDisplay.displayName = 'ImperialDisplay';
export { ImperialDisplay };

const impStyles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['3.5'],
    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing['3.5'],
  },

  icon: { fontSize: typography.size.xl2 },
  textBlock: { flex: 1, flexShrink: 1, minWidth: 0 },
  fieldLabel: { color: colors.content.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  fieldValue: { flexDirection: 'row', alignItems: 'baseline', gap: spacing[2] },
  valueGroup: { flexDirection: 'row', alignItems: 'baseline', gap: spacing['0.5'] },
  valueText: { color: colors.content.primary, fontSize: typography.size.lg, fontWeight: typography.weight.extrabold, letterSpacing: -0.3 },
  valueUnit: { color: colors.content.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },

  readOnlyBadge: {
    borderWidth: 1,
    borderRadius: rounded.md,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing['1.5'],
  },
  readOnlyText: { color: colors.content.tertiary, fontSize: 10, fontWeight: '600' },
});
