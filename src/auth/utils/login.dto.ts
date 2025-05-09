import { z } from 'zod';
export const LoginSchema = z
  .object({
    email: z.string().email('Please Provide a valid email'),
    password: z.string()
  })

export type LoginDto = z.infer<typeof LoginSchema>;

