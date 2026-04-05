import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors, rounded, spacing, typography } from '@/themes';

export function Divider({ label }: { label: string }) {
  return (
    <View style={styles.dividerRow}>
      <View style={styles.line} />
      <Text style={styles.dividerLabel}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

interface SocialButtonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: 'Google' | 'Apple';
  onPress: () => void;
}

export function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.socialBtn}>
      <Ionicons name={icon} size={24} color={colors.content.tertiary} />
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: spacing[3] },
  line: { flex: 1, height: spacing.px, backgroundColor: colors.border.default },

  dividerLabel: {
    color: colors.content.tertiary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
    paddingHorizontal: spacing.xs1,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing.md,

    borderWidth: 1,
    borderRadius: rounded.xl,
    backgroundColor: colors.surface.glass,
    borderColor: colors.border.default,
  },

  socialLabel: {
    color: colors.content.primary,
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
});
