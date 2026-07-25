import { Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { signOut } from '@/features/auth/api/auth';

export default function Onboarding() {
  return (
    <>
      <Text>Onboarding</Text>
      <Button title="Sign out" variant="secondary" onPress={() => signOut()} />
    </>
  );
}
