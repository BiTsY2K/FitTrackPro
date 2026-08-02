import { collection, deleteDoc, doc, getDocs, setDoc } from 'firebase/firestore';

import { db } from '@/lib/firebase';
import { kv } from '@/lib/kv';

import type { FoodItem } from '../types';

const RECENTS_KEY = 'food:recents';
const MAX_RECENTS = 20;

export function getRecents(): FoodItem[] {
  try {
    return JSON.parse(kv.getItem(RECENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecent(item: FoodItem): void {
  const list = getRecents().filter(f => f.id !== item.id);
  list.unshift(item);
  kv.setItem(RECENTS_KEY, JSON.stringify(list.slice(0, MAX_RECENTS)));
}

export async function listFavorites(uid: string): Promise<FoodItem[]> {
  const snap = await getDocs(collection(db, `users/${uid}/favorites`));
  return snap.docs.map(d => d.data() as FoodItem);
}

export async function toggleFavorite(uid: string, item: FoodItem, on: boolean): Promise<void> {
  const ref = doc(db, `users/${uid}/favorites/${item.id.replace(/[^a-zA-Z0-9]/g, '_')}`);
  if (on) await setDoc(ref, item);
  else await deleteDoc(ref);
}
