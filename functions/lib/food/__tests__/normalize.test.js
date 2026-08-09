"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalize_1 = require("../normalize");
describe('normalizeUsda', () => {
    it('maps a USDA food to per-100g FoodItem', () => {
        const item = (0, normalize_1.normalizeUsda)({
            fdcId: 1,
            description: 'Chicken breast',
            foodNutrients: [
                { nutrientName: 'Energy', value: 165 },
                { nutrientName: 'Protein', value: 31 },
                { nutrientName: 'Carbohydrate, by difference', value: 0 },
                { nutrientName: 'Total lipid (fat)', value: 3.6 },
            ],
        });
        expect(item.id).toBe('usda:1');
        expect(item.trustScore).toBe(100);
        expect(item.per100g.protein).toBe(31);
    });
    it('returns null for malformed payloads', () => {
        expect((0, normalize_1.normalizeUsda)({})).toBeNull();
    });
});
describe('normalizeOff', () => {
    it('uses energy-kcal_100g and brand trust', () => {
        const item = (0, normalize_1.normalizeOff)({
            code: '123',
            product_name: 'Bar',
            brands: 'Acme',
            nutriments: { 'energy-kcal_100g': 400, proteins_100g: 10, carbohydrates_100g: 50, fat_100g: 15 },
        });
        expect(item.source).toBe('off');
        expect(item.trustScore).toBe(90);
        expect(item.per100g.kcal).toBe(400);
    });
});
describe('dedupe', () => {
    it('keeps the highest trust score for duplicate name+brand', () => {
        const a = {
            id: 'off:1',
            name: 'Milk',
            brand: 'X',
            source: 'off',
            trustScore: 70,
            per100g: { kcal: 1, protein: 0, carbs: 0, fat: 0 },
            servings: [],
            barcode: null,
        };
        const b = { ...a, id: 'usda:1', source: 'usda', trustScore: 100 };
        expect((0, normalize_1.dedupe)([a, b])).toHaveLength(1);
        expect((0, normalize_1.dedupe)([a, b])[0].trustScore).toBe(100);
    });
});
//# sourceMappingURL=normalize.test.js.map