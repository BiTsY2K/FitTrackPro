import { collection, doc, getDoc, writeBatch } from '@firebase/firestore';

import { db } from '@/lib/firebase';

import { UserProfile } from './types';

const SCHEMA_VERSION = 1;

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, `users/${uid}/profile/main`));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Writes profile + settings + first weigh-in atomically. */
export async function createProfile(uid: string, profile: Omit<UserProfile, 'schemaVersion' | 'createdAt' | 'updatedAt'>): Promise<void> {
  const now = Date.now();
  const batch = writeBatch(db);
  batch.set(doc(db, `users/${uid}/profile/main`), {
    ...profile,
    schemaVersion: SCHEMA_VERSION,
    createdAt: now,
    updatedAt: now,
  });

  batch.set(doc(db, `users/${uid}/settings/main`), {
    units: profile.units,
    notif: { breakfast: true, dinner: true, water: true },
    premium: false,
    createdAt: now,
  });

  const weightRef = doc(collection(db, `users/${uid}/weights`));
  batch.set(weightRef, { kg: profile.startWeightKg, takenAt: now });
  await batch.commit();
}
