"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchFood = void 0;
const https_1 = require("firebase-functions/https");
const params_1 = require("firebase-functions/params");
const normalize_1 = require("./normalize");
const sources_1 = require("./sources");
const USDA_API_KEY = (0, params_1.defineSecret)('USDA_API_KEY');
exports.searchFood = (0, https_1.onCall)({
    enforceAppCheck: true,
    secrets: [USDA_API_KEY],
    maxInstances: 20,
}, async (req) => {
    const query = String(req.data?.query ?? '').trim();
    if (query.length < 2)
        throw new https_1.HttpsError('invalid-argument', 'Query too short');
    // Fan out; tolerate either source failing.
    const [udsa, off] = await Promise.allSettled([(0, sources_1.searchUsda)(query, USDA_API_KEY.value()), (0, sources_1.searchOff)(query)]);
    const items = [...(udsa.status === 'fulfilled' ? udsa.value : []), ...(off.status === 'fulfilled' ? off.value : [])];
    return { items: (0, normalize_1.dedupe)(items).slice(0, 25) };
});
//# sourceMappingURL=searchFood.js.map