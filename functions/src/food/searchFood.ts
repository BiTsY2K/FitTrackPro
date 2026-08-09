import { HttpsError, onCall } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';

import { dedupe } from './normalize';
import { searchOff, searchUsda } from './sources';

const USDA_API_KEY = defineSecret('USDA_API_KEY');
export const searchFood = onCall(
  {
    enforceAppCheck: true,
    secrets: [USDA_API_KEY],
    maxInstances: 20,
  },
  async (req: any) => {
    const query = String(req.data?.query ?? '').trim();
    if (query.length < 2) throw new HttpsError('invalid-argument', 'Query too short');
    // Fan out; tolerate either source failing.
    const [udsa, off] = await Promise.allSettled([searchUsda(query, USDA_API_KEY.value()), searchOff(query)]);
    const items = [...(udsa.status === 'fulfilled' ? udsa.value : []), ...(off.status === 'fulfilled' ? off.value : [])];
    return { items: dedupe(items).slice(0, 25) };
  },
);
