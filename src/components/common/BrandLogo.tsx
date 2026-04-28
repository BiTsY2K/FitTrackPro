import { LinearGradient } from 'expo-linear-gradient';
import { Text, TextStyle, View, ViewStyle } from 'react-native';
import { StyleProp } from 'react-native';

import { globalStyles } from '@/globalStyles';
import { colors } from '@/themes';

interface BrandLogoProps {
  containerStyle?: StyleProp<ViewStyle>;
  badgeStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<TextStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ containerStyle, badgeStyle, iconStyle, textStyle }) => {
  return (
    <View style={[globalStyles.logoRow, containerStyle]}>
      <LinearGradient colors={[colors.accent.green, colors.accent.purple]} style={[globalStyles.logoBadge, badgeStyle]}>
        <Text style={[globalStyles.logoIcon, iconStyle]}>⚡</Text>
      </LinearGradient>

      <Text style={[globalStyles.logoText, textStyle]}>FitTrack PRO</Text>
    </View>
  );
};
