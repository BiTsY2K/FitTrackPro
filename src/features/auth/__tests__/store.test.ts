import { useAuthStore } from '../store';

it('reset returns to loading-less unauthed defaults', () => {
  useAuthStore.getState().set({ status: 'authed', emailVerified: true });
  useAuthStore.getState().reset();
  expect(useAuthStore.getState().status).toBe('loading');
  expect(useAuthStore.getState().emailVerified).toBe(false);
});
