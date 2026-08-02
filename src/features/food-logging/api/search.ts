import { httpsCallable } from 'firebase/functions';

import { functions } from '@/lib/firebase';

import type { FoodItem } from '../types';

export async function searchFood(query: string): Promise<FoodItem[]> {
  const res = await httpsCallable<{ query: string }, { items: FoodItem[] }>(functions, 'searchFood')({ query });
  return res.data.items;
}

export async function lookupBarcode(barcode: string): Promise<FoodItem | null> {
  const res = await httpsCallable<{ barcode: string }, { item: FoodItem | null }>(functions, 'lookupBarcode')({ barcode });
  return res.data.item;
}

export async function submitFood(payload: Record<string, unknown>): Promise<void> {
  await httpsCallable(functions, 'submitFood')(payload);
}
