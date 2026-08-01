import { Text } from 'react-native';

import { ActivityStep } from '@/features/onboarding/steps/ActivityStep';
import { GoalStep } from '@/features/onboarding/steps/GoalStep';
import { StatsStep } from '@/features/onboarding/steps/StatsStep';
import { SummaryStep } from '@/features/onboarding/steps/SummaryStep';
import { TargetStep } from '@/features/onboarding/steps/TargetStep';
import { useOnboarding } from '@/features/onboarding/store';

export default function Onboarding() {
  const { step, draft } = useOnboarding();
  const skipTarget = draft.goal === 'maintain';
  // Step order: 0 Goal · 1 Stats · 2 Activity · 3 Target(optional) · 4 Summary
  const sequence = skipTarget
    ? [GoalStep, StatsStep, ActivityStep, SummaryStep]
    : [GoalStep, StatsStep, ActivityStep, TargetStep, SummaryStep];
  const Current = sequence[Math.min(step, sequence.length - 1)];
  return <>{Current !== undefined ? <Current /> : <Text>NOT DEFINED</Text>}</>;
}
