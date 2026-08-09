"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUsda = searchUsda;
exports.searchOff = searchOff;
exports.fetchOffBarcode = fetchOffBarcode;
const normalize_1 = require("./normalize");
async function searchUsda(query, apiKey) {
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=15`;
    const res = await fetch(url);
    if (!res.ok)
        return [];
    const data = await res.json();
    return (data.foods ?? []).map(normalize_1.normalizeUsda).filter(Boolean);
}
async function searchOff(query) {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=15`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NutriTrack/1.0 (support@nutritrack.app)' } });
    if (!res.ok)
        return [];
    const data = await res.json();
    return (data.products ?? []).map(normalize_1.normalizeOff).filter(Boolean);
}
async function fetchOffBarcode(barcode) {
    const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
    const res = await fetch(url, { headers: { 'User-Agent': 'NutriTrack/1.0 (support@nutritrack.app)' } });
    if (!res.ok)
        return null;
    const data = await res.json();
    return data.status === 1 ? (0, normalize_1.normalizeOff)(data.product) : null;
}
//# sourceMappingURL=sources.js.map