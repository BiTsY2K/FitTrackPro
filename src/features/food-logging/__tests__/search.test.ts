import { searchFood } from '../api/search';

// We mock the callable transport (the proxy is exercised in functions tests).
jest.mock('@/lib/firebase', () => ({ functions: {} }));
jest.mock('firebase/functions', () => ({
  httpsCallable:
    () =>
    async ({ query }: { query: string }) => ({
      data: {
        items: [
          {
            id: 'usda:1',
            name: `match:${query}`,
            brand: null,
            source: 'usda',
            trustScore: 100,
            per100g: { kcal: 100, protein: 1, carbs: 1, fat: 1 },
            servings: [],
            barcode: null,
          },
        ],
      },
    }),
}));

it('returns normalized items from the proxy', async () => {
  const items = await searchFood('chicken');
  expect(items[0].name).toBe('match:chicken');
  expect(items[0].trustScore).toBe(100);
});
