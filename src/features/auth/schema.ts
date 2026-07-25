import { z } from 'zod';

export const emailSchema = z.string().trim().toLowerCase().email('Enter a valid email');
export const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Za-z]/, 'Include a letter')
  .regex(/[0-9]/, 'Include a number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Required'),
});

export const signupSchema = z
  .object({ email: emailSchema, password: passwordSchema, confirm: z.string() })
  .refine(v => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export const resetSchema = z.object({ email: emailSchema });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
