import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';
import { secureStorage } from '@/lib/secure-storage';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;

interface LocalState { count: number, first: number, lockedUntil: number } // prettier-ignore

const key = (email: string) => `authlock:${email.toLocaleLowerCase()}`;

export async function getLock(email: string): Promise<{
  locked: boolean;
  secondsLeft: number;
}> {
  const raw = await secureStorage.getItem(key(email));
  if (!raw) return { locked: false, secondsLeft: 0 };

  const s = JSON.parse(raw) as LocalState;
  const left = Math.ceil((s.lockedUntil - Date.now()) / 1000);
  return { locked: left > 0, secondsLeft: Math.max(0, left) };
}

export async function recordFailure(email: string): Promise<void> {
  const raw = await secureStorage.getItem(key(email));
  const now = Date.now();
  let s: LocalState = raw ? JSON.parse(raw) : { count: 0, first: now, lockedUntil: 0 };
  if (now - s.first > WINDOW_MS) s = { count: 0, first: now, lockedUntil: 0 }; // window-reset

  s.count += 1;
  if (s.count >= MAX_ATTEMPTS) s.lockedUntil = now + WINDOW_MS; // exponential variants possible
  await secureStorage.setItem(key(email), JSON.stringify(s));

  // Mirror to server for monitoring + cross-device account lock (App Check enforced).
  try {
    await httpsCallable(functions, 'recordAuthAttempt')({ email, success: false });
  } catch {
    /* non-blocking */
  }
}

export async function recordSuccess(email: string): Promise<void> {
  await secureStorage.removeItem(key(email));
  try {
    await httpsCallable(functions, 'recordAuthAttempt')({ email, success: true });
  } catch {
    /* non-blocking */
  }
}
