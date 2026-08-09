"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedBarcode = getCachedBarcode;
exports.cacheBarcode = cacheBarcode;
const firestore_1 = require("firebase-admin/firestore");
async function getCachedBarcode(barcode) {
    const snap = await (0, firestore_1.getFirestore)().doc(`foodCache/${barcode}`).get();
    return snap.exists ? snap.data() : null;
}
async function cacheBarcode(item) {
    if (!item.barcode)
        return;
    await (0, firestore_1.getFirestore)()
        .doc(`foodCache/${item.barcode}`)
        .set({ ...item, cachedAt: Date.now() });
}
//# sourceMappingURL=cache.js.map