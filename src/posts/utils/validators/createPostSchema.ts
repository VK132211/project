import { z } from 'zod';
export const createPostSchema = z
  .object({
    title: z.string(),
    content: z.string(),
    authorName: z.string(),
  })
  .required();

export type createPostDTO = z.infer<typeof createPostSchema>;
