"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeUsda = normalizeUsda;
exports.normalizeOff = normalizeOff;
exports.dedupe = dedupe;
const num = (v, d = 0) => {
    const n = typeof v === 'string' ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : d;
};
/** USDA FoodData Central "food" object → FoodItem (per 100g). */
function normalizeUsda(food) {
    if (!food?.fdcId || !food?.description)
        return null;
    const byName = (names) => num(food.foodNutrients?.find((n) => names.includes((n.nutrientName ?? n.nutrient?.name)?.toLowerCase()))?.value ??
        food.foodNutrients?.find((n) => names.includes((n.nutrientName ?? n.nutrient?.name)?.toLowerCase()))?.amount);
    return {
        id: `usda:${food.fdcId}`,
        name: String(food.description),
        brand: food.brandOwner ?? null,
        source: 'usda',
        trustScore: 100,
        per100g: {
            kcal: byName(['energy']),
            protein: byName(['protein']),
            carbs: byName(['carbohydrate, by difference']),
            fat: byName(['total lipid (fat)']),
        },
        servings: [
            { label: '100 g', grams: 100 },
            { label: '1 g', grams: 1 },
        ],
        barcode: food.gtinUpc ?? null,
    };
}
/** Open Food Facts product → FoodItem (per 100g). */
function normalizeOff(product) {
    const n = product?.nutriments;
    if (!product?.code || !n)
        return null;
    const kcal = num(n['energy-kcal_100g'], num(n['energy-kcal']));
    return {
        id: `off:${product.code}`,
        name: product.product_name || product.generic_name || 'Unknown product',
        brand: product.brands ?? null,
        source: 'off',
        trustScore: product.brands ? 90 : 70,
        per100g: {
            kcal,
            protein: num(n.proteins_100g),
            carbs: num(n.carbohydrates_100g),
            fat: num(n.fat_100g),
        },
        servings: [
            { label: '100 g', grams: 100 },
            ...(num(product.serving_quantity) > 0 ? [{ label: product.serving_size || '1 serving', grams: num(product.serving_quantity) }] : []),
        ],
        barcode: String(product.code),
    };
}
/** Remove obvious duplicates (same name+brand) keeping the highest trust score. */
function dedupe(items) {
    const map = new Map();
    for (const it of items) {
        const key = `${it.name.toLowerCase()}|${(it.brand ?? '').toLowerCase()}`;
        const prev = map.get(key);
        if (!prev || it.trustScore > prev.trustScore)
            map.set(key, it);
    }
    return [...map.values()];
}
//# sourceMappingURL=normalize.js.map