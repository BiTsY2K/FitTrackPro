import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react-native';

import Login from '@/../app/(auth)/login';

jest.mock('@/features/auth/hooks/useAuthActions', () => ({
  useLogin: () => ({ mutate: jest.fn(), isPending: false, error: null }),
  useGoogle: () => ({ mutate: jest.fn(), isPending: false }),
  useApple: () => ({ mutate: jest.fn(), isPending: false }),
}));
jest.mock('expo-router', () => {
  const { Text } = require('react-native');
  return {
    Link: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    useRouter: () => ({ replace: jest.fn() }),
  };
});

const wrap = (ui: React.ReactElement) => render(<QueryClientProvider client={new QueryClient()}>{ui}</QueryClientProvider>);

it('shows a validation error for an invalid email', async () => {
  await wrap(<Login />);
  await fireEvent.changeText(screen.getByLabelText('Email'), 'not-an-email');
  await fireEvent.press(screen.getByRole('button', { name: 'Log in' }));
  expect(screen.getByText('Enter a valid email')).toBeTruthy();
});
