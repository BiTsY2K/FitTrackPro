export type FoodSource = 'usda' | 'off' | 'user';

export interface ServingOption {
  label: string;
  grams: number;
}

export interface FoodItem {
  id: string; // `${source}:${externalId}`
  name: string;
  brand: string | null;
  source: FoodSource;
  trustScore: number; // 100 USDA · 90 brand · 70 community (Phase 2 badges)
  per100g: { kcal: number; protein: number; carbs: number; fat: number };
  servings: ServingOption[];
  barcode: string | null;
}

const num = (v: unknown, d = 0): number => {
  const n = typeof v === 'string' ? parseFloat(v) : (v as number);
  return Number.isFinite(n) ? n : d;
};

/** USDA FoodData Central "food" object → FoodItem (per 100g). */
export function normalizeUsda(food: any): FoodItem | null {
  if (!food?.fdcId || !food?.description) return null;
  const byName = (names: string[]) =>
    num(
      food.foodNutrients?.find((n: any) => names.includes((n.nutrientName ?? n.nutrient?.name)?.toLowerCase()))?.value ??
        food.foodNutrients?.find((n: any) => names.includes((n.nutrientName ?? n.nutrient?.name)?.toLowerCase()))?.amount,
    );

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
export function normalizeOff(product: any): FoodItem | null {
  const n = product?.nutriments;
  if (!product?.code || !n) return null;
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
export function dedupe(items: FoodItem[]): FoodItem[] {
  const map = new Map<string, FoodItem>();
  for (const it of items) {
    const key = `${it.name.toLowerCase()}|${(it.brand ?? '').toLowerCase()}`;
    const prev = map.get(key);
    if (!prev || it.trustScore > prev.trustScore) map.set(key, it);
  }
  return [...map.values()];
}
