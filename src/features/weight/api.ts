import { addDoc, collection, getDocs, limit, orderBy, query } from 'firebase/firestore';

import { db } from '@/lib/firebase';

export interface WeightEntry {
  id: string;
  kg: number;
  takenAt: number;
}

export async function addWeight(uid: string, kg: number): Promise<void> {
  await addDoc(collection(db, `users/${uid}/weights`), { kg, takenAt: Date.now() });
}

export async function listWeights(uid: string, max = 30): Promise<WeightEntry[]> {
  const q = query(collection(db, `users/${uid}/weights`), orderBy('takenAt', 'desc'), limit(max));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<WeightEntry, 'id'>) }));
}
