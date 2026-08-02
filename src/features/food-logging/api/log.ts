import { addDoc, collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';

import { db } from '@/lib/firebase';

import type { FoodEntry } from '../types';

/** Local-date key (logs are keyed by the user's calendar day). */
export function dateKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const entriesPath = (uid: string, key: string) => `users/${uid}/logs/${key}/entries`;

export async function addEntry(uid: string, key: string, entry: FoodEntry): Promise<string> {
  const ref = await addDoc(collection(db, entriesPath(uid, key)), { ...entry, _optimistic: false });
  return ref.id;
}

export async function deleteEntry(uid: string, key: string, id: string): Promise<void> {
  await deleteDoc(doc(db, `${entriesPath(uid, key)}/${id}`));
}

/** Real-time subscription to a day's entries (ordered). */
export function subscribeDay(uid: string, key: string, cb: (entries: FoodEntry[]) => void) {
  const q = query(collection(db, entriesPath(uid, key)), orderBy('createdAt', 'asc'));
  return onSnapshot(q, snap => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as FoodEntry) }))));
}
