import { render, screen } from '@testing-library/react-native';

import { EnvironmentBanner } from '@/components/EnvironmentBanner';

jest.mock('@/config/env', () => ({
  env: { APP_ENV: 'staging' },
  isProd: false,
}));

it('shows the environment label in non-prod', async () => {
  await render(<EnvironmentBanner />);
  expect(screen.getByText('STAGING')).toBeTruthy();
});
