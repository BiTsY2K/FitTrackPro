"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFood = exports.submitFood = exports.lookupBarcode = exports.recordAuthAttempt = exports.beforeSignIn = exports.healthCheckCallable = exports.healthCheck = void 0;
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
var rateLimit_1 = require("./auth/rateLimit");
Object.defineProperty(exports, "beforeSignIn", { enumerable: true, get: function () { return rateLimit_1.beforeSignIn; } });
Object.defineProperty(exports, "recordAuthAttempt", { enumerable: true, get: function () { return rateLimit_1.recordAuthAttempt; } });
var lookupBarcode_1 = require("./food/lookupBarcode");
Object.defineProperty(exports, "lookupBarcode", { enumerable: true, get: function () { return lookupBarcode_1.lookupBarcode; } });
Object.defineProperty(exports, "submitFood", { enumerable: true, get: function () { return lookupBarcode_1.submitFood; } });
var searchFood_1 = require("./food/searchFood");
Object.defineProperty(exports, "searchFood", { enumerable: true, get: function () { return searchFood_1.searchFood; } });
//# sourceMappingURL=index.js.map