import { FieldValue, getFirestore } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { cacheBarcode, getCachedBarcode } from './cache';
import { fetchOffBarcode } from './sources';

export const lookupBarcode = onCall({ enforceAppCheck: true, maxInstances: 20 }, async req => {
  const barcode = String(req.data?.barcode ?? '').trim();
  if (!/^\d{8,14}$/.test(barcode)) throw new HttpsError('invalid-argument', 'Invalid barcode');

  const cached = await getCachedBarcode(barcode);
  if (cached) return { item: cached, cached: true };

  const item = await fetchOffBarcode(barcode);
  if (!item) return { item: null, cached: false };
  await cacheBarcode(item);
  return { item, cached: false };
});

// "Product not found" community submission (server-only collection).
export const submitFood = onCall({ enforceAppCheck: true }, async req => {
  const payload = req.data ?? {};
  if (!req.auth) throw new HttpsError('unauthenticated', 'Sign in required');
  await getFirestore().collection('pendingFoods').add({
    payload,
    submittedBy: req.auth.uid,
    status: 'pending',
    createdAt: FieldValue.serverTimestamp(),
  });
  return { ok: true };
});
