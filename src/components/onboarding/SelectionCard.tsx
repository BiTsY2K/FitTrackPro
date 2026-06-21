import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BorderRadius, Colors, Shadows,Spacing, Typography } from '@/constants/theme';

interface SelectionCardProps {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({ title, description, icon, selected, onPress }) => {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && styles.cardPressed]}>
      <View style={[styles.iconContainer, selected && styles.iconContainerSelected]}>
        <Ionicons name={icon} size={32} color={selected ? Colors.primary[400] : Colors.gray[400]} />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {selected && (
        <View style={styles.checkmark}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.primary[400]} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  cardSelected: {
    borderColor: Colors.primary[400],
    backgroundColor: Colors.primary[50],
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  iconContainerSelected: {
    backgroundColor: Colors.primary[100],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  checkmark: {
    marginLeft: Spacing.sm,
  },
});
