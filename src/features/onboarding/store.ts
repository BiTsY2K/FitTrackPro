import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { kv } from '@/lib/kv';

import type { OnboardingDraft } from './types';

interface OnboardingState {
  step: number;
  draft: OnboardingDraft;
  setDraft: (patch: Partial<OnboardingDraft>) => void;
  next: () => void;
  back: () => void;
  goTo: (step: number) => void;
  reset: () => void;
}

export const useOnboarding = create<OnboardingState>()(
  persist(
    set => ({
      step: 0,
      draft: {},
      setDraft: patch => set(s => ({ draft: { ...s.draft, ...patch } })),
      next: () => set(s => ({ step: s.step + 1 })),
      back: () => set(s => ({ step: Math.max(0, s.step - 1) })),
      goTo: step => set({ step }),
      reset: () => set({ step: 0, draft: {} }),
    }),
    { name: 'onboarding-draft', storage: createJSONStorage(() => kv) },
  ),
);
