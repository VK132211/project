import { z } from 'zod';

export class PaginationSchema {
  static schema = z.object({
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
    title: z.string().max(100).optional(),
  });

  static parse(input: unknown) {
    return this.schema.parse(input);
  }
}

export type FindPostsQueryDto = z.infer<typeof PaginationSchema.schema>;
