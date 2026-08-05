import type { FoodEntry, FoodItem, LogOrigin, MealType, ServingOption } from '../types';

const r = (n: number) => Math.round(n);

/** Scale a per-100g item to an arbitrary gram amount. */
export function scaleFood(item: FoodItem, grams: number) {
  const f = grams / 100;
  return {
    kcal: r(item.per100g.kcal * f),
    protein: r(item.per100g.protein * f),
    carbs: r(item.per100g.carbs * f),
    fat: r(item.per100g.fat * f),
  };
}

/** Build a loggable entry from an item + chosen serving + quantity. */
export function toEntry(item: FoodItem, serving: ServingOption, quantity: number, mealType: MealType, origin: LogOrigin): FoodEntry {
  const grams = serving.grams * quantity;
  const macros = scaleFood(item, grams);
  return {
    foodId: item.id,
    name: item.name,
    brand: item.brand,
    grams,
    ...macros,
    mealType,
    origin,
    source: item.source,
    trustScore: item.trustScore,
    createdAt: Date.now(),
  };
}

export function sumTotals(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({ kcal: acc.kcal + e.kcal, protein: acc.protein + e.protein, carbs: acc.carbs + e.carbs, fat: acc.fat + e.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}
