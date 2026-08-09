"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitFood = exports.lookupBarcode = void 0;
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const cache_1 = require("./cache");
const sources_1 = require("./sources");
exports.lookupBarcode = (0, https_1.onCall)({ enforceAppCheck: true, maxInstances: 20 }, async (req) => {
    const barcode = String(req.data?.barcode ?? '').trim();
    if (!/^\d{8,14}$/.test(barcode))
        throw new https_1.HttpsError('invalid-argument', 'Invalid barcode');
    const cached = await (0, cache_1.getCachedBarcode)(barcode);
    if (cached)
        return { item: cached, cached: true };
    const item = await (0, sources_1.fetchOffBarcode)(barcode);
    if (!item)
        return { item: null, cached: false };
    await (0, cache_1.cacheBarcode)(item);
    return { item, cached: false };
});
// "Product not found" community submission (server-only collection).
exports.submitFood = (0, https_1.onCall)({ enforceAppCheck: true }, async (req) => {
    const payload = req.data ?? {};
    if (!req.auth)
        throw new https_1.HttpsError('unauthenticated', 'Sign in required');
    await (0, firestore_1.getFirestore)().collection('pendingFoods').add({
        payload,
        submittedBy: req.auth.uid,
        status: 'pending',
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    return { ok: true };
});
//# sourceMappingURL=lookupBarcode.js.map