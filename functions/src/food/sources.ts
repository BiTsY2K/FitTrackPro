import { type FoodItem, normalizeOff, normalizeUsda } from './normalize';

export async function searchUsda(query: string, apiKey: string): Promise<FoodItem[]> {
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(query)}&pageSize=15`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data: any = await res.json();
  return (data.foods ?? []).map(normalizeUsda).filter(Boolean) as FoodItem[];
}

export async function searchOff(query: string): Promise<FoodItem[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=15`;
  const res = await fetch(url, { headers: { 'User-Agent': 'NutriTrack/1.0 (support@nutritrack.app)' } });
  if (!res.ok) return [];
  const data: any = await res.json();
  return (data.products ?? []).map(normalizeOff).filter(Boolean) as FoodItem[];
}

export async function fetchOffBarcode(barcode: string): Promise<FoodItem | null> {
  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'NutriTrack/1.0 (support@nutritrack.app)' } });
  if (!res.ok) return null;
  const data: any = await res.json();
  return data.status === 1 ? normalizeOff(data.product) : null;
}
