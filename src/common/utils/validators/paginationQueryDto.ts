import { z } from 'zod';

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? '1'))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Page must be a positive number',
    }),

  limit: z
    .string()
    .optional()
    .transform((val) => parseInt(val ?? '10'))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Limit must be a positive number',
    }),
});

export type paginationQueryDto = z.infer<typeof paginationSchema>;
