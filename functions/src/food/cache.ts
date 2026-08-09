import { getFirestore } from 'firebase-admin/firestore';

import { FoodItem } from './normalize';

export async function getCachedBarcode(barcode: string): Promise<FoodItem | null> {
  const snap = await getFirestore().doc(`foodCache/${barcode}`).get();
  return snap.exists ? (snap.data() as FoodItem) : null;
}

export async function cacheBarcode(item: FoodItem): Promise<void> {
  if (!item.barcode) return;
  await getFirestore()
    .doc(`foodCache/${item.barcode}`)
    .set({ ...item, cachedAt: Date.now() });
}
