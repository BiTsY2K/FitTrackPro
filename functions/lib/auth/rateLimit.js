"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.beforeSignIn = exports.recordAuthAttempt = void 0;
const node_crypto_1 = require("node:crypto");
const firestore_1 = require("firebase-admin/firestore");
const https_1 = require("firebase-functions/v2/https");
const identity_1 = require("firebase-functions/v2/identity");
const MAX = 5;
const WINDOW_MS = 15 * 60 * 1000;
const hash = (email) => (0, node_crypto_1.createHash)('sha256').update(email.toLowerCase()).digest('hex');
// Client reports attempts (App Check enforced). Authoritative throttling is Firebase Auth itself;
// this layer adds cross-device account lock + monitoring.
exports.recordAuthAttempt = (0, https_1.onCall)({ enforceAppCheck: true }, async (req) => {
    const email = String(req.data?.email ?? '');
    const success = Boolean(req.data?.success);
    if (!email)
        throw new https_1.HttpsError('invalid-argument', 'email required');
    const ref = (0, firestore_1.getFirestore)().doc(`authAttempts/${hash(email)}`);
    const now = Date.now();
    if (success) {
        await ref.delete().catch(() => undefined);
        return { ok: true };
    }
    const snap = await ref.get();
    const data = snap.exists ? snap.data() : { count: 0, first: now };
    const windowed = now - (data.first ?? now) > WINDOW_MS ? { count: 0, first: now } : data;
    const count = (windowed.count ?? 0) + 1;
    const lockedUntil = count >= MAX ? now + WINDOW_MS : 0;
    await ref.set({ count, first: windowed.first, lockedUntil, updatedAt: firestore_1.FieldValue.serverTimestamp() }, { merge: true });
    return { ok: true, locked: lockedUntil > now, lockedUntil };
});
// Blocking function: rejects sign-in (even with correct password) during an active lock window.
// Requires Identity Platform (GCIP) upgrade.
exports.beforeSignIn = (0, identity_1.beforeUserSignedIn)(async (event) => {
    const email = event.data?.email;
    if (!email)
        return;
    const snap = await (0, firestore_1.getFirestore)()
        .doc(`authAttempts/${hash(email)}`)
        .get();
    const lockedUntil = snap.exists ? (snap.data().lockedUntil ?? 0) : 0;
    if (lockedUntil > Date.now()) {
        throw new https_1.HttpsError('permission-denied', 'Account temporarily locked due to repeated failures. Try again later.');
    }
});
//# sourceMappingURL=rateLimit.js.map