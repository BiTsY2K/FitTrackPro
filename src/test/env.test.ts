import { z } from 'zod';

describe('env schema', () => {
  const schema = z.object({ FIREBASE_API_KEY: z.string().min(1) });
  it('rejects empty api key', () => {
    expect(schema.safeParse({ FIREBASE_API_KEY: '' }).success).toBe(false);
  });
  it('accepts a valid api key', () => {
    expect(schema.safeParse({ FIREBASE_API_KEY: 'abc' }).success).toBe(true);
  });
});
