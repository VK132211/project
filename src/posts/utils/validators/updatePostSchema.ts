import { z } from 'zod';
export const updatePostSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().optional(),
    authorName: z.string().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.content !== undefined ||
      data.authorName !== undefined,
    {
      message: 'At least one field must be provided',
      path: [],
    },
  );

export type updatePostDTO = z.infer<typeof updatePostSchema>;
