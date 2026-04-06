import { StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';

import { colors, spacing, typography } from '@/themes';

interface SectionLabelProps {
  icon?: string;
  children: string;
  styleContainerView?: StyleProp<ViewStyle>;
  styleIconView?: StyleProp<TextStyle>;
  styleLabelView?: StyleProp<TextStyle>;
  styleLineView?: StyleProp<ViewStyle>;
}

const SectionLabel = ({ icon, children, styleContainerView, styleIconView, styleLabelView, styleLineView }: SectionLabelProps) => {
  return (
    <View style={[sectionLabel.row, styleContainerView]}>
      {icon && <Text style={[sectionLabel.icon, styleIconView]}>{icon}</Text>}
      <Text style={[sectionLabel.label, styleLabelView]}>{children}</Text>
      <View style={[sectionLabel.line, styleLineView]} />
    </View>
  );
};

SectionLabel.displayName = 'SectionLabel';
export { SectionLabel };

const sectionLabel = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    flexShrink: 1,
    marginBottom: spacing[3],
    marginTop: spacing[1],
  },
  icon: { fontSize: typography.size.sm },
  label: {
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.content.tertiary,
    fontSize: typography.size.xs,
    fontWeight: typography.weight.bold,
  },
  line: { flex: 1, height: spacing.px, backgroundColor: colors.border.default },
});
