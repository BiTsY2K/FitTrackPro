import { Platform } from 'react-native';
import { View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { spacing } from '@/theme/tokens';

import { useApple,useGoogle } from '../hooks/useAuthActions';

export function SocialButtons() {
  const google = useGoogle();
  const apple = useApple();
  return (
    <View style={{ gap: spacing.sm }}>
      <Button title="Continue with Google" variant="secondary" loading={google.isPending} onPress={() => google.mutate()} />
      {Platform.OS === 'ios' && (
        <Button title="Continue with Apple" variant="secondary" loading={apple.isPending} onPress={() => apple.mutate()} />
      )}
    </View>
  );
}
