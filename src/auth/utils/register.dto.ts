import { z } from 'zod';
export const RegisterSchema = z.object({
  email: z.string().email('Please Provide a valid email'),
  password: z.string(),
  name: z.string(),
});

export type RegisterDto = z.infer<typeof RegisterSchema>;
