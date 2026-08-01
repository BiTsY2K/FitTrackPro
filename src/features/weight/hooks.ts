import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';

import { addWeight, listWeights } from './api';

export function useWeights() {
  const uid = useAuthStore(s => s.user?.uid);
  return useQuery({ queryKey: ['weights', uid], queryFn: () => listWeights(uid!), enabled: !!uid });
}

export function useAddWeight() {
  const uid = useAuthStore(s => s.user?.uid);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (kg: number) => addWeight(uid!, kg),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['weights', uid] }),
  });
}
