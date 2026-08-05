import { scaleFood, sumTotals, toEntry } from '../lib/scale';
import type { FoodItem } from '../types';

const item: FoodItem = {
  id: 'usda:1',
  name: 'Rice',
  brand: null,
  source: 'usda',
  trustScore: 100,
  per100g: { kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  servings: [{ label: '100 g', grams: 100 }],
  barcode: null,
};

it('scales per-100g to 150g as 1.5x', () => {
  expect(scaleFood(item, 150)).toEqual({ kcal: 195, protein: 4, carbs: 42, fat: 0 });
});
it('builds an entry with serving x quantity', () => {
  const e = toEntry(item, { label: '100 g', grams: 100 }, 2, 'lunch', 'manual');
  expect(e.grams).toBe(200);
  expect(e.kcal).toBe(260);
  expect(e.mealType).toBe('lunch');
});
it('sums totals across entries', () => {
  const e1 = toEntry(item, { label: '100 g', grams: 100 }, 1, 'lunch', 'manual');
  expect(sumTotals([e1, e1]).kcal).toBe(260);
});
