import { useMutation } from '@tanstack/react-query';

import { useAuthStore } from '@/features/auth/store';
import { createProfile } from '@/features/profiles/api';
import { AnalyticsEvent, logEvent } from '@/lib/analytics';
import { buildPlan } from '@/lib/nutrition/engine';

import { useOnboarding } from '../store';
import type { OnboardingDraft } from '../types';

export function useCompleteOnboarding() {
  const uid = useAuthStore(s => s.user?.uid);
  const setAuth = useAuthStore(s => s.set);
  const reset = useOnboarding(s => s.reset);

  return useMutation({
    mutationFn: async (
      d: Required<Omit<OnboardingDraft, 'targetKg' | 'paceKgPerWeek'>> & Pick<OnboardingDraft, 'targetKg' | 'paceKgPerWeek'>,
    ) => {
      const pace = d.goal === 'maintain' ? 0 : (d.paceKgPerWeek ?? 0.5);
      const plan = buildPlan({ sex: d.sex, age: d.age, heightCm: d.heightCm, weightKg: d.weightKg }, d.goal, d.activityLevel, pace);
      await createProfile(uid!, {
        sex: d.sex,
        age: d.age,
        heightCm: d.heightCm,
        startWeightKg: d.weightKg,
        targetKg: d.goal === 'maintain' ? null : (d.targetKg ?? null),
        goal: d.goal,
        activityLevel: d.activityLevel,
        units: 'metric',
        plan,
      });
    },
    onSuccess: () => {
      logEvent(AnalyticsEvent.OnboardingComplete);
      setAuth({ profileComplete: true }); // guard now lets the user into (app)
      reset();
    },
  });
}
