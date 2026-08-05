import { render, screen } from '@testing-library/react-native';

import Log from '@/../app/(app)/log';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn() }) }));
jest.mock('@/features/food-logging/hooks/useFoodSearch', () => ({ useFoodSearch: () => ({ data: [], isFetching: false }) }));
jest.mock('@/features/food-logging/hooks/useRecents', () => ({
  useRecents: () => [
    {
      id: 'usda:1',
      name: 'Recent food',
      brand: null,
      source: 'usda',
      trustScore: 100,
      per100g: { kcal: 1, protein: 0, carbs: 0, fat: 0 },
      servings: [],
      barcode: null,
    },
  ],
}));

it('shows recents when query is empty', async () => {
  await render(<Log />);
  expect(screen.getByText('Recent')).toBeTruthy();
  expect(screen.getByText('Recent food')).toBeTruthy();
});
