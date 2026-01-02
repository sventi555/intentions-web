import { z } from '@hono/zod-openapi';

export const createCommentBody = z.object({
  postId: z.string(),
  body: z.string(),
});

export const deleteCommentParams = z.object({ id: z.string() });
