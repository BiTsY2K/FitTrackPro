import { useEffect, useRef } from 'react';
import { StyleSheet, Text } from 'react-native';
import { Animated, TouchableOpacity, View } from 'react-native';

import { COLORS } from '@/constants/theme';
import type { ActivityOption } from '@/screens/onboarding/ActivityScreen';
import type { GoalOption } from '@/screens/onboarding/GoalSelectionScreen';
import { colors, rounded, spacing, typography } from '@/themes';

interface SelectionCardProps {
  option: GoalOption | ActivityOption;
  selected: boolean;
  onPress: () => void;
  animDelay?: number;
}

export function SelectionCard({ option, selected, onPress, animDelay = 0 }: SelectionCardProps) {
  const mountAnim = useRef(new Animated.Value(0)).current;
  const mountSlide = useRef(new Animated.Value(16)).current;
  const pressScale = useRef(new Animated.Value(1)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const radioScale = useRef(new Animated.Value(selected ? 1.1 : 1)).current;
  const stripWidth = useRef(new Animated.Value(selected ? 4 : 0)).current;

  // Mount entrance
  useEffect(() => {
    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(mountAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(mountSlide, { toValue: 0, useNativeDriver: true, speed: 14, bounciness: 6 }),
      ]).start();
    }, animDelay);
    return () => clearTimeout(t);
  }, []);

  // Selection animation //
  useEffect(() => {
    Animated.parallel([
      Animated.spring(radioScale, { toValue: selected ? 1.1 : 1, useNativeDriver: true, speed: 30, bounciness: 12 }),
      Animated.spring(iconScale, { toValue: selected ? 1.08 : 1, useNativeDriver: true, speed: 25, bounciness: 8 }),
      Animated.timing(stripWidth, { toValue: selected ? 4 : 0, duration: 200, useNativeDriver: false }), // width can't use native driver
    ]).start();
  }, [selected]);

  const onPressIn = () => Animated.spring(pressScale, { toValue: 0.975, useNativeDriver: true, speed: 50 }).start();
  const onPressOut = () => Animated.spring(pressScale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={[scStyles.cardWrapper, { opacity: mountAnim, transform: [{ translateY: mountSlide }, { scale: pressScale }] }]}>
      <TouchableOpacity activeOpacity={1} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        <View
          style={[
            scStyles.card,
            selected && {
              backgroundColor: option.accentGlow,
              borderColor: option.accentColor,
              shadowColor: option.accentColor,
              ...scStyles.selectedCardShadow,
            },
          ]}
        >
          {/* Left accent strip */}
          <Animated.View style={[scStyles.strip, { width: stripWidth, backgroundColor: option.accentColor }]} />

          {/* Icon bubble */}
          <Animated.View
            style={[
              scStyles.iconBubble,
              selected && {
                backgroundColor: `${option.accentColor}22`,
                borderColor: `${option.accentColor}55`,
              },
              { transform: [{ scale: iconScale }] },
            ]}
          >
            <Text style={scStyles.iconEmoji}>{option.iconEmoji}</Text>
          </Animated.View>

          {/* Text content */}
          <View style={scStyles.textBlock}>
            {/* Title row */}
            <View style={scStyles.titleRow}>
              <Text style={[scStyles.title, selected && { color: option.accentColor }]}>{option.title}</Text>
              {option.tag && (
                <View style={[scStyles.tagBadge, { backgroundColor: `${option.accentColor}18`, borderColor: `${option.accentColor}40` }]}>
                  <Text style={[scStyles.tagText, { color: option.accentColor }]}>{option.tag}</Text>
                </View>
              )}
            </View>

            {/* Description */}
            <Text style={[scStyles.description, selected && { color: `${option.accentColor}BB` }]} numberOfLines={2}>
              {option.description}
            </Text>

            <View style={scStyles.bottomRow}>
              {/* Intensity dots */}
              {option.type === 'activity' && (
                <View style={scStyles.dotsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        scStyles.dot,
                        i < option.intensity
                          ? selected
                            ? { backgroundColor: option.accentColor }
                            : { backgroundColor: colors.surface.lightGlass }
                          : scStyles.dotEmpty,
                      ]}
                    />
                  ))}
                </View>
              )}

              {/* Stat/TDEE chip */}
              <View
                style={[
                  scStyles.statChip,
                  selected && { backgroundColor: `${option.accentColor}15`, borderColor: `${option.accentColor}30` },
                ]}
              >
                <View style={[scStyles.statDot, { backgroundColor: selected ? option.accentColor : COLORS.textMuted }]} />
                <Text style={[scStyles.statText, selected && { color: option.accentColor }]}>{option.stat}</Text>
              </View>
            </View>
          </View>

          {/* Radio button */}
          <Animated.View
            style={[
              scStyles.radio,
              selected && {
                borderColor: option.accentColor,
                backgroundColor: option.accentColor,
                shadowColor: option.accentColor,
              },
              { transform: [{ scale: radioScale }] },
            ]}
          >
            {selected && <Text style={scStyles.radioCheck}>✓</Text>}
          </Animated.View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const scStyles = StyleSheet.create({
  cardWrapper: {
    overflow: 'hidden',
    borderRadius: rounded.xl2 - 4,
    backgroundColor: colors.surface.raised,
  },
  card: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing['3.5'],

    borderWidth: 1.5,
    borderRadius: rounded.xl2 - 4,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.raised,
    padding: spacing.md,
    overflow: 'hidden',
  },

  selectedCardShadow: {
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 80,
  },

  strip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: rounded.xl2 - 4,
    borderBottomLeftRadius: rounded.xl2 - 4,
  },
  iconBubble: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,

    borderWidth: 1,
    borderRadius: rounded.xl,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
  },
  iconEmoji: { fontSize: 24 },

  textBlock: { flex: 1, minWidth: 0 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing['1.5'] },
  title: { color: colors.content.primary, fontSize: typography.size.md, fontWeight: typography.weight.extrabold, lineHeight: 18 },
  tagBadge: { borderWidth: 1, borderRadius: rounded.sm, paddingHorizontal: spacing.xs, paddingVertical: spacing[0.5] },
  tagText: { fontSize: typography.size.xs - 2, fontWeight: typography.weight.extrabold, letterSpacing: 0.8, textTransform: 'uppercase' },
  description: { color: colors.content.tertiary, fontSize: typography.size.xs, lineHeight: typography.height.xs, marginBottom: spacing.xs },

  bottomRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dotsRow: { flexDirection: 'row', gap: spacing.xs1 },
  dot: { width: 12, height: 6, borderRadius: rounded.full },
  dotEmpty: { backgroundColor: colors.surface.glass },

  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['1.5'],
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: rounded.md,
    borderColor: colors.border.default,
    backgroundColor: colors.surface.glass,
    paddingHorizontal: spacing['2.5'],
    paddingVertical: spacing.xs1,
  },
  statDot: { width: 5, height: 5, borderRadius: rounded.full },
  statText: { color: colors.content.tertiary, fontSize: typography.size.xs, fontWeight: typography.weight.bold },

  radio: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,

    borderWidth: 1.5,
    borderRadius: rounded.full,
    borderColor: colors.border.default,
    backgroundColor: 'transparent',
  },
  radioCheck: { color: 'transparent', fontSize: typography.size.xs, fontWeight: typography.weight.extrabold },
});
