import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient, LinearGradientPoint } from 'expo-linear-gradient';
import { ColorValue } from 'react-native';
import { StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

interface Props {
  children: string;
  textStyle?: StyleProp<TextStyle>;
  gradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  start?: LinearGradientPoint | null | undefined;
  end?: LinearGradientPoint | null | undefined;
}

export function GradientText({ children, textStyle, gradientColors = ['#ff7e5f', '#feb47b'] }: Props) {
  return (
    <MaskedView maskElement={<Text style={[textStyle]}>{children}</Text>}>
      <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[textStyle, styles.textOpacity]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  textOpacity: { opacity: 0 },
});

export default GradientText;
