import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';

import { getProfile } from './api';

export function useProfile() {
  const uid = useAuthStore(s => s.user?.uid);
  return useQuery({
    queryKey: ['profile', uid],
    queryFn: () => getProfile(uid!),
    enabled: !!uid,
  });
}
