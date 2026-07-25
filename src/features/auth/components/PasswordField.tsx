import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import { View } from 'react-native';

import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/tokens';

export function PasswordField(props: { label: string; value: string; onChangeText: (t: string) => void; error?: string }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View>
      <TextField {...props} secureTextEntry={hidden} autoCapitalize="none" textContentType="password" />
      <Pressable
        accessibilityRole="button"
        onPress={() => setHidden(h => !h)}
        hitSlop={8}
        style={{ position: 'absolute', right: 12, top: 28 }}
      >
        <Text style={{ color: colors.brand, fontSize: 13 }}>{hidden ? 'Show' : 'Hide'}</Text>
      </Pressable>
    </View>
  );
}
