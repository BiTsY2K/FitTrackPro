import { createHash } from 'node:crypto';

import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { beforeUserSignedIn } from 'firebase-functions/v2/identity';

const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000;
const hash = (email: string) => createHash('sha256').update(email.toLowerCase()).digest('hex');

// Client reports attempts (App Check enforced). Authoritative throttling is Firebase Auth itself;
// this layer adds cross-device account lock + monitoring.
export const recordAuthAttempt = onCall({ enforceAppCheck: true }, async req => {
  const email = String(req.data?.email ?? '');
  const success = Boolean(req.data?.success);
  if (!email) throw new HttpsError('invalid-argument', 'email required');
  const ref = getFirestore().doc(`authAttempts/${hash(email)}`);
  const now = Date.now();

  if (success) {
    await ref.delete().catch(() => undefined);
    return { ok: true };
  }

  const snap = await ref.get();
  const data = snap.exists ? snap.data()! : { count: 0, first: now };
  const windowed = now - (data.first ?? now) > WINDOW_MS ? { count: 0, first: now } : data;
  const count = (windowed.count ?? 0) + 1;
  const lockedUntil = count >= MAX ? now + WINDOW_MS : 0;
  await ref.set({ count, first: windowed.first, lockedUntil, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
  return { ok: true, locked: lockedUntil > now, lockedUntil };
});

// Blocking function: rejects sign-in (even with correct password) during an active lock window.
// Requires Identity Platform (GCIP) upgrade.
export const beforeSignIn = beforeUserSignedIn(async event => {
  const email = event.data?.email;
  if (!email) return;
  const snap = await getFirestore()
    .doc(`authAttempts/${hash(email)}`)
    .get();
  const lockedUntil = snap.exists ? (snap.data()!.lockedUntil ?? 0) : 0;
  if (lockedUntil > Date.now()) {
    throw new HttpsError('permission-denied', 'Account temporarily locked due to repeated failures. Try again later.');
  }
});
