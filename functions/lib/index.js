"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckCallable = exports.healthCheck = void 0;
const app_1 = require("firebase-admin/app");
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
(0, app_1.initializeApp)();
(0, v2_1.setGlobalOptions)({ region: 'us-central1', maxInstances: 10 });
const VERSION = '1.0.0';
// HTTP health check (used by CI smoke + uptime monitors).
exports.healthCheck = (0, https_1.onRequest)({ cors: true }, (_req, res) => {
    res.status(200).json({ status: 'ok', version: VERSION, ts: Date.now() });
});
// Callable health check (App Check enforced) — proves client→Functions auth path.
exports.healthCheckCallable = (0, https_1.onCall)({ enforceAppCheck: true }, () => ({
    status: 'ok',
    version: VERSION,
}));
//# sourceMappingURL=index.js.map