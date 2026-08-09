import { initializeApp } from 'firebase-admin/app';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onCall, onRequest } from 'firebase-functions/v2/https';

initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const VERSION = '1.0.0';

// HTTP health check (used by CI smoke + uptime monitors).
export const healthCheck = onRequest({ cors: true }, (_req, res) => {
  res.status(200).json({ status: 'ok', version: VERSION, ts: Date.now() });
});

// Callable health check (App Check enforced) — proves client→Functions auth path.
export const healthCheckCallable = onCall({ enforceAppCheck: true }, () => ({
  status: 'ok',
  version: VERSION,
}));

export { beforeSignIn, recordAuthAttempt } from './auth/rateLimit';
export { lookupBarcode, submitFood } from './food/lookupBarcode';
export { searchFood } from './food/searchFood';
