import { secureStorage } from '@/lib/secure-storage';

import { getLock, recordFailure } from '../api/rateLimit';

jest.mock('@/lib/secure-storage', () => {
  const mem: Record<string, string> = {};
  return {
    secureStorage: {
      getItem: jest.fn(async (k: string) => mem[k] ?? null),
      setItem: jest.fn(async (k: string, v: string) => {
        mem[k] = v;
      }),
      removeItem: jest.fn(async (k: string) => {
        delete mem[k];
      }),
    },
  };
});
jest.mock('@/lib/firebase', () => ({ functions: {} }));
jest.mock('firebase/functions', () => ({ httpsCallable: () => async () => ({}) }));

it('locks after 5 failures', async () => {
  const email = 'a@b.co';
  for (let i = 0; i < 5; i++) await recordFailure(email);
  const lock = await getLock(email);
  expect(lock.locked).toBe(true);
  expect(lock.secondsLeft).toBeGreaterThan(0);
  expect(secureStorage.setItem).toHaveBeenCalled();
});
