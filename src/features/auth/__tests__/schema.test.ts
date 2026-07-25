import { loginSchema, passwordSchema, signupSchema } from '../schema';

describe('auth schemas', () => {
  it('rejects weak passwords', () => {
    expect(passwordSchema.safeParse('short').success).toBe(false); // too short
    expect(passwordSchema.safeParse('allletters').success).toBe(false); // no number
    expect(passwordSchema.safeParse('12345678').success).toBe(false); // no letter
    expect(passwordSchema.safeParse('letters99').success).toBe(true);
  });
  it('normalizes and validates email', () => {
    const r = loginSchema.safeParse({ email: '  Foo@Bar.COM ', password: 'x' });
    expect(r.success && r.data.email).toBe('foo@bar.com');
  });
  it('requires matching confirm', () => {
    expect(signupSchema.safeParse({ email: 'a@b.co', password: 'letters99', confirm: 'nope99xx' }).success).toBe(false);
  });
});
