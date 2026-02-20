import { COLORS } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
  label: string;
  onPress: () => void;
}

export function SocialButton({ icon, label, onPress }: SocialButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={styles.socialBtn}>
      <Ionicons name={icon} size={24} color={COLORS.textMuted} />
      <Text style={styles.socialLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 8,
  },
  socialIcon: {
    fontSize: 18,
  },
  socialLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
