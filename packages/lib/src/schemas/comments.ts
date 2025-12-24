import { z } from 'zod';

export const createCommentBody = z.object({
  postId: z.string(),
  body: z.string(),
});
export type CreateCommentBody = z.infer<typeof createCommentBody>;
